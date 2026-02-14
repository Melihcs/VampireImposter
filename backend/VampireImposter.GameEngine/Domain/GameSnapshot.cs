namespace VampireImposter.GameEngine.Snapshots;

public sealed record GameSnapshot(
    Guid GameId,
    string Status,
    int CurrentRoundNumber,
    string? CurrentPhase,
    IReadOnlyList<PlayerSnapshot> Players,
    RoundSnapshot? CurrentRound,
    RoundResultSnapshot? LastResult
);

public sealed record PlayerSnapshot(
    Guid PlayerId,
    string Name,
    bool IsAlive
);

public sealed record RoundSnapshot(
    Guid RoundId,
    int RoundNumber,
    string Phase,
    IReadOnlyList<VoteSnapshot> Votes
);

public sealed record VoteSnapshot(
    Guid VoterId,
    Guid TargetId
);

public sealed record RoundResultSnapshot(
    int RoundNumber,
    Guid? EliminatedPlayerId,
    Guid? VampireTargetPlayerId,
    Guid? HunterTargetPlayerId
);
