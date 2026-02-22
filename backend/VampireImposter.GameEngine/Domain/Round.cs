namespace VampireImposter.GameEngine.Domain;

public enum RoundPhase
{
    NotStarted = 0,
    Question = 1,
    Reveal = 2,
    Discussion = 3,
    Voting = 4,
    Finished = 5
}

public sealed record Vote(Guid VoterId, Guid TargetId, DateTimeOffset CastAtUtc);
public sealed record RoundAction(Guid PlayerId, Guid SelectedPlayerId, DateTimeOffset SubmittedAtUtc);

public sealed class Round
{
    private readonly Dictionary<Guid, Vote> _votesByVoter = new();
    private readonly Dictionary<Guid, RoundAction> _actionsByPlayer = new();

    public Guid Id { get; }
    public int RoundNumber { get; }
    public DateTimeOffset StartedAtUtc { get; }
    public DateTimeOffset? FinishedAtUtc { get; private set; }

    public RoundPhase Phase { get; private set; }

    // votes (one per voter)
    public IReadOnlyCollection<Vote> Votes => _votesByVoter.Values;
    public IReadOnlyCollection<RoundAction> Actions => _actionsByPlayer.Values;
    public string? QuestionText { get; private set; }
    public DateTimeOffset? QuestionStartedAtUtc { get; private set; }
    public DateTimeOffset? DiscussionStartedAtUtc { get; private set; }
    public int? DiscussionDurationSeconds { get; private set; }
    public DateTimeOffset? VotingStartedAtUtc { get; private set; }
    public int? VotingDurationSeconds { get; private set; }

    // who got eliminated/executed this round (if any)
    public Guid? EliminatedPlayerId { get; private set; }
    public Guid? ExecutedPlayerId { get; private set; }
    public Guid? NightKilledPlayerId { get; private set; }
    public Guid? HunterCheckedPlayerId { get; private set; }
    public bool? HunterDetectedVampire { get; private set; }

    // if the eliminated player was Hunter and can pick someone to take down with them (or any rule you want)
    public Guid? HunterTargetPlayerId { get; private set; }
    public Guid? VampireTargetPlayerId { get; private set; }

    public Round(Guid id, int roundNumber, RoundPhase phase = RoundPhase.Voting)
    {
        if (id == Guid.Empty) throw new ArgumentException("Round id cannot be empty.", nameof(id));
        if (roundNumber <= 0) throw new ArgumentOutOfRangeException(nameof(roundNumber), "Round number must be > 0.");
        if (!Enum.IsDefined(phase))
            throw new ArgumentOutOfRangeException(nameof(phase), "Invalid round phase.");
        if (phase == RoundPhase.Finished)
            throw new ArgumentException("Round cannot start in Finished phase.", nameof(phase));

        Id = id;
        RoundNumber = roundNumber;
        StartedAtUtc = DateTimeOffset.UtcNow;
        Phase = phase;
    }

    public void BeginQuestion(string questionText)
    {
        EnsurePhase(RoundPhase.NotStarted);

        if (string.IsNullOrWhiteSpace(questionText))
            throw new ArgumentException("Question text cannot be empty.", nameof(questionText));

        QuestionText = questionText.Trim();
        QuestionStartedAtUtc = DateTimeOffset.UtcNow;
        Phase = RoundPhase.Question;
    }

    public void SubmitAction(Guid playerId, Guid selectedPlayerId)
    {
        EnsurePhase(RoundPhase.Question);

        if (playerId == Guid.Empty) throw new ArgumentException("Player id cannot be empty.", nameof(playerId));
        if (selectedPlayerId == Guid.Empty) throw new ArgumentException("Selected player id cannot be empty.", nameof(selectedPlayerId));
        if (playerId == selectedPlayerId) throw new InvalidOperationException("Player cannot select themselves.");

        _actionsByPlayer[playerId] = new RoundAction(playerId, selectedPlayerId, DateTimeOffset.UtcNow);
    }

    public bool HasSubmittedAction(Guid playerId) => _actionsByPlayer.ContainsKey(playerId);

    public bool TryGetAction(Guid playerId, out RoundAction? action)
    {
        if (_actionsByPlayer.TryGetValue(playerId, out var existing))
        {
            action = existing;
            return true;
        }

        action = null;
        return false;
    }

    public void ResolveNight(Guid? killedPlayerId, Guid? hunterCheckedPlayerId, bool? hunterDetectedVampire)
    {
        EnsurePhase(RoundPhase.Question);

        NightKilledPlayerId = killedPlayerId;
        VampireTargetPlayerId = killedPlayerId;
        HunterCheckedPlayerId = hunterCheckedPlayerId;
        HunterDetectedVampire = hunterDetectedVampire;

        Phase = RoundPhase.Reveal;
    }

    public void BeginDiscussion(int durationSeconds)
    {
        EnsurePhase(RoundPhase.Reveal);

        if (durationSeconds <= 0)
            throw new ArgumentOutOfRangeException(nameof(durationSeconds), "Discussion duration must be > 0.");

        DiscussionDurationSeconds = durationSeconds;
        DiscussionStartedAtUtc = DateTimeOffset.UtcNow;
        Phase = RoundPhase.Discussion;
    }

    public void EndDiscussion()
    {
        EnsurePhase(RoundPhase.Discussion);
    }

    public void BeginVoting(int durationSeconds)
    {
        EnsurePhase(RoundPhase.Discussion);

        if (durationSeconds <= 0)
            throw new ArgumentOutOfRangeException(nameof(durationSeconds), "Voting duration must be > 0.");

        VotingDurationSeconds = durationSeconds;
        VotingStartedAtUtc = DateTimeOffset.UtcNow;
        Phase = RoundPhase.Voting;
    }

    public void EndVotingWithExecution(Guid? executedPlayerId)
    {
        EnsurePhase(RoundPhase.Voting);

        ExecutedPlayerId = executedPlayerId;
        EliminatedPlayerId = executedPlayerId;
        Phase = RoundPhase.Finished;
        FinishedAtUtc = DateTimeOffset.UtcNow;
    }

    public void CastVote(Guid voterId, Guid targetId)
    {
        EnsurePhase(RoundPhase.Voting);

        if (voterId == Guid.Empty) throw new ArgumentException("Voter id cannot be empty.", nameof(voterId));
        if (targetId == Guid.Empty) throw new ArgumentException("Target id cannot be empty.", nameof(targetId));
        if (voterId == targetId) throw new InvalidOperationException("A player cannot vote for themselves.");

        _votesByVoter[voterId] = new Vote(voterId, targetId, DateTimeOffset.UtcNow);
    }

    public bool HasVoted(Guid voterId) => _votesByVoter.ContainsKey(voterId);

    public void ClearVotes()
    {
        EnsurePhase(RoundPhase.Voting);
        _votesByVoter.Clear();
    }

    public Guid? GetLeadingTarget()
    {
        if (_votesByVoter.Count == 0) return null;

        // Count votes per target
        var counts = _votesByVoter.Values
            .GroupBy(v => v.TargetId)
            .Select(g => new { TargetId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToList();

        // If tie, return null (engine can decide tie-break rules later)
        if (counts.Count >= 2 && counts[0].Count == counts[1].Count)
            return null;

        return counts[0].TargetId;
    }

    public void Reveal(Guid? eliminatedPlayerId)
    {
        EnsurePhase(RoundPhase.Voting);

        Phase = RoundPhase.Reveal;
        EliminatedPlayerId = eliminatedPlayerId; // allow null for "no elimination" (tie/no votes)
    }

    public void SetHunterDecision(Guid hunterTargetPlayerId)
    {
        EnsurePhase(RoundPhase.Reveal);

        if (hunterTargetPlayerId == Guid.Empty)
            throw new ArgumentException("Hunter target id cannot be empty.", nameof(hunterTargetPlayerId));

        HunterTargetPlayerId = hunterTargetPlayerId;
    }

    public void Finish()
    {
        if (Phase == RoundPhase.Finished) return;

        Phase = RoundPhase.Finished;
        FinishedAtUtc = DateTimeOffset.UtcNow;
    }

    private void EnsurePhase(RoundPhase expected)
    {
        if (Phase != expected)
            throw new InvalidOperationException($"This action is only allowed in {expected} phase.");
    }

    public void SetVampireDecision(Guid targetPlayerId)
    {
        EnsurePhase(RoundPhase.Reveal);
        if (targetPlayerId == Guid.Empty) throw new ArgumentException("Target id cannot be empty.", nameof(targetPlayerId));
        VampireTargetPlayerId = targetPlayerId;
    }

}
