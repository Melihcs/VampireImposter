using System.Collections.Concurrent;
using VampireImposter.GameEngine.Domain;

namespace VampireImposter.Storage;

public sealed class InMemoryPlayerStore : IPlayerStore
{
    private readonly ConcurrentDictionary<Guid, PlayerSession> _byId = new();
    private readonly ConcurrentDictionary<string, Guid> _byToken = new(StringComparer.Ordinal);

    // Enforce unique names (case-insensitive) atomically
    private readonly ConcurrentDictionary<string, Guid> _byName = new(StringComparer.OrdinalIgnoreCase);

    public PlayerSession Get(Guid playerId)
    {
        if (!_byId.TryGetValue(playerId, out var player))
            throw new KeyNotFoundException($"Player not found: {playerId}");
        return player;
    }

    public bool TryGet(Guid playerId, out PlayerSession? player)
        => _byId.TryGetValue(playerId, out player);

    public bool TryGetByToken(string token, out PlayerSession? player)
    {
        player = null;
        if (string.IsNullOrWhiteSpace(token)) return false;

        if (!_byToken.TryGetValue(token, out var playerId)) return false;
        return _byId.TryGetValue(playerId, out player);
    }

    public UpsertPlayerResult Upsert(PlayerSession player)
    {
        if (player is null) return UpsertPlayerResult.Invalid;
        if (player.Id == Guid.Empty) return UpsertPlayerResult.Invalid;
        if (string.IsNullOrWhiteSpace(player.Token)) return UpsertPlayerResult.Invalid;
        if (string.IsNullOrWhiteSpace(player.Name)) return UpsertPlayerResult.Invalid;

        // Token must map to the same playerId (or be new)
        var tokenOk = _byToken.AddOrUpdate(
            player.Token,
            _ => player.Id,
            (_, existingId) => existingId == player.Id ? existingId : Guid.Empty);

        if (tokenOk == Guid.Empty)
            return UpsertPlayerResult.TokenCollision;

        // Handle name uniqueness + rename scenario
        var newName = player.Name.Trim();

        if (_byId.TryGetValue(player.Id, out var existing))
        {
            var oldName = existing.Name;

            if (!string.Equals(oldName, newName, StringComparison.OrdinalIgnoreCase))
            {
                // Try to claim the new name
                if (!_byName.TryAdd(newName, player.Id))
                {
                    // If already claimed by someone else -> reject
                    if (_byName.TryGetValue(newName, out var ownerId) && ownerId != player.Id)
                        return UpsertPlayerResult.NameAlreadyTaken;
                }

                // Release old name
                if (!string.IsNullOrWhiteSpace(oldName))
                    _byName.TryRemove(oldName, out _);
            }

            // Update stored session (replace)
            _byId[player.Id] = player;
            return UpsertPlayerResult.Success;
        }
        else
        {
            // New player: must claim name
            if (!_byName.TryAdd(newName, player.Id))
            {
                // If already claimed by someone else -> reject
                if (_byName.TryGetValue(newName, out var ownerId) && ownerId != player.Id)
                    return UpsertPlayerResult.NameAlreadyTaken;
            }

            _byId.TryAdd(player.Id, player);
            return UpsertPlayerResult.Success;
        }
    }

    public bool Remove(Guid playerId)
    {
        if (!_byId.TryRemove(playerId, out var removed))
            return false;

        if (!string.IsNullOrWhiteSpace(removed.Token))
            _byToken.TryRemove(removed.Token, out _);

        if (!string.IsNullOrWhiteSpace(removed.Name))
            _byName.TryRemove(removed.Name, out _);

        return true;
    }

    public IReadOnlyCollection<PlayerSession> GetAll()
        => _byId.Values.ToList().AsReadOnly();
}
