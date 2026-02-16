namespace VampireImposter.GameEngine.Domain;

public enum GameJoinLobbyStatus
{
    Success = 0,
    InvalidPasscode = 1,
    NotJoinable = 2,
    Conflict = 3
}

public sealed record GameJoinLobbyResult(GameJoinLobbyStatus Status, string? Error = null);
