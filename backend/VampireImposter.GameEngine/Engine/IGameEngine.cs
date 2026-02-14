using VampireImposter.GameEngine.Snapshots;

namespace VampireImposter.GameEngine;

public interface IGameEngine
{
    // Game lifecycle
    GameSnapshot CreateGame();
    GameSnapshot GetGame(Guid gameId);

    GameSnapshot StartGame(Guid gameId);
    GameSnapshot EndGame(Guid gameId);

    // Players
    GameSnapshot AddPlayer(Guid gameId, string playerName);
    GameSnapshot RemovePlayer(Guid gameId, Guid playerId);

    // Rounds
    GameSnapshot StartRound(Guid gameId);

    GameSnapshot CastVote(Guid gameId, int roundNumber, Guid voterId, Guid targetId);

    /// <summary>
    /// Reveals the vote outcome for the round (e.g., who gets eliminated or tie/no elimination)
    /// and moves the round to the Reveal phase.
    /// </summary>
    GameSnapshot RevealVotes(Guid gameId, int roundNumber);

    /// <summary>
    /// Records the vampire target for the round. You can validate caller permissions in the implementation.
    /// </summary>
    GameSnapshot SetVampireDecision(Guid gameId, int roundNumber, Guid vampirePlayerId, Guid targetId);

    /// <summary>
    /// Records the hunter target for the round (usually only if hunter was eliminated).
    /// </summary>
    GameSnapshot SetHunterDecision(Guid gameId, int roundNumber, Guid hunterPlayerId, Guid targetId);

    /// <summary>
    /// Finalizes the round, applies decisions to players, checks win conditions,
    /// and moves the game forward.
    /// </summary>
    GameSnapshot EndRound(Guid gameId, int roundNumber);
}
