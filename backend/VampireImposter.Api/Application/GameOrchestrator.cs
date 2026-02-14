using VampireImposter.GameEngine.Domain;
using VampireImposter.Storage;
using VampireImposter.Api.Application.DTO;

namespace VampireImposter.Api.Application;

public sealed class GameOrchestrator : IGameOrchestrator
{
    private readonly IGameStore _games;

    // If you add players as separate sessions (recommended):
    // private readonly IPlayerStore _players;

    public GameOrchestrator(IGameStore games /*, IPlayerStore players */)
    {
        _games = games;
        // _players = players;
    }

    public Task<CreateLobbyResult> CreateLobbyAsync(CreateLobbyCommand command, CancellationToken ct)
    {
        // TODO: validate player session, create Game via engine/factory, Upsert in _games
        // No logic here for now.
        throw new NotImplementedException();
    }

    public Task<JoinLobbyResult> JoinLobbyAsync(JoinLobbyCommand command, CancellationToken ct)
    {
        // TODO: load game from _games, validate lobby status, add player, upsert
        throw new NotImplementedException();
    }

    public Task<IReadOnlyList<LobbySummary>> ListOpenLobbiesAsync(CancellationToken ct)
    {
        // TODO: read _games.GetAll(), filter not-started, map to summaries
        throw new NotImplementedException();
    }

    public Task<LobbySnapshotResult> GetLobbySnapshotAsync(GetLobbySnapshotQuery query, CancellationToken ct)
    {
        // TODO: load game, map players (and hydrate names via player store if you have it)
        throw new NotImplementedException();
    }
}
