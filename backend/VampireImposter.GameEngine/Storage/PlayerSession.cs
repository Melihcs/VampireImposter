namespace VampireImposter.Storage;

public sealed class PlayerSession
{
    public Guid Id { get; init; }
    public string Token { get; init; } = "";
    public string Name { get; set; } = "";
    public DateTime CreatedAtUtc { get; init; }
    public DateTime LastSeenUtc { get; set; }
}
