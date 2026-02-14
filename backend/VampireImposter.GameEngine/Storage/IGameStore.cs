
using VampireImposter.GameEngine.Domain;

namespace VampireImposter.Storage;

/// <summary>
/// Stores active games. First implementation is in-memory (no persistence).
/// Later you can swap it (e.g., Redis) without changing controllers/engine.
/// </summary>
public interface IGameStore
{
    Game Get(Guid gameId);
    bool TryGet(Guid gameId, out Game? game);

    void Upsert(Game game);
    bool Remove(Guid gameId);

    IReadOnlyCollection<Game> GetAll(); // useful for admin/cleanup/debug
}
