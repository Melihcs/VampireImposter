namespace VampireImposter.Api.Application.DTO;
/* ========= Commands / Queries ========= */

public sealed record CreateLobbyCommand(Guid HostPlayerId, string? Password);
public sealed record JoinLobbyCommand(Guid GameId, Guid PlayerId, string? Password);
public sealed record GetLobbySnapshotQuery(Guid GameId, Guid PlayerId);

/* ========= Results / DTOs ========= */

public sealed record CreateLobbyResult(Guid GameId);
public sealed record JoinLobbyResult(Guid GameId);

public sealed record LobbySummary(
    Guid GameId,
    Guid HostPlayerId,
    int PlayerCount,
    bool PasswordProtected,
    DateTime CreatedAtUtc
);

public sealed record LobbySnapshotResult(
    Guid GameId,
    string Status,
    Guid HostPlayerId,
    IReadOnlyList<LobbyPlayerDto> Players
);

public sealed record LobbyPlayerDto(Guid PlayerId, string Name);
