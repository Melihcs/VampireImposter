using VampireImposter.GameEngine.Domain;
using VampireImposter.Api.Application.DTO;

namespace VampireImposter.Api.Application;

public interface IGameOrchestrator
{
    // Lobby creation (host creates a game lobby)
    Task<CreateLobbyResult> CreateLobbyAsync(CreateLobbyCommand command, CancellationToken ct);

    // Join existing lobby
    Task<JoinLobbyResult> JoinLobbyAsync(JoinLobbyCommand command, CancellationToken ct);

    // List lobbies that have not started yet
    Task<IReadOnlyList<LobbySummary>> ListOpenLobbiesAsync(CancellationToken ct);

    // Optional but usually needed: get lobby snapshot for UI polling
    Task<LobbySnapshotResult> GetLobbySnapshotAsync(GetLobbySnapshotQuery query, CancellationToken ct);
}
