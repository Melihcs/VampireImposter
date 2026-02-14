// GamesController.cs
using Microsoft.AspNetCore.Mvc;
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
    private const int DefaultMaxPlayers = 10;

    private readonly IGameStore _games;

    public GamesController(IGameStore games)
    {
        _games = games;
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
            IsJoinable = g.Status == GameStatus.Lobby && g.Players.Count < g.MaxPlayers
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
        var game = new Game(Guid.NewGuid(), req.Name, player.Id, req.MaxPlayers, req.DiscussionTime, req.VotingTime);
        game.AddPlayer(player.Id, player.Name);
        _games.Upsert(game);
        return CreatedAtAction(nameof(Get), new { gameId = game.Id }, ToDto(game));
    }

    // 2) Join a game using player token
    // POST /api/games/{gameId}/join
    [HttpPost("{gameId:guid}/join")]
    [RequirePlayer]
    [RequireGame]
    [ProducesResponseType(typeof(GameDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public IActionResult Join([FromRoute] Guid gameId)
    {
        var player = HttpContext.CurrentPlayer();
        var game = HttpContext.CurrentGame();
        if (game.Status != GameStatus.Lobby)
            return Conflict(new { error = "Game is not joinable (not in Lobby state)." });

        if (game.Players.Any(p => p.Id == player.Id))
            return Ok(ToDto(game)); // idempotent

        try
        {
            game.AddPlayer(player.Id, player.Name);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }

        _games.Upsert(game);
        return Ok(ToDto(game));
    }

    // 3) Leave a game (remove player from token)
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
        IsJoinable = g.Status == GameStatus.Lobby && g.Players.Count < g.MaxPlayers
    };
}
