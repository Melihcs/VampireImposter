using System.Collections.Concurrent;
using VampireImposter.GameEngine.Domain;

namespace VampireImposter.Storage;

public sealed class InMemoryGameStore : IGameStore
{
    private readonly ConcurrentDictionary<Guid, Game> _games = new();

    public Game Get(Guid gameId)
    {
        if (gameId == Guid.Empty)
            throw new ArgumentException("Game id cannot be empty.", nameof(gameId));

        if (_games.TryGetValue(gameId, out var game))
            return game;

        throw new KeyNotFoundException("Game not found.");
    }

    public bool TryGet(Guid gameId, out Game? game)
    {
        if (gameId == Guid.Empty)
        {
            game = null;
            return false;
        }

        return _games.TryGetValue(gameId, out game);
    }

    public void Upsert(Game game)
    {
        if (game is null) throw new ArgumentNullException(nameof(game));
        _games[game.Id] = game;
    }

    public bool Remove(Guid gameId)
    {
        if (gameId == Guid.Empty)
            return false;

        return _games.TryRemove(gameId, out _);
    }

    public IReadOnlyCollection<Game> GetAll()
        => _games.Values.ToList();
}
