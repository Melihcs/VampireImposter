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

    private readonly List<Player> _players = new();
    private readonly List<Round> _rounds = new();

    public Guid Id { get; }
    public string Name { get; }
    public Guid HostPlayerId { get; private set; }
    public int MaxPlayers { get; }
    public int DiscussionTime { get; }
    public int VotingTime { get; }
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
        int votingTime = DefaultVotingTime)
    {
        if (id == Guid.Empty) throw new ArgumentException("Game id cannot be empty.", nameof(id));

        Id = id;
        Name = string.IsNullOrWhiteSpace(name) ? $"Game {id:N}" : name.Trim();
        HostPlayerId = hostPlayerId ?? Guid.Empty;
        MaxPlayers = maxPlayers >= MinMaxPlayers ? maxPlayers : DefaultMaxPlayers;
        DiscussionTime = discussionTime > 0 ? discussionTime : DefaultDiscussionTime;
        VotingTime = votingTime > 0 ? votingTime : DefaultVotingTime;
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

    public Round StartNextRound()
    {
        EnsureInProgress();

        var roundNumber = _rounds.Count + 1;
        var round = new Round(Guid.NewGuid(), roundNumber);

        _rounds.Add(round);
        return round;
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
}
