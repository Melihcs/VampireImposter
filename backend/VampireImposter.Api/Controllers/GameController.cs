// GamesController.cs
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;
using VampireImposter.Api.Application;
using VampireImposter.Api.Application.DTO;
using VampireImposter.Api.Hubs;
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
    private readonly IHubContext<GameHub> _hub;

    public GamesController(
        IGameStore games,
        IGamePasscodeService passcodeService,
        IGameOrchestrator orchestrator,
        IHubContext<GameHub> hub)
    {
        _games = games;
        _passcodeService = passcodeService;
        _orchestrator = orchestrator;
        _hub = hub;
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
    public async Task<IActionResult> Create([FromBody] CreateGameRequest req)
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
        await PublishGameEventAsync(game.Id, "GameCreated", new
        {
            gameId = game.Id,
            hostPlayerId = player.Id
        });
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

        if (result.Status == JoinLobbyStatus.Success && result.Game is not null)
        {
            await PublishGameEventAsync(result.Game.Id, "PlayerJoined", new
            {
                gameId = result.Game.Id,
                playerId = player.Id,
                playerName = player.Name,
                playerCount = result.Game.Players.Count
            });

            return Ok(ToDto(result.Game));
        }

        return result.Status switch
        {
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
    public async Task<IActionResult> Start([FromRoute] Guid gameId)
    {
        var player = HttpContext.CurrentPlayer();
        var game = HttpContext.CurrentGame();

        var result = game.StartGame(player.Id);

        if (result.Status == GameStartStatus.Success)
        {
            _games.Upsert(game);
            await PublishGameEventAsync(game.Id, "GameStarted", new
            {
                gameId = game.Id,
                status = game.Status.ToString(),
                roundNumber = game.CurrentRoundNumber,
                phase = game.GetRound(game.CurrentRoundNumber).Phase.ToString()
            });
            return Ok(ToDto(game));
        }

        return result.Status switch
        {
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

    // 4) Start next round (host only)
    // POST /api/games/{gameId}/rounds/start
    [HttpPost("{gameId:guid}/rounds/start")]
    [RequirePlayer]
    [RequireGame]
    [RequireHost]
    [ProducesResponseType(typeof(RoundStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> StartRound([FromRoute] Guid gameId)
    {
        var game = HttpContext.CurrentGame();

        return await ApplyGameMutationAsync(game, () =>
        {
            var round = game.StartRound();
            return Ok(ToRoundStateDto(round));
        },
        () => PublishGameEventAsync(game.Id, "RoundStarted", new
        {
            gameId = game.Id,
            roundNumber = game.CurrentRoundNumber,
            phase = game.GetRound(game.CurrentRoundNumber).Phase.ToString()
        }));
    }

    // 5) Assign question for current round (host only)
    // POST /api/games/{gameId}/rounds/question
    [HttpPost("{gameId:guid}/rounds/question")]
    [RequirePlayer]
    [RequireGame]
    [RequireHost]
    [ProducesResponseType(typeof(RoundStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AssignQuestion([FromRoute] Guid gameId, [FromBody] AssignRoundQuestionRequest req)
    {
        var game = HttpContext.CurrentGame();

        return await ApplyGameMutationAsync(game, () =>
        {
            game.AssignRoundQuestion(req.QuestionText);
            return Ok(ToRoundStateDto(game.GetRound(game.CurrentRoundNumber)));
        },
        () =>
        {
            var round = game.GetRound(game.CurrentRoundNumber);
            return PublishGameEventAsync(game.Id, "QuestionAssigned", new
            {
                gameId = game.Id,
                roundNumber = round.RoundNumber,
                phase = round.Phase.ToString(),
                questionText = round.QuestionText
            });
        });
    }

    // 6) Submit round action (alive players only, enforced in domain)
    // POST /api/games/{gameId}/rounds/actions
    [HttpPost("{gameId:guid}/rounds/actions")]
    [RequirePlayer]
    [RequireGame]
    [ProducesResponseType(typeof(RoundStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SubmitRoundAction([FromRoute] Guid gameId, [FromBody] SubmitRoundActionRequest req)
    {
        if (req.SelectedPlayerId == Guid.Empty)
            return BadRequest(new { error = "SelectedPlayerId is required." });

        var player = HttpContext.CurrentPlayer();
        var game = HttpContext.CurrentGame();

        return await ApplyGameMutationAsync(game, () =>
        {
            game.SubmitRoundAction(player.Id, req.SelectedPlayerId);
            return Ok(ToRoundStateDto(game.GetRound(game.CurrentRoundNumber)));
        },
        () => PublishGameEventAsync(game.Id, "RoundActionSubmitted", new
        {
            gameId = game.Id,
            roundNumber = game.CurrentRoundNumber,
            playerId = player.Id
        }));
    }

    // 7) Close question phase and resolve night (host only)
    // POST /api/games/{gameId}/rounds/question/close
    [HttpPost("{gameId:guid}/rounds/question/close")]
    [RequirePlayer]
    [RequireGame]
    [RequireHost]
    [ProducesResponseType(typeof(NightResolutionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CloseQuestionPhase([FromRoute] Guid gameId)
    {
        var game = HttpContext.CurrentGame();

        NightResolutionResult? resolution = null;
        return await ApplyGameMutationAsync(game, () =>
        {
            var result = game.CloseQuestionPhaseAndResolveNight();
            resolution = result;
            var round = game.GetRound(game.CurrentRoundNumber);

            return Ok(new NightResolutionDto
            {
                RoundNumber = round.RoundNumber,
                Phase = round.Phase.ToString(),
                KilledPlayerId = result.KilledPlayerId,
                HunterCheckedPlayerId = result.HunterCheckedPlayerId,
                HunterDetectedVampire = result.HunterDetectedVampire
            });
        },
        () =>
        {
            var round = game.GetRound(game.CurrentRoundNumber);
            return PublishGameEventAsync(game.Id, "NightResolved", new
            {
                gameId = game.Id,
                roundNumber = round.RoundNumber,
                phase = round.Phase.ToString(),
                killedPlayerId = resolution?.KilledPlayerId,
                hunterCheckedPlayerId = resolution?.HunterCheckedPlayerId
            });
        });
    }

    // 8) Start discussion phase (host only)
    // POST /api/games/{gameId}/rounds/discussion/start
    [HttpPost("{gameId:guid}/rounds/discussion/start")]
    [RequirePlayer]
    [RequireGame]
    [RequireHost]
    [ProducesResponseType(typeof(RoundStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> StartDiscussion([FromRoute] Guid gameId, [FromBody] StartDiscussionRequest req)
    {
        var game = HttpContext.CurrentGame();

        return await ApplyGameMutationAsync(game, () =>
        {
            game.StartDiscussionPhase(req.DurationSeconds);
            return Ok(ToRoundStateDto(game.GetRound(game.CurrentRoundNumber)));
        },
        () =>
        {
            var round = game.GetRound(game.CurrentRoundNumber);
            return PublishGameEventAsync(game.Id, "DiscussionStarted", new
            {
                gameId = game.Id,
                roundNumber = round.RoundNumber,
                phase = round.Phase.ToString()
            });
        });
    }

    // 9) Close discussion phase (host only)
    // POST /api/games/{gameId}/rounds/discussion/close
    [HttpPost("{gameId:guid}/rounds/discussion/close")]
    [RequirePlayer]
    [RequireGame]
    [RequireHost]
    [ProducesResponseType(typeof(RoundStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CloseDiscussion([FromRoute] Guid gameId)
    {
        var game = HttpContext.CurrentGame();

        return await ApplyGameMutationAsync(game, () =>
        {
            game.CloseDiscussionPhase();
            return Ok(ToRoundStateDto(game.GetRound(game.CurrentRoundNumber)));
        },
        () => PublishGameEventAsync(game.Id, "DiscussionClosed", new
        {
            gameId = game.Id,
            roundNumber = game.CurrentRoundNumber
        }));
    }

    // 10) Start voting phase (host only)
    // POST /api/games/{gameId}/rounds/voting/start
    [HttpPost("{gameId:guid}/rounds/voting/start")]
    [RequirePlayer]
    [RequireGame]
    [RequireHost]
    [ProducesResponseType(typeof(RoundStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> StartVoting([FromRoute] Guid gameId, [FromBody] StartVotingRequest req)
    {
        var game = HttpContext.CurrentGame();

        return await ApplyGameMutationAsync(game, () =>
        {
            game.StartVotingPhase(req.DurationSeconds);
            return Ok(ToRoundStateDto(game.GetRound(game.CurrentRoundNumber)));
        },
        () =>
        {
            var round = game.GetRound(game.CurrentRoundNumber);
            return PublishGameEventAsync(game.Id, "VotingStarted", new
            {
                gameId = game.Id,
                roundNumber = round.RoundNumber,
                phase = round.Phase.ToString()
            });
        });
    }

    // 11) Cast vote for current round (alive players only, enforced in domain)
    // POST /api/games/{gameId}/rounds/votes
    [HttpPost("{gameId:guid}/rounds/votes")]
    [RequirePlayer]
    [RequireGame]
    [ProducesResponseType(typeof(RoundStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CastVote([FromRoute] Guid gameId, [FromBody] CastVoteRequest req)
    {
        if (req.TargetPlayerId == Guid.Empty)
            return BadRequest(new { error = "TargetPlayerId is required." });

        var player = HttpContext.CurrentPlayer();
        var game = HttpContext.CurrentGame();

        return await ApplyGameMutationAsync(game, () =>
        {
            game.CastVote(player.Id, req.TargetPlayerId);
            return Ok(ToRoundStateDto(game.GetRound(game.CurrentRoundNumber)));
        },
        () => PublishGameEventAsync(game.Id, "VoteCast", new
        {
            gameId = game.Id,
            roundNumber = game.CurrentRoundNumber,
            voterPlayerId = player.Id,
            targetPlayerId = req.TargetPlayerId
        }));
    }

    // 12) Close voting phase and execute leading target (host only)
    // POST /api/games/{gameId}/rounds/voting/close
    [HttpPost("{gameId:guid}/rounds/voting/close")]
    [RequirePlayer]
    [RequireGame]
    [RequireHost]
    [ProducesResponseType(typeof(VotingResolutionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CloseVoting([FromRoute] Guid gameId)
    {
        var game = HttpContext.CurrentGame();

        VotingResolutionResult? votingResult = null;
        return await ApplyGameMutationAsync(game, () =>
        {
            var result = game.CloseVotingPhaseAndExecute();
            votingResult = result;
            var round = game.GetRound(game.CurrentRoundNumber);

            return Ok(new VotingResolutionDto
            {
                RoundNumber = round.RoundNumber,
                Phase = round.Phase.ToString(),
                ExecutedPlayerId = result.ExecutedPlayerId,
                ExecutedPlayerRole = result.ExecutedPlayerRole?.ToString()
            });
        },
        () =>
        {
            var round = game.GetRound(game.CurrentRoundNumber);
            return PublishGameEventAsync(game.Id, "VotingClosed", new
            {
                gameId = game.Id,
                roundNumber = round.RoundNumber,
                phase = round.Phase.ToString(),
                executedPlayerId = votingResult?.ExecutedPlayerId,
                executedPlayerRole = votingResult?.ExecutedPlayerRole?.ToString()
            });
        });
    }

    // 13) Advance to next round or finish game (host only)
    // POST /api/games/{gameId}/rounds/advance
    [HttpPost("{gameId:guid}/rounds/advance")]
    [RequirePlayer]
    [RequireGame]
    [RequireHost]
    [ProducesResponseType(typeof(GameAdvanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AdvanceRound([FromRoute] Guid gameId)
    {
        var game = HttpContext.CurrentGame();

        AdvanceRoundResult? advanceResult = null;
        return await ApplyGameMutationAsync(game, () =>
        {
            var result = game.AdvanceToNextRoundOrFinish();
            advanceResult = result;
            return Ok(new GameAdvanceDto
            {
                IsGameEnded = result.IsGameEnded,
                Winner = result.Winner.ToString(),
                CurrentRoundNumber = result.CurrentRoundNumber,
                GameState = game.Status == GameStatus.Finished ? "Completed" : game.Status.ToString()
            });
        },
        () =>
        {
            if (advanceResult is null)
                return Task.CompletedTask;

            if (advanceResult.IsGameEnded)
            {
                return PublishGameEventAsync(game.Id, "GameEnded", new
                {
                    gameId = game.Id,
                    winner = advanceResult.Winner.ToString(),
                    currentRoundNumber = advanceResult.CurrentRoundNumber
                });
            }

            return PublishGameEventAsync(game.Id, "RoundAdvanced", new
            {
                gameId = game.Id,
                currentRoundNumber = advanceResult.CurrentRoundNumber
            });
        });
    }

    // 14) Get private hunter result (non-hunters receive random true/false)
    // GET /api/games/{gameId}/rounds/hunter-result
    [HttpGet("{gameId:guid}/rounds/hunter-result")]
    [RequirePlayer]
    [RequireGame]
    [ProducesResponseType(typeof(HunterPrivateResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public IActionResult GetHunterResult([FromRoute] Guid gameId)
    {
        try
        {
            var player = HttpContext.CurrentPlayer();
            var game = HttpContext.CurrentGame();
            var result = game.GetPrivateHunterResult(player.Id);

            return Ok(new HunterPrivateResultDto { IsVampire = result });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    // 15) Leave a game (remove player from token)
    // DELETE /api/games/{gameId}/players/me
    [HttpDelete("{gameId:guid}/players/me")]
    [RequirePlayer]
    [RequireGame]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Leave([FromRoute] Guid gameId)
    {
        var player = HttpContext.CurrentPlayer();
        var game = HttpContext.CurrentGame();
        var playerCountBefore = game.Players.Count;

        if (!game.Players.Any(p => p.Id == player.Id))
            return NoContent(); // idempotent

        game.RemovePlayer(player.Id);
        var playerCountAfter = game.Players.Count;

        if (game.Players.Count == 0)
        {
            _games.Remove(game.Id);
            await PublishGameEventAsync(game.Id, "PlayerLeft", new
            {
                gameId = game.Id,
                playerId = player.Id,
                playerCountBefore,
                playerCountAfter
            });
            await PublishGameEventAsync(game.Id, "GameClosed", new
            {
                gameId = game.Id
            });
            return NoContent();
        }

        _games.Upsert(game);
        await PublishGameEventAsync(game.Id, "PlayerLeft", new
        {
            gameId = game.Id,
            playerId = player.Id,
            playerCountBefore,
            playerCountAfter
        });
        return NoContent();
    }

    private async Task<IActionResult> ApplyGameMutationAsync(
        Game game,
        Func<IActionResult> mutate,
        Func<Task>? afterCommit = null)
    {
        try
        {
            var result = mutate();
            _games.Upsert(game);
            if (afterCommit is not null)
                await afterCommit();
            return result;
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    private Task PublishGameEventAsync(Guid gameId, string eventName, object payload)
        => _hub.Clients.Group(GameHub.GroupName(gameId)).SendAsync(eventName, payload);

    private static RoundStateDto ToRoundStateDto(Round round) => new()
    {
        RoundNumber = round.RoundNumber,
        Phase = round.Phase.ToString(),
        QuestionText = round.QuestionText
    };

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
