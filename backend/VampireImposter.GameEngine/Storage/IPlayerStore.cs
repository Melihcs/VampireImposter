namespace VampireImposter.Storage;

public interface IPlayerStore
{
    PlayerSession Get(Guid playerId);
    bool TryGet(Guid playerId, out PlayerSession? player);

    UpsertPlayerResult Upsert(PlayerSession player);     // changed
    bool Remove(Guid playerId);

    bool TryGetByToken(string token, out PlayerSession? player);
    IReadOnlyCollection<PlayerSession> GetAll();
}
public enum UpsertPlayerResult
{
    Success = 0,
    NameAlreadyTaken = 1,
    TokenCollision = 2,
    Invalid = 3
}