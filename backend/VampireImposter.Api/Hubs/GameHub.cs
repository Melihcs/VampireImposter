using Microsoft.AspNetCore.SignalR;
using VampireImposter.Api.Application.Concurrency;
using VampireImposter.Storage;

namespace VampireImposter.Api.Hubs;

public sealed class GameHub : Hub
{
    private readonly IGameStore _games;
    private readonly IPlayerStore _players;
    private readonly IGameMutationLock _gameMutationLock;

    public GameHub(IGameStore games, IPlayerStore players, IGameMutationLock gameMutationLock)
    {
        _games = games;
        _players = players;
        _gameMutationLock = gameMutationLock;
    }

    public async Task JoinGameChannel(Guid gameId, string playerToken)
    {
        if (gameId == Guid.Empty)
            throw new HubException("Game id cannot be empty.");

        if (string.IsNullOrWhiteSpace(playerToken))
            throw new HubException("Player token is required.");

        if (!_players.TryGetByToken(playerToken.Trim(), out var player) || player is null)
            throw new HubException("Unauthorized.");

        await using var gameLock = await _gameMutationLock.AcquireAsync(gameId, CancellationToken.None);

        if (!_games.TryGet(gameId, out var game) || game is null)
            throw new HubException("Game not found.");

        if (!game.Players.Any(p => p.Id == player.Id))
            throw new HubException("Player is not in this game.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(gameId));
        await Clients.Caller.SendAsync("ChannelJoined", new
        {
            gameId,
            playerId = player.Id
        });
    }

    public Task LeaveGameChannel(Guid gameId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(gameId));

    public static string GroupName(Guid gameId) => $"game:{gameId}";
}
