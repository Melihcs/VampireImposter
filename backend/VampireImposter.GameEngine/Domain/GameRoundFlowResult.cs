namespace VampireImposter.GameEngine.Domain;

public enum GameWinner
{
    None = 0,
    Villagers = 1,
    Vampires = 2
}

public sealed record NightResolutionResult(
    Guid? KilledPlayerId,
    Guid? HunterCheckedPlayerId,
    bool? HunterDetectedVampire);

public sealed record VotingResolutionResult(
    Guid? ExecutedPlayerId,
    PlayerRole? ExecutedPlayerRole);

public sealed record GameEndEvaluationResult(
    bool IsGameEnded,
    GameWinner Winner,
    string? Reason = null);

public sealed record AdvanceRoundResult(
    bool IsGameEnded,
    GameWinner Winner,
    int CurrentRoundNumber);
