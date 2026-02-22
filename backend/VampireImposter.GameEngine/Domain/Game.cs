using VampireImposter.GameEngine.Domain;

namespace VampireImposter.GameEngine.Domain;

public enum GameStatus
{
    Lobby = 0,
    InProgress = 1,
    Finished = 2
}

public sealed class Game
{
    private const int MinPlayersToStart = 3;
    private const int MinMaxPlayers = 2;
    private const int DefaultMaxPlayers = 10;
    private const int DefaultDiscussionTime = 60;
    private const int DefaultVotingTime = 60;
    private static readonly string[] QuestionPool =
    {
        "Who would survive longest in a zombie apocalypse?",
        "Who is most likely to laugh at the wrong time?",
        "Who would accidentally reveal a top secret first?",
        "Who is most likely to start a dance battle in public?",
        "Who would get lost in their own neighborhood?",
        "Who is most likely to adopt a pet vampire bat?",
        "Who would win a dramatic staring contest?",
        "Who is most likely to prank the whole group?",
        "Who would become famous for a strange talent?",
        "Who is most likely to trust a suspicious stranger?"
    };

    private readonly List<Player> _players = new();
    private readonly List<Round> _rounds = new();

    public Guid Id { get; }
    public string Name { get; }
    public Guid HostPlayerId { get; private set; }
    public int MaxPlayers { get; }
    public int DiscussionTime { get; }
    public int VotingTime { get; }
    public string PasscodeHash { get; }
    public bool PasscodeRequired => !string.IsNullOrWhiteSpace(PasscodeHash);
    public DateTimeOffset CreatedAtUtc { get; }
    public DateTimeOffset? StartedAtUtc { get; private set; }
    public DateTimeOffset? FinishedAtUtc { get; private set; }

    public GameStatus Status { get; private set; }

    public IReadOnlyList<Player> Players => _players;
    public IReadOnlyList<Round> Rounds => _rounds;

    public int CurrentRoundNumber => _rounds.Count; // 0 in lobby, 1 after first round is created

    public Game(
        Guid id,
        string? name = null,
        Guid? hostPlayerId = null,
        int maxPlayers = DefaultMaxPlayers,
        int discussionTime = DefaultDiscussionTime,
        int votingTime = DefaultVotingTime,
        string? passcodeHash = null)
    {
        if (id == Guid.Empty) throw new ArgumentException("Game id cannot be empty.", nameof(id));

        Id = id;
        Name = string.IsNullOrWhiteSpace(name) ? $"Game {id:N}" : name.Trim();
        HostPlayerId = hostPlayerId ?? Guid.Empty;
        MaxPlayers = maxPlayers >= MinMaxPlayers ? maxPlayers : DefaultMaxPlayers;
        DiscussionTime = discussionTime > 0 ? discussionTime : DefaultDiscussionTime;
        VotingTime = votingTime > 0 ? votingTime : DefaultVotingTime;
        PasscodeHash = passcodeHash?.Trim() ?? string.Empty;
        CreatedAtUtc = DateTimeOffset.UtcNow;
        Status = GameStatus.Lobby;
    }

    public Player AddPlayer(Guid playerId, string name)
    {
        EnsureLobby();

        if (_players.Count >= MaxPlayers)
            throw new InvalidOperationException("Game is full.");

        if (_players.Any(p => p.Id == playerId))
            throw new InvalidOperationException("Player already exists in this game.");

        if (_players.Any(p => string.Equals(p.Name, name?.Trim(), StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Player name already taken in this game.");

        var player = new Player(playerId, name);
        _players.Add(player);

        if (HostPlayerId == Guid.Empty)
            HostPlayerId = playerId;

        return player;
    }

    public GameJoinLobbyResult JoinLobby(Guid playerId, string playerName, bool isPasscodeValid)
    {
        if (PasscodeRequired && !isPasscodeValid)
            return new GameJoinLobbyResult(GameJoinLobbyStatus.InvalidPasscode);

        if (Status != GameStatus.Lobby)
            return new GameJoinLobbyResult(GameJoinLobbyStatus.NotJoinable);

        if (_players.Any(p => p.Id == playerId))
            return new GameJoinLobbyResult(GameJoinLobbyStatus.Success);

        try
        {
            AddPlayer(playerId, playerName);
            return new GameJoinLobbyResult(GameJoinLobbyStatus.Success);
        }
        catch (InvalidOperationException ex)
        {
            return new GameJoinLobbyResult(GameJoinLobbyStatus.Conflict, ex.Message);
        }
    }

    public void RemovePlayer(Guid playerId)
    {
        EnsureLobby();

        var idx = _players.FindIndex(p => p.Id == playerId);
        if (idx < 0) return;

        var wasHost = _players[idx].Id == HostPlayerId;
        _players.RemoveAt(idx);

        if (wasHost)
            HostPlayerId = _players.FirstOrDefault()?.Id ?? Guid.Empty;
    }

    public Player GetPlayer(Guid playerId)
        => _players.FirstOrDefault(p => p.Id == playerId)
           ?? throw new KeyNotFoundException("Player not found.");

    public void Start()
    {
        EnsureLobby();

        if (_players.Count < MinPlayersToStart)
            throw new InvalidOperationException("At least 3 players are required to start.");

        StartedAtUtc = DateTimeOffset.UtcNow;
        Status = GameStatus.InProgress;
    }

    public GameStartResult StartGame(Guid requestedByPlayerId)
    {
        if (requestedByPlayerId != HostPlayerId)
            return new GameStartResult(GameStartStatus.HostOnly, "Only the host can start the game.");

        if (Status != GameStatus.Lobby)
            return new GameStartResult(GameStartStatus.NotJoinable, "Game is not in Lobby state.");

        if (_players.Count < MinPlayersToStart)
            return new GameStartResult(GameStartStatus.NotEnoughPlayers, "At least 3 players are required to start.");

        try
        {
            Start();
            AssignStartRoles();
            StartNextRound(RoundPhase.NotStarted);
            return new GameStartResult(GameStartStatus.Success);
        }
        catch (InvalidOperationException ex)
        {
            return new GameStartResult(GameStartStatus.Conflict, ex.Message);
        }
    }

    public Round StartNextRound(RoundPhase phase = RoundPhase.Voting)
    {
        EnsureInProgress();

        var roundNumber = _rounds.Count + 1;
        var round = new Round(Guid.NewGuid(), roundNumber, phase);

        _rounds.Add(round);
        return round;
    }

    public Round StartRound()
    {
        EnsureInProgress();

        if (_rounds.LastOrDefault() is { Phase: not RoundPhase.Finished })
            throw new InvalidOperationException("Current round must be finished before starting a new one.");

        return StartNextRound(RoundPhase.NotStarted);
    }

    public void AssignRoundQuestion(string? questionText = null)
    {
        EnsureInProgress();

        var round = GetCurrentRound();
        var selectedQuestion = string.IsNullOrWhiteSpace(questionText) ? GetRandomQuestion() : questionText.Trim();
        round.BeginQuestion(selectedQuestion);
    }

    public void SubmitRoundAction(Guid playerId, Guid selectedPlayerId)
    {
        EnsureInProgress();
        EnsurePlayerAlive(playerId);
        EnsurePlayerAlive(selectedPlayerId);

        var round = GetCurrentRound();
        round.SubmitAction(playerId, selectedPlayerId);
    }

    public NightResolutionResult CloseQuestionPhaseAndResolveNight()
    {
        EnsureInProgress();

        var round = GetCurrentRound();

        var vampire = _players.FirstOrDefault(p => p.IsAlive && p.Role == PlayerRole.Vampire);
        var hunter = _players.FirstOrDefault(p => p.IsAlive && p.Role == PlayerRole.Hunter);

        Guid? killedPlayerId = null;
        if (vampire is not null &&
            round.TryGetAction(vampire.Id, out var vampireAction) &&
            vampireAction is not null)
        {
            killedPlayerId = vampireAction.SelectedPlayerId;
            EnsurePlayerAlive(killedPlayerId.Value);
            GetPlayer(killedPlayerId.Value).Kill();
        }

        Guid? hunterCheckedPlayerId = null;
        bool? hunterDetectedVampire = null;
        if (hunter is not null &&
            round.TryGetAction(hunter.Id, out var hunterAction) &&
            hunterAction is not null)
        {
            hunterCheckedPlayerId = hunterAction.SelectedPlayerId;
            hunterDetectedVampire = GetPlayer(hunterCheckedPlayerId.Value).Role == PlayerRole.Vampire;
        }

        round.ResolveNight(killedPlayerId, hunterCheckedPlayerId, hunterDetectedVampire);
        return new NightResolutionResult(killedPlayerId, hunterCheckedPlayerId, hunterDetectedVampire);
    }

    public void StartDiscussionPhase(int? durationSeconds = null)
    {
        EnsureInProgress();

        var round = GetCurrentRound();
        round.BeginDiscussion(durationSeconds ?? DiscussionTime);
    }

    public void CloseDiscussionPhase()
    {
        EnsureInProgress();

        var round = GetCurrentRound();
        round.EndDiscussion();
    }

    public void StartVotingPhase(int? durationSeconds = null)
    {
        EnsureInProgress();

        var round = GetCurrentRound();
        round.BeginVoting(durationSeconds ?? VotingTime);
    }

    public void CastVote(Guid voterPlayerId, Guid targetPlayerId)
    {
        EnsureInProgress();
        EnsurePlayerAlive(voterPlayerId);
        EnsurePlayerAlive(targetPlayerId);

        var round = GetCurrentRound();
        round.CastVote(voterPlayerId, targetPlayerId);
    }

    public VotingResolutionResult CloseVotingPhaseAndExecute()
    {
        EnsureInProgress();

        var round = GetCurrentRound();
        var executedPlayerId = round.GetLeadingTarget();
        PlayerRole? executedRole = null;

        if (executedPlayerId is Guid playerId)
        {
            var executed = GetPlayer(playerId);
            executedRole = executed.Role;
            executed.Kill();
        }

        round.EndVotingWithExecution(executedPlayerId);
        return new VotingResolutionResult(executedPlayerId, executedRole);
    }

    public GameEndEvaluationResult EvaluateGameEnd()
    {
        EnsureInProgress();

        var round = GetCurrentRound();
        if (round.ExecutedPlayerId is not Guid executedPlayerId)
            return new GameEndEvaluationResult(false, GameWinner.None, "No execution this round.");

        var executedRole = GetPlayer(executedPlayerId).Role;
        if (executedRole == PlayerRole.Vampire)
        {
            Finish();
            return new GameEndEvaluationResult(true, GameWinner.Villagers, "Vampire was executed.");
        }

        if ((executedRole == PlayerRole.Villager || executedRole == PlayerRole.Hunter) &&
            _players.Count(p => p.IsAlive) < 4)
        {
            Finish();
            return new GameEndEvaluationResult(true, GameWinner.Vampires, "Alive player count dropped below 4.");
        }

        return new GameEndEvaluationResult(false, GameWinner.None, "Game continues.");
    }

    public AdvanceRoundResult AdvanceToNextRoundOrFinish()
    {
        EnsureInProgress();

        var end = EvaluateGameEnd();
        if (end.IsGameEnded)
            return new AdvanceRoundResult(true, end.Winner, CurrentRoundNumber);

        var nextRound = StartRound();
        return new AdvanceRoundResult(false, GameWinner.None, nextRound.RoundNumber);
    }

    public bool GetPrivateHunterResult(Guid requestingPlayerId)
    {
        EnsureInProgress();

        var requester = GetPlayer(requestingPlayerId);
        if (requester.Role != PlayerRole.Hunter)
            return Random.Shared.Next(0, 2) == 1;

        var round = GetCurrentRound();
        if (round.HunterDetectedVampire.HasValue)
            return round.HunterDetectedVampire.Value;

        return Random.Shared.Next(0, 2) == 1;
    }

    public Round GetRound(int roundNumber)
        => _rounds.FirstOrDefault(r => r.RoundNumber == roundNumber)
           ?? throw new KeyNotFoundException("Round not found.");

    public void Finish()
    {
        if (Status == GameStatus.Finished) return;

        Status = GameStatus.Finished;
        FinishedAtUtc = DateTimeOffset.UtcNow;
    }

    private void EnsureLobby()
    {
        if (Status != GameStatus.Lobby)
            throw new InvalidOperationException("This action is only allowed in Lobby state.");
    }

    private void EnsureInProgress()
    {
        if (Status != GameStatus.InProgress)
            throw new InvalidOperationException("This action is only allowed when the game is in progress.");
    }

    private void AssignStartRoles()
    {
        var randomizedPlayers = _players
            .OrderBy(_ => Random.Shared.Next())
            .ToList();

        randomizedPlayers[0].AssignRole(PlayerRole.Vampire);
        randomizedPlayers[1].AssignRole(PlayerRole.Hunter);

        for (var i = 2; i < randomizedPlayers.Count; i++)
            randomizedPlayers[i].AssignRole(PlayerRole.Villager);
    }

    private Round GetCurrentRound()
        => _rounds.LastOrDefault()
           ?? throw new InvalidOperationException("No rounds have been started.");

    private void EnsurePlayerAlive(Guid playerId)
    {
        var player = GetPlayer(playerId);
        if (!player.IsAlive)
            throw new InvalidOperationException("Dead players cannot perform this action.");
    }

    private static string GetRandomQuestion()
        => QuestionPool[Random.Shared.Next(QuestionPool.Length)];
}
