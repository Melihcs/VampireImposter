using VampireImposter.GameEngine.Domain;
using VampireImposter.Storage;
using VampireImposter.Api.Application.DTO;
using VampireImposter.Api.Application.Security;

namespace VampireImposter.Api.Application;

public sealed class GameOrchestrator : IGameOrchestrator
{
    private const int DefaultMaxPlayers = 10;
    private const int DefaultDiscussionTimeSeconds = 60;
    private const int DefaultVotingTimeSeconds = 60;

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
        ct.ThrowIfCancellationRequested();

        if (command.HostPlayerId == Guid.Empty)
            throw new ArgumentException("Host player id cannot be empty.", nameof(command));

        var passcodeHash = string.IsNullOrWhiteSpace(command.Password)
            ? string.Empty
            : _passcodeService.Hash(command.Password);

        var game = new Game(
            id: Guid.NewGuid(),
            name: null,
            hostPlayerId: command.HostPlayerId,
            maxPlayers: DefaultMaxPlayers,
            discussionTime: DefaultDiscussionTimeSeconds,
            votingTime: DefaultVotingTimeSeconds,
            passcodeHash: passcodeHash);

        var hostName = $"Host-{command.HostPlayerId:N}"[..13];
        game.AddPlayer(command.HostPlayerId, hostName);
        _games.Upsert(game);

        return Task.FromResult(new CreateLobbyResult(game.Id));
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
        ct.ThrowIfCancellationRequested();

        var summaries = _games
            .GetAll()
            .Where(g => g.Status == GameStatus.Lobby)
            .OrderByDescending(g => g.CreatedAtUtc)
            .Select(g => new LobbySummary(
                GameId: g.Id,
                HostPlayerId: g.HostPlayerId,
                PlayerCount: g.Players.Count,
                PasswordProtected: g.PasscodeRequired,
                CreatedAtUtc: g.CreatedAtUtc.UtcDateTime))
            .ToArray();

        return Task.FromResult<IReadOnlyList<LobbySummary>>(summaries);
    }

    public Task<LobbySnapshotResult> GetLobbySnapshotAsync(GetLobbySnapshotQuery query, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (!_games.TryGet(query.GameId, out var game) || game is null)
            throw new KeyNotFoundException("Game not found.");

        if (!game.Players.Any(p => p.Id == query.PlayerId))
            throw new UnauthorizedAccessException("Player is not in this lobby.");

        var players = game.Players
            .Select(p => new LobbyPlayerDto(p.Id, p.Name))
            .ToArray();

        var snapshot = new LobbySnapshotResult(
            GameId: game.Id,
            Status: game.Status.ToString(),
            HostPlayerId: game.HostPlayerId,
            Players: players);

        return Task.FromResult(snapshot);
    }
}
