using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Vampire.Api.Controllers;
using VampireImposter.Api.Application;
using VampireImposter.Api.Application.Concurrency;
using VampireImposter.Api.Application.Security;
using VampireImposter.Api.Application.Timers;
using VampireImposter.GameEngine.Domain;
using VampireImposter.Storage;

namespace VampireImposter.GameEngine.Tests;

[TestClass]
public sealed class GamesControllerAndTimerTests
{
    [TestMethod]
    public async Task GetState_WhenPlayerIsNotInGame_ReturnsForbidden()
    {
        var fixture = CreateFixture();
        var host = CreatePlayerSession("host");
        var outsider = CreatePlayerSession("outsider");

        var game = CreateLobbyGame(host.Id, "State Test");
        game.AddPlayer(host.Id, host.Name);
        fixture.Games.Upsert(game);

        var controller = CreateController(fixture, outsider);
        var result = await controller.GetState(game.Id, CancellationToken.None);

        Assert.IsInstanceOfType<ForbidResult>(result);
    }

    [TestMethod]
    public async Task CloseDiscussion_BeforeTimerEnds_ReturnsConflict()
    {
        var fixture = CreateFixture();
        var host = CreatePlayerSession("host");
        var game = CreateInProgressGameWithRound(host, fixture.Games);
        game.AssignRoundQuestion("Question?");
        game.CloseQuestionPhaseAndResolveNight();
        game.StartDiscussionPhase(5);
        fixture.Games.Upsert(game);

        var controller = CreateController(fixture, host);
        var result = await controller.CloseDiscussion(game.Id, CancellationToken.None);

        Assert.IsInstanceOfType<ConflictObjectResult>(result);
    }

    [TestMethod]
    public async Task CloseVoting_BeforeTimerEnds_ReturnsConflict()
    {
        var fixture = CreateFixture();
        var host = CreatePlayerSession("host");
        var game = CreateInProgressGameWithRound(host, fixture.Games);
        game.AssignRoundQuestion("Question?");
        game.CloseQuestionPhaseAndResolveNight();
        game.StartDiscussionPhase(10);
        game.StartVotingPhase(5);
        fixture.Games.Upsert(game);

        var controller = CreateController(fixture, host);
        var result = await controller.CloseVoting(game.Id, CancellationToken.None);

        Assert.IsInstanceOfType<ConflictObjectResult>(result);
    }

    [TestMethod]
    public async Task TimerService_WhenDiscussionExpires_AutoStartsVoting()
    {
        var fixture = CreateFixture();
        var host = CreatePlayerSession("host");
        var game = CreateInProgressGameWithRound(host, fixture.Games, discussionTime: 1, votingTime: 30);
        game.AssignRoundQuestion("Question?");
        game.CloseQuestionPhaseAndResolveNight();
        game.StartDiscussionPhase(1);
        fixture.Games.Upsert(game);

        var service = new RoundTimerHostedService(
            fixture.Games,
            fixture.Lock,
            fixture.HubContext,
            NullLogger<RoundTimerHostedService>.Instance);

        await service.StartAsync(CancellationToken.None);
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(3));
        }
        finally
        {
            await service.StopAsync(CancellationToken.None);
        }

        var updated = fixture.Games.Get(game.Id);
        var currentRound = updated.GetRound(updated.CurrentRoundNumber);
        Assert.AreEqual(RoundPhase.Voting, currentRound.Phase);
    }

    private static (InMemoryGameStore Games, IGamePasscodeService PasscodeService, IGameOrchestrator Orchestrator, IGameMutationLock Lock, NoOpGameHubContext HubContext) CreateFixture()
    {
        var games = new InMemoryGameStore();
        var passcodeService = new Pbkdf2GamePasscodeService(Options.Create(new PasscodeSecurityOptions
        {
            PasscodePepper = "test-pepper-123456",
            Pbkdf2Iterations = 120_000,
            SaltSizeBytes = 16,
            HashSizeBytes = 32
        }));
        var orchestrator = new GameOrchestrator(games, passcodeService);
        var gameLock = new InMemoryGameMutationLock();
        var hubContext = new NoOpGameHubContext();
        return (games, passcodeService, orchestrator, gameLock, hubContext);
    }

    private static GamesController CreateController(
        (InMemoryGameStore Games, IGamePasscodeService PasscodeService, IGameOrchestrator Orchestrator, IGameMutationLock Lock, NoOpGameHubContext HubContext) fixture,
        PlayerSession currentPlayer)
    {
        var controller = new GamesController(
            fixture.Games,
            fixture.PasscodeService,
            fixture.Orchestrator,
            fixture.Lock,
            fixture.HubContext);

        var http = new DefaultHttpContext();
        http.Items["CurrentPlayer"] = currentPlayer;

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = http
        };

        return controller;
    }

    private static PlayerSession CreatePlayerSession(string name)
        => new()
        {
            Id = Guid.NewGuid(),
            Name = name,
            Token = Guid.NewGuid().ToString("N"),
            CreatedAtUtc = DateTime.UtcNow,
            LastSeenUtc = DateTime.UtcNow
        };

    private static Game CreateLobbyGame(Guid hostId, string gameName)
        => new(
            id: Guid.NewGuid(),
            name: gameName,
            hostPlayerId: hostId,
            maxPlayers: 10,
            discussionTime: 10,
            votingTime: 10,
            passcodeHash: string.Empty);

    private static Game CreateInProgressGameWithRound(
        PlayerSession host,
        InMemoryGameStore games,
        int discussionTime = 10,
        int votingTime = 10)
    {
        var game = new Game(
            id: Guid.NewGuid(),
            name: "Game",
            hostPlayerId: host.Id,
            maxPlayers: 10,
            discussionTime: discussionTime,
            votingTime: votingTime,
            passcodeHash: string.Empty);

        game.AddPlayer(host.Id, host.Name);
        game.AddPlayer(Guid.NewGuid(), "guest");
        game.AddPlayer(Guid.NewGuid(), "third");
        var startResult = game.StartGame(host.Id);
        Assert.AreEqual(GameStartStatus.Success, startResult.Status);
        games.Upsert(game);
        return game;
    }
}
