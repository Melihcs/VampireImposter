using Microsoft.AspNetCore.SignalR;
using VampireImposter.Api.Application.Concurrency;
using VampireImposter.Api.Hubs;
using VampireImposter.GameEngine.Domain;
using VampireImposter.Storage;

namespace VampireImposter.Api.Application.Timers;

public sealed class RoundTimerHostedService : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(1);

    private readonly IGameStore _games;
    private readonly IGameMutationLock _gameMutationLock;
    private readonly IHubContext<GameHub> _hub;
    private readonly ILogger<RoundTimerHostedService> _logger;

    public RoundTimerHostedService(
        IGameStore games,
        IGameMutationLock gameMutationLock,
        IHubContext<GameHub> hub,
        ILogger<RoundTimerHostedService> logger)
    {
        _games = games;
        _gameMutationLock = gameMutationLock;
        _hub = hub;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var gameIds = _games.GetAll()
                .Where(g => g.Status == GameStatus.InProgress && g.CurrentRoundNumber > 0)
                .Select(g => g.Id)
                .ToArray();

            foreach (var gameId in gameIds)
            {
                try
                {
                    await ProcessGameTimersAsync(gameId, stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    return;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Timer processing failed for game {GameId}", gameId);
                }
            }

            await Task.Delay(PollInterval, stoppingToken);
        }
    }

    private async Task ProcessGameTimersAsync(Guid gameId, CancellationToken ct)
    {
        await using var gameLock = await _gameMutationLock.AcquireAsync(gameId, ct);
        if (!_games.TryGet(gameId, out var game) || game is null)
            return;

        if (game.Status != GameStatus.InProgress || game.CurrentRoundNumber <= 0)
            return;

        var round = game.GetRound(game.CurrentRoundNumber);
        var now = DateTimeOffset.UtcNow;

        if (round.Phase == RoundPhase.Discussion &&
            IsTimerExpired(round.DiscussionStartedAtUtc, round.DiscussionDurationSeconds, now))
        {
            game.CloseDiscussionPhase();
            var discussionRoundNumber = round.RoundNumber;
            var discussionPhase = round.Phase.ToString();

            await PublishGameEventAsync(game.Id, "DiscussionClosed", new
            {
                gameId = game.Id,
                roundNumber = discussionRoundNumber,
                phase = discussionPhase,
                serverTimeUtc = DateTimeOffset.UtcNow
            });

            game.StartVotingPhase();
            _games.Upsert(game);

            round = game.GetRound(game.CurrentRoundNumber);
            var votingEndsAtUtc = ComputeEndsAtUtc(round.VotingStartedAtUtc, round.VotingDurationSeconds);

            await PublishGameEventAsync(game.Id, "VotingStarted", new
            {
                gameId = game.Id,
                roundNumber = round.RoundNumber,
                phase = round.Phase.ToString(),
                votingStartedAtUtc = round.VotingStartedAtUtc,
                votingDurationSeconds = round.VotingDurationSeconds,
                votingEndsAtUtc,
                serverTimeUtc = DateTimeOffset.UtcNow
            });
            return;
        }

        if (round.Phase != RoundPhase.Voting ||
            !IsTimerExpired(round.VotingStartedAtUtc, round.VotingDurationSeconds, now))
        {
            return;
        }

        var votingRoundNumber = round.RoundNumber;
        var votingPhase = round.Phase.ToString();
        var votingResolution = game.CloseVotingPhaseAndExecute();
        var advanceResult = game.AdvanceToNextRoundOrFinish();
        _games.Upsert(game);

        await PublishGameEventAsync(game.Id, "VotingClosed", new
        {
            gameId = game.Id,
            roundNumber = votingRoundNumber,
            phase = votingPhase,
            executedPlayerId = votingResolution.ExecutedPlayerId,
            executedPlayerRole = votingResolution.ExecutedPlayerRole?.ToString(),
            serverTimeUtc = DateTimeOffset.UtcNow
        });

        if (advanceResult.IsGameEnded)
        {
            await PublishGameEventAsync(game.Id, "GameEnded", new
            {
                gameId = game.Id,
                winner = advanceResult.Winner.ToString(),
                currentRoundNumber = advanceResult.CurrentRoundNumber,
                serverTimeUtc = DateTimeOffset.UtcNow
            });
            return;
        }

        await PublishGameEventAsync(game.Id, "RoundAdvanced", new
        {
            gameId = game.Id,
            currentRoundNumber = advanceResult.CurrentRoundNumber,
            serverTimeUtc = DateTimeOffset.UtcNow
        });
    }

    private Task PublishGameEventAsync(Guid gameId, string eventName, object payload)
        => _hub.Clients.Group(GameHub.GroupName(gameId)).SendAsync(eventName, payload);

    private static bool IsTimerExpired(DateTimeOffset? startedAtUtc, int? durationSeconds, DateTimeOffset now)
    {
        if (!startedAtUtc.HasValue || !durationSeconds.HasValue)
            return false;

        return now >= startedAtUtc.Value.AddSeconds(durationSeconds.Value);
    }

    private static DateTimeOffset? ComputeEndsAtUtc(DateTimeOffset? startedAtUtc, int? durationSeconds)
    {
        if (!startedAtUtc.HasValue || !durationSeconds.HasValue)
            return null;

        return startedAtUtc.Value.AddSeconds(durationSeconds.Value);
    }
}
