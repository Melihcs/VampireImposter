namespace VampireImposter.GameEngine.Domain;

public enum RoundPhase
{
    NotStarted = 0,
    Voting = 1,
    Reveal = 2,
    Finished = 3
}

public sealed record Vote(Guid VoterId, Guid TargetId, DateTimeOffset CastAtUtc);

public sealed class Round
{
    private readonly Dictionary<Guid, Vote> _votesByVoter = new();

    public Guid Id { get; }
    public int RoundNumber { get; }
    public DateTimeOffset StartedAtUtc { get; }
    public DateTimeOffset? FinishedAtUtc { get; private set; }

    public RoundPhase Phase { get; private set; }

    // votes (one per voter)
    public IReadOnlyCollection<Vote> Votes => _votesByVoter.Values;

    // who got eliminated this round (if any)
    public Guid? EliminatedPlayerId { get; private set; }

    // if the eliminated player was Hunter and can pick someone to take down with them (or any rule you want)
    public Guid? HunterTargetPlayerId { get; private set; }

    public Round(Guid id, int roundNumber)
    {
        if (id == Guid.Empty) throw new ArgumentException("Round id cannot be empty.", nameof(id));
        if (roundNumber <= 0) throw new ArgumentOutOfRangeException(nameof(roundNumber), "Round number must be > 0.");

        Id = id;
        RoundNumber = roundNumber;
        StartedAtUtc = DateTimeOffset.UtcNow;
        Phase = RoundPhase.Voting;
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
    public Guid? VampireTargetPlayerId { get; private set; }

    public void SetVampireDecision(Guid targetPlayerId)
    {
        EnsurePhase(RoundPhase.Reveal);
        if (targetPlayerId == Guid.Empty) throw new ArgumentException("Target id cannot be empty.", nameof(targetPlayerId));
        VampireTargetPlayerId = targetPlayerId;
    }

}
