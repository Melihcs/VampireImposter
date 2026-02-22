using VampireImposter.GameEngine.Domain;

namespace VampireImposter.GameEngine.Tests;

[TestClass]
public sealed class GameDomainTests
{
    [TestMethod]
    public void StartGame_WhenRequestedByNonHost_ReturnsHostOnly()
    {
        var (game, hostId, playerIds) = CreateLobbyWithPlayers(3);

        var result = game.StartGame(playerIds.First(id => id != hostId));

        Assert.AreEqual(GameStartStatus.HostOnly, result.Status);
        Assert.AreEqual(GameStatus.Lobby, game.Status);
    }

    [TestMethod]
    public void StartGame_WhenLessThanThreePlayers_ReturnsNotEnoughPlayers()
    {
        var (game, hostId, _) = CreateLobbyWithPlayers(2);

        var result = game.StartGame(hostId);

        Assert.AreEqual(GameStartStatus.NotEnoughPlayers, result.Status);
        Assert.AreEqual(GameStatus.Lobby, game.Status);
    }

    [TestMethod]
    public void StartGame_WhenValid_AssignsRolesAndCreatesFirstRound()
    {
        var (game, hostId, _) = CreateLobbyWithPlayers(5);

        var result = game.StartGame(hostId);

        Assert.AreEqual(GameStartStatus.Success, result.Status);
        Assert.AreEqual(GameStatus.InProgress, game.Status);
        Assert.AreEqual(1, game.CurrentRoundNumber);
        Assert.AreEqual(RoundPhase.NotStarted, game.GetRound(1).Phase);
        Assert.AreEqual(1, game.Players.Count(p => p.Role == PlayerRole.Vampire));
        Assert.AreEqual(1, game.Players.Count(p => p.Role == PlayerRole.Hunter));
        Assert.AreEqual(3, game.Players.Count(p => p.Role == PlayerRole.Villager));
        Assert.AreEqual(0, game.Players.Count(p => p.Role == PlayerRole.Unknown));
    }

    [TestMethod]
    public void CloseQuestionPhaseAndResolveNight_KillsTarget_AndRevealsRound()
    {
        var (game, hostId, _) = CreateLobbyWithPlayers(4);
        Assert.AreEqual(GameStartStatus.Success, game.StartGame(hostId).Status);

        var vampire = game.Players.Single(p => p.Role == PlayerRole.Vampire);
        var hunter = game.Players.Single(p => p.Role == PlayerRole.Hunter);
        var killTarget = game.Players.First(p => p.Id != vampire.Id).Id;

        game.AssignRoundQuestion("Who looks most suspicious?");
        game.SubmitRoundAction(vampire.Id, killTarget);
        game.SubmitRoundAction(hunter.Id, vampire.Id);

        var result = game.CloseQuestionPhaseAndResolveNight();
        var round = game.GetRound(1);

        Assert.AreEqual(killTarget, result.KilledPlayerId);
        Assert.AreEqual(vampire.Id, result.HunterCheckedPlayerId);
        Assert.IsTrue(result.HunterDetectedVampire.HasValue);
        Assert.IsTrue(result.HunterDetectedVampire.Value);
        Assert.AreEqual(RoundPhase.Reveal, round.Phase);
        Assert.IsFalse(game.GetPlayer(killTarget).IsAlive);
    }

    [TestMethod]
    public void GetPrivateHunterResult_WhenRequesterIsHunter_ReturnsActualDetection()
    {
        var (game, hostId, _) = CreateLobbyWithPlayers(4);
        Assert.AreEqual(GameStartStatus.Success, game.StartGame(hostId).Status);

        var vampire = game.Players.Single(p => p.Role == PlayerRole.Vampire);
        var hunter = game.Players.Single(p => p.Role == PlayerRole.Hunter);

        game.AssignRoundQuestion("Who is giving strange answers?");
        game.SubmitRoundAction(hunter.Id, vampire.Id);
        game.CloseQuestionPhaseAndResolveNight();

        var result = game.GetPrivateHunterResult(hunter.Id);

        Assert.IsTrue(result);
    }

    [TestMethod]
    public void VotingFlow_ExecutesLeadingTarget_AndFinishesRound()
    {
        var (game, hostId, _) = CreateLobbyWithPlayers(5);
        Assert.AreEqual(GameStartStatus.Success, game.StartGame(hostId).Status);

        game.AssignRoundQuestion("Who would lose a game of hide and seek first?");
        game.CloseQuestionPhaseAndResolveNight();
        game.StartDiscussionPhase(5);
        game.CloseDiscussionPhase();
        game.StartVotingPhase(5);

        var target = game.Players.First(p => p.IsAlive && p.Role != PlayerRole.Vampire).Id;
        var voters = game.Players.Where(p => p.IsAlive && p.Id != target).Take(2).Select(p => p.Id).ToArray();
        foreach (var voter in voters)
            game.CastVote(voter, target);

        var voteResult = game.CloseVotingPhaseAndExecute();
        var round = game.GetRound(1);

        Assert.AreEqual(target, voteResult.ExecutedPlayerId);
        Assert.IsFalse(game.GetPlayer(target).IsAlive);
        Assert.AreEqual(RoundPhase.Finished, round.Phase);
    }

    [TestMethod]
    public void AdvanceToNextRoundOrFinish_WhenVampireExecuted_EndsGameWithVillagersWin()
    {
        var (game, hostId, _) = CreateLobbyWithPlayers(5);
        Assert.AreEqual(GameStartStatus.Success, game.StartGame(hostId).Status);

        game.AssignRoundQuestion("Who has the strongest poker face?");
        game.CloseQuestionPhaseAndResolveNight();
        game.StartDiscussionPhase();
        game.CloseDiscussionPhase();
        game.StartVotingPhase();

        var vampire = game.Players.Single(p => p.Role == PlayerRole.Vampire).Id;
        var voters = game.Players.Where(p => p.IsAlive && p.Id != vampire).Take(2).Select(p => p.Id).ToArray();
        foreach (var voter in voters)
            game.CastVote(voter, vampire);

        game.CloseVotingPhaseAndExecute();
        var advance = game.AdvanceToNextRoundOrFinish();

        Assert.IsTrue(advance.IsGameEnded);
        Assert.AreEqual(GameWinner.Villagers, advance.Winner);
        Assert.AreEqual(GameStatus.Finished, game.Status);
    }

    [TestMethod]
    public void AdvanceToNextRoundOrFinish_WhenGameContinues_StartsRoundTwo()
    {
        var (game, hostId, _) = CreateLobbyWithPlayers(5);
        Assert.AreEqual(GameStartStatus.Success, game.StartGame(hostId).Status);

        game.AssignRoundQuestion("Who would forget their own birthday first?");
        game.CloseQuestionPhaseAndResolveNight();
        game.StartDiscussionPhase();
        game.CloseDiscussionPhase();
        game.StartVotingPhase();

        var target = game.Players.First(p => p.IsAlive && p.Role != PlayerRole.Vampire).Id;
        var voters = game.Players.Where(p => p.IsAlive && p.Id != target).Take(2).Select(p => p.Id).ToArray();
        foreach (var voter in voters)
            game.CastVote(voter, target);

        game.CloseVotingPhaseAndExecute();
        var advance = game.AdvanceToNextRoundOrFinish();

        Assert.IsFalse(advance.IsGameEnded);
        Assert.AreEqual(GameWinner.None, advance.Winner);
        Assert.AreEqual(GameStatus.InProgress, game.Status);
        Assert.AreEqual(2, advance.CurrentRoundNumber);
        Assert.AreEqual(2, game.CurrentRoundNumber);
        Assert.AreEqual(RoundPhase.NotStarted, game.GetRound(2).Phase);
    }

    private static (Game Game, Guid HostId, IReadOnlyList<Guid> PlayerIds) CreateLobbyWithPlayers(int count)
    {
        if (count < 1) throw new ArgumentOutOfRangeException(nameof(count));

        var hostId = Guid.NewGuid();
        var game = new Game(
            id: Guid.NewGuid(),
            name: "Test Game",
            hostPlayerId: hostId,
            maxPlayers: Math.Max(10, count),
            discussionTime: 10,
            votingTime: 10);

        var playerIds = new List<Guid>(count) { hostId };
        game.AddPlayer(hostId, "Host");

        for (var i = 2; i <= count; i++)
        {
            var id = Guid.NewGuid();
            playerIds.Add(id);
            game.AddPlayer(id, $"Player{i}");
        }

        return (game, hostId, playerIds);
    }
}
