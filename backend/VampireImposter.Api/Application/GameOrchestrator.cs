using VampireImposter.GameEngine.Domain;
using VampireImposter.Storage;
using VampireImposter.Api.Application.DTO;
using VampireImposter.Api.Application.Security;

namespace VampireImposter.Api.Application;

public sealed class GameOrchestrator : IGameOrchestrator
{
    private readonly IGameStore _games;
    private readonly IGamePasscodeService _passcodeService;

    // If you add players as separate sessions (recommended):
    // private readonly IPlayerStore _players;

    public GameOrchestrator(IGameStore games, IGamePasscodeService passcodeService /*, IPlayerStore players */)
    {
        _games = games;
        _passcodeService = passcodeService;
    }

    public Task<CreateLobbyResult> CreateLobbyAsync(CreateLobbyCommand command, CancellationToken ct)
    {
        // TODO: validate player session, create Game via engine/factory, Upsert in _games
        // No logic here for now.
        throw new NotImplementedException();
    }

    public Task<JoinLobbyResult> JoinLobbyAsync(JoinLobbyCommand command, CancellationToken ct)
    {
        if (!_games.TryGet(command.GameId, out var game) || game is null)
            return Task.FromResult(new JoinLobbyResult(JoinLobbyStatus.NotFound));

        var isPasscodeValid = _passcodeService.Verify(command.Passcode, game.PasscodeHash);
        var joinResult = game.JoinLobby(command.PlayerId, command.PlayerName, isPasscodeValid);

        if (joinResult.Status == GameJoinLobbyStatus.Success)
            _games.Upsert(game);

        return Task.FromResult(joinResult.Status switch
        {
            GameJoinLobbyStatus.Success => new JoinLobbyResult(JoinLobbyStatus.Success, game),
            GameJoinLobbyStatus.InvalidPasscode => new JoinLobbyResult(JoinLobbyStatus.InvalidPasscode),
            GameJoinLobbyStatus.NotJoinable => new JoinLobbyResult(JoinLobbyStatus.NotJoinable),
            GameJoinLobbyStatus.Conflict => new JoinLobbyResult(JoinLobbyStatus.Conflict, Error: joinResult.Error),
            _ => new JoinLobbyResult(JoinLobbyStatus.Conflict, Error: "Unknown join outcome.")
        });
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
