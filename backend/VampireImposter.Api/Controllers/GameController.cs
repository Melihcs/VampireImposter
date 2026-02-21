// GamesController.cs
using Microsoft.AspNetCore.Mvc;
using VampireImposter.Api.Application;
using VampireImposter.Api.Application.DTO;
using VampireImposter.Api.Application.Security;
using Vampire.Api.Infrastructure;
using Vampire.Api.Infrastructure.Auth;
using VampireImposter.Api.Contracts;
using VampireImposter.GameEngine.Domain;
using VampireImposter.Storage;

namespace Vampire.Api.Controllers;

[ApiController]
[Route("api/games")]
public sealed class GamesController : ControllerBase
{
    private readonly IGameStore _games;
    private readonly IGamePasscodeService _passcodeService;
    private readonly IGameOrchestrator _orchestrator;

    public GamesController(IGameStore games, IGamePasscodeService passcodeService, IGameOrchestrator orchestrator)
    {
        _games = games;
        _passcodeService = passcodeService;
        _orchestrator = orchestrator;
    }

    // 1) Lobby list: list all joinable lobby games
    // GET /api/games?state=lobby&skip=0&take=50
    [HttpGet]
    [RequirePlayer] // remove if you want public listing
    [ProducesResponseType(typeof(List<GameListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult List([FromQuery] string? state = "lobby", [FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        if (!string.Equals(state, "lobby", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { error = "Only state=lobby is supported for now." });

        skip = Math.Max(0, skip);
        take = take switch
        {
            <= 0 => 50,
            > 200 => 200,
            _ => take
        };

        var games = _games.GetAll()
            .Where(g => g.Status == GameStatus.Lobby)
            .OrderByDescending(g => g.CreatedAtUtc)
            .Skip(skip)
            .Take(take);

        var items = games.Select(g => new GameListItemDto
        {
            GameId = g.Id,
            Name = g.Name,
            CreatedAtUtc = g.CreatedAtUtc,
            HostPlayerId = g.HostPlayerId,
            PlayerCount = g.Players.Count,
            MaxPlayers = g.MaxPlayers,
            IsJoinable = g.Status == GameStatus.Lobby && g.Players.Count < g.MaxPlayers,
            PasscodeRequired = g.PasscodeRequired
        })
            .ToList();

        return Ok(items);
    }

    // GET /api/games/{gameId}
    [HttpGet("{gameId:guid}")]
    [RequirePlayer]
    [RequireGame]
    [ProducesResponseType(typeof(GameDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Get([FromRoute] Guid gameId)
    {
        var game = HttpContext.CurrentGame();
        return Ok(ToDto(game));
    }

    // 1) Create a game and auto-join creator as host
    // POST /api/games
    [HttpPost]
    [RequirePlayer]
    [ProducesResponseType(typeof(GameDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Create([FromBody] CreateGameRequest req)
    {
        var player = HttpContext.CurrentPlayer();
        var passcodeHash = _passcodeService.Hash(req.Passcode);
        var game = new Game(
            Guid.NewGuid(),
            req.Name,
            player.Id,
            req.MaxPlayers,
            req.DiscussionTime,
            req.VotingTime,
            passcodeHash);

        game.AddPlayer(player.Id, player.Name);
        _games.Upsert(game);
        return CreatedAtAction(nameof(Get), new { gameId = game.Id }, ToDto(game));
    }

    // 2) Join a game using player token
    // POST /api/games/{gameId}/join
    [HttpPost("{gameId:guid}/join")]
    [RequirePlayer]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(GameDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Join([FromRoute] Guid gameId, [FromBody] JoinGameRequest req, CancellationToken ct)
    {
        var player = HttpContext.CurrentPlayer();
        var result = await _orchestrator.JoinLobbyAsync(
            new JoinLobbyCommand(gameId, player.Id, player.Name, req.Passcode),
            ct);

        return result.Status switch
        {
            JoinLobbyStatus.Success when result.Game is not null => Ok(ToDto(result.Game)),
            JoinLobbyStatus.NotFound => NotFound(),
            JoinLobbyStatus.InvalidPasscode => Problem(
                title: "Invalid passcode",
                detail: "Passcode does not match this game.",
                statusCode: StatusCodes.Status403Forbidden),
            JoinLobbyStatus.NotJoinable => Conflict(new { error = "Game is not joinable (not in Lobby state)." }),
            JoinLobbyStatus.Conflict => Conflict(new { error = result.Error ?? "Unable to join this game." }),
            _ => Problem(
                title: "Join failed",
                detail: "Unexpected join outcome.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    // 3) Start a game (host only)
    // POST /api/games/{gameId}/start
    [HttpPost("{gameId:guid}/start")]
    [RequirePlayer]
    [RequireGame]
    [ProducesResponseType(typeof(GameDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public IActionResult Start([FromRoute] Guid gameId)
    {
        var player = HttpContext.CurrentPlayer();
        var game = HttpContext.CurrentGame();

        var result = game.StartGame(player.Id);

        return result.Status switch
        {
            GameStartStatus.Success => StartSuccess(game),
            GameStartStatus.HostOnly => Problem(
                title: "Forbidden",
                detail: result.Error ?? "Only the host can start the game.",
                statusCode: StatusCodes.Status403Forbidden),
            GameStartStatus.NotEnoughPlayers => Conflict(new { error = result.Error ?? "At least 3 players are required to start." }),
            GameStartStatus.NotJoinable => Conflict(new { error = result.Error ?? "Game is not joinable." }),
            GameStartStatus.Conflict => Conflict(new { error = result.Error ?? "Unable to start this game." }),
            _ => Problem(
                title: "Start failed",
                detail: "Unexpected start outcome.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    // 4) Leave a game (remove player from token)
    // DELETE /api/games/{gameId}/players/me
    [HttpDelete("{gameId:guid}/players/me")]
    [RequirePlayer]
    [RequireGame]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Leave([FromRoute] Guid gameId)
    {
        var player = HttpContext.CurrentPlayer();
        var game = HttpContext.CurrentGame();

        if (!game.Players.Any(p => p.Id == player.Id))
            return NoContent(); // idempotent

        game.RemovePlayer(player.Id);

        if (game.Players.Count == 0)
        {
            _games.Remove(game.Id);
            return NoContent();
        }

        _games.Upsert(game);
        return NoContent();
    }

    private IActionResult StartSuccess(Game game)
    {
        _games.Upsert(game);
        return Ok(ToDto(game));
    }

    private static GameDto ToDto(Game g) => new()
    {
        GameId = g.Id,
        Name = g.Name,
        CreatedAtUtc = g.CreatedAtUtc,
        HostPlayerId = g.HostPlayerId,
        State = g.Status == GameStatus.Finished ? "Completed" : g.Status.ToString(),
        PlayerIds = g.Players.Select(p => p.Id).ToArray(),
        PlayerCount = g.Players.Count,
        MaxPlayers = g.MaxPlayers,
        DiscussionTime = g.DiscussionTime,
        VotingTime = g.VotingTime,
        IsJoinable = g.Status == GameStatus.Lobby && g.Players.Count < g.MaxPlayers,
        PasscodeRequired = g.PasscodeRequired
    };
}
