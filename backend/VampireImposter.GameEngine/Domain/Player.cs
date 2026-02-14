namespace VampireImposter.GameEngine.Domain;

public enum PlayerRole
{
    Unknown = 0,
    Villager = 1,
    Vampire = 2,
    Hunter = 3
}

public sealed class Player
{
    public Guid Id { get; }
    public string Name { get; private set; }
    public PlayerRole Role { get; private set; }
    public bool IsAlive { get; private set; }
    public DateTimeOffset JoinedAtUtc { get; }

    public Player(Guid id, string name)
    {
        if (id == Guid.Empty) throw new ArgumentException("Player id cannot be empty.", nameof(id));
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Player name cannot be empty.", nameof(name));

        Id = id;
        Name = name.Trim();
        Role = PlayerRole.Unknown;
        IsAlive = true;
        JoinedAtUtc = DateTimeOffset.UtcNow;
    }

    public void AssignRole(PlayerRole role)
    {
        if (role == PlayerRole.Unknown)
            throw new ArgumentException("Role cannot be Unknown.", nameof(role));

        Role = role;
    }

    public void Rename(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Player name cannot be empty.", nameof(newName));

        Name = newName.Trim();
    }

    public void Kill()
    {
        if (!IsAlive) return;
        IsAlive = false;
    }
}
