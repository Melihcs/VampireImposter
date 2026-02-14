using System.Collections.Concurrent;
using VampireImposter.GameEngine.Domain;
using VampireImposter.GameEngine.Snapshots;
using VampireImposter.Storage;

namespace VampireImposter.GameEngine;

/// <summary>
/// Orchestrates game flow (validations, phase transitions, applying outcomes).
/// Stores everything in-memory via IGameStore.
/// </summary>
public sealed class GameEngine : IGameEngine
{
    private readonly IGameStore _store;

    // Simple per-game locks so two requests can't corrupt the same game state.
    private readonly ConcurrentDictionary<Guid, object> _locks = new();

    public GameEngine(IGameStore store)
    {
        _store = store ?? throw new ArgumentNullException(nameof(store));
    }

    public GameSnapshot CreateGame()
    {
        var game = new Game(Guid.NewGuid());
        _store.Upsert(game);
        return SnapshotMapper.ToSnapshot(game);
    }

    public GameSnapshot GetGame(Guid gameId)
    {
        var game = _store.Get(gameId);
        return SnapshotMapper.ToSnapshot(game);
    }

    public GameSnapshot StartGame(Guid gameId)
    {
        return WithGameLock(gameId, game =>
        {
            game.Start();
            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    public GameSnapshot EndGame(Guid gameId)
    {
        return WithGameLock(gameId, game =>
        {
            game.Finish();
            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    public GameSnapshot AddPlayer(Guid gameId, string playerName)
    {
        return WithGameLock(gameId, game =>
        {
            game.AddPlayer(Guid.NewGuid(), playerName);
            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    public GameSnapshot RemovePlayer(Guid gameId, Guid playerId)
    {
        return WithGameLock(gameId, game =>
        {
            game.RemovePlayer(playerId);
            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    public GameSnapshot StartRound(Guid gameId)
    {
        return WithGameLock(gameId, game =>
        {
            var round = game.StartNextRound();
            // Round starts in Voting phase already (per your Round ctor).
            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    public GameSnapshot CastVote(Guid gameId, int roundNumber, Guid voterId, Guid targetId)
    {
        return WithGameLock(gameId, game =>
        {
            EnsureInProgress(game);

            var voter = game.GetPlayer(voterId);
            var target = game.GetPlayer(targetId);

            if (!voter.IsAlive) throw new InvalidOperationException("Dead players cannot vote.");
            if (!target.IsAlive) throw new InvalidOperationException("You cannot vote for a dead player.");

            var round = game.GetRound(roundNumber);
            round.CastVote(voterId, targetId);

            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    public GameSnapshot RevealVotes(Guid gameId, int roundNumber)
    {
        return WithGameLock(gameId, game =>
        {
            EnsureInProgress(game);

            var round = game.GetRound(roundNumber);

            // Determine elimination (tie => null, no votes => null)
            var eliminated = round.GetLeadingTarget();

            round.Reveal(eliminated);

            // NOTE: We do NOT kill the player here yet.
            // We apply outcomes in EndRound so vampire/hunter decisions can also be applied together.

            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    public GameSnapshot SetVampireDecision(Guid gameId, int roundNumber, Guid vampirePlayerId, Guid targetId)
    {
        return WithGameLock(gameId, game =>
        {
            EnsureInProgress(game);

            var vampire = game.GetPlayer(vampirePlayerId);
            var target = game.GetPlayer(targetId);

            if (!vampire.IsAlive) throw new InvalidOperationException("Dead vampires cannot act.");
            if (!target.IsAlive) throw new InvalidOperationException("Cannot target a dead player.");

            // If you want strict role enforcement, do it here:
            if (vampire.Role != PlayerRole.Vampire)
                throw new InvalidOperationException("Only a vampire can set the vampire decision.");

            var round = game.GetRound(roundNumber);

            // IMPORTANT:
            // Your current Round class (as created earlier) does not yet have VampireTargetPlayerId/SetVampireDecision.
            // Add these to Round:
            //   public Guid? VampireTargetPlayerId { get; private set; }
            //   public void SetVampireDecision(Guid targetId) { EnsurePhase(RoundPhase.Reveal); VampireTargetPlayerId = targetId; }
            round.SetVampireDecision(targetId);

            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    public GameSnapshot SetHunterDecision(Guid gameId, int roundNumber, Guid hunterPlayerId, Guid targetId)
    {
        return WithGameLock(gameId, game =>
        {
            EnsureInProgress(game);

            var hunter = game.GetPlayer(hunterPlayerId);
            var target = game.GetPlayer(targetId);

            if (hunter.Role != PlayerRole.Hunter)
                throw new InvalidOperationException("Only the hunter can set the hunter decision.");

            // Usually hunter can decide only if they were eliminated this round. Enforce if you want:
            var round = game.GetRound(roundNumber);
            if (round.EliminatedPlayerId != hunterPlayerId)
                throw new InvalidOperationException("Hunter decision is only allowed if the hunter was eliminated this round.");

            if (!target.IsAlive) throw new InvalidOperationException("Cannot target a dead player.");

            round.SetHunterDecision(targetId);

            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    public GameSnapshot EndRound(Guid gameId, int roundNumber)
    {
        return WithGameLock(gameId, game =>
        {
            EnsureInProgress(game);

            var round = game.GetRound(roundNumber);

            // Apply vote elimination
            if (round.EliminatedPlayerId is Guid eliminatedId)
                game.GetPlayer(eliminatedId).Kill();

            // Apply vampire kill (if set)
            if (round.VampireTargetPlayerId is Guid vampireTargetId)
                game.GetPlayer(vampireTargetId).Kill();

            // Apply hunter kill (if set)
            if (round.HunterTargetPlayerId is Guid hunterTargetId)
                game.GetPlayer(hunterTargetId).Kill();

            round.Finish();

            // Win-condition checks would go here (example placeholder)
            // if (IsGameOver(game)) game.Finish();

            _store.Upsert(game);
            return SnapshotMapper.ToSnapshot(game);
        });
    }

    // ----------------------------
    // helpers
    // ----------------------------

    private GameSnapshot WithGameLock(Guid gameId, Func<Game, GameSnapshot> action)
    {
        if (gameId == Guid.Empty) throw new ArgumentException("Game id cannot be empty.", nameof(gameId));

        var gate = _locks.GetOrAdd(gameId, _ => new object());
        lock (gate)
        {
            var game = _store.Get(gameId);
            return action(game);
        }
    }

    private static void EnsureInProgress(Game game)
    {
        if (game.Status != GameStatus.InProgress)
            throw new InvalidOperationException("Game is not in progress.");
    }
}


internal static class SnapshotMapper
{
    public static GameSnapshot ToSnapshot(Game game)
    {
        var players = game.Players
            .Select(p => new PlayerSnapshot(p.Id, p.Name, p.IsAlive))
            .ToList();

        RoundSnapshot? currentRound = null;
        RoundResultSnapshot? lastResult = null;

        var round = game.Rounds.LastOrDefault();
        if (round is not null)
        {
            currentRound = new RoundSnapshot(
                round.Id,
                round.RoundNumber,
                round.Phase.ToString(),
                round.Votes.Select(v => new VoteSnapshot(v.VoterId, v.TargetId)).ToList()
            );

            // "LastResult": if the round is in Reveal/Finished, you can expose outcomes
            if (round.Phase is RoundPhase.Reveal or RoundPhase.Finished)
            {
                lastResult = new RoundResultSnapshot(
                    round.RoundNumber,
                    round.EliminatedPlayerId,
                    round.VampireTargetPlayerId,
                    round.HunterTargetPlayerId
                );
            }
        }

        return new GameSnapshot(
            game.Id,
            game.Status.ToString(),
            game.CurrentRoundNumber,
            round?.Phase.ToString(),
            players,
            currentRound,
            lastResult
        );
    }
}
