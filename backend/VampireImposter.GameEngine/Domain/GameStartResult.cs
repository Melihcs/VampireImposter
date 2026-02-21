namespace VampireImposter.GameEngine.Domain;

public enum GameStartStatus
{
    Success = 0,
    HostOnly = 1,
    NotEnoughPlayers = 2,
    NotJoinable = 3,
    Conflict = 4
}

public sealed record GameStartResult(GameStartStatus Status, string? Error = null);
