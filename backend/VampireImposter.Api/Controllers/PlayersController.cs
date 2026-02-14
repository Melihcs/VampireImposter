using Microsoft.AspNetCore.Mvc;
using Vampire.Api.Infrastructure;
using Vampire.Api.Infrastructure.Auth;
using VampireImposter.Api.Contracts;
using VampireImposter.Storage;

namespace ImposterGame.Api.Controllers;

[ApiController]
[Route("api/players")]
public sealed class PlayersController : ControllerBase
{
    private Dictionary<UpsertPlayerResult, Func<string, IActionResult>> _upsertProblemMap;

    private readonly IPlayerStore _playerStore;

    public PlayersController(IPlayerStore playerStore)
    {
        _playerStore = playerStore;
        _upsertProblemMap = new()
        {
            [UpsertPlayerResult.Invalid] = _ => Problem(
                title: "Invalid name",
                detail: "Name is required.",
                statusCode: StatusCodes.Status400BadRequest),

            [UpsertPlayerResult.NameAlreadyTaken] = name => Problem(
                title: "Name already taken",
                detail: $"Player name '{name}' is already in use.",
                statusCode: StatusCodes.Status409Conflict),

            [UpsertPlayerResult.TokenCollision] = _ => Problem(
                title: "Token collision",
                detail: "Generated token already belongs to another player (retry).",
                statusCode: StatusCodes.Status409Conflict),
        };
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreatePlayerResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public Task<IActionResult> Create([FromBody] CreatePlayerRequest request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var name = String.IsNullOrEmpty(request.Name) ? String.Empty : request.Name.Trim();
        var player = new PlayerSession
        {
            Id = Guid.NewGuid(),
            Token = Guid.NewGuid().ToString("N"),
            Name = name,
            CreatedAtUtc = now,
            LastSeenUtc = now
        };

        var result = _playerStore.Upsert(player);
        if (result != UpsertPlayerResult.Success)
        {
            return Task.FromResult<IActionResult>(_upsertProblemMap[result](request.Name));
        }
        var response = new CreatePlayerResponse(
            PlayerId: player.Id,
            Name: player.Name,
            PlayerToken: player.Token
        );

        return Task.FromResult<IActionResult>(CreatedAtAction(
            nameof(GetById),
            new { playerId = player.Id },
            response));
    }

    [HttpGet("{playerId:guid}")]
    [ProducesResponseType(typeof(PlayerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public Task<IActionResult> GetById([FromRoute] Guid playerId, CancellationToken ct)
    {
        if (!_playerStore.TryGet(playerId, out var player) || player is null)
            return Task.FromResult<IActionResult>(NotFound());
        var dto = new PlayerDto(
            PlayerId: player.Id,
            Name: player.Name,
            CreatedAtUtc: player.CreatedAtUtc
        );
        return Task.FromResult<IActionResult>(Ok(dto));
    }

    [HttpPatch("me")]
    [RequirePlayer]
    [ProducesResponseType(typeof(PlayerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public Task<IActionResult> Rename(
    [FromBody] RenamePlayerRequest request,
    CancellationToken ct)
    {
        var currentPlayer = HttpContext.CurrentPlayer();

        // create updated copy (keeps token/createdAt etc.)
        var updated = new PlayerSession
        {
            Id = currentPlayer.Id,
            Token = currentPlayer.Token,
            Name = request.Name.Trim(),
            CreatedAtUtc = currentPlayer.CreatedAtUtc,
            LastSeenUtc = DateTime.UtcNow
        };
        var upsert = _playerStore.Upsert(updated);
        if (upsert != UpsertPlayerResult.Success)
        {
            return Task.FromResult<IActionResult>(_upsertProblemMap[upsert](request.Name));
        }
        var dto = new PlayerDto(updated.Id, updated.Name, updated.CreatedAtUtc);
        return Task.FromResult<IActionResult>(Ok(dto));
    }


    [RequirePlayer]
    [HttpDelete("session")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public Task<IActionResult> EndSession(CancellationToken ct)
    {
        var player = HttpContext.CurrentPlayer();
        _playerStore.Remove(player.Id);

        return Task.FromResult<IActionResult>(NoContent());
    }
}
