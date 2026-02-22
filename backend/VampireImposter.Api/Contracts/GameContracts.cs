using System.ComponentModel.DataAnnotations;

namespace VampireImposter.Api.Contracts;

public sealed class CreateGameRequest
{
    [Required]
    [StringLength(60)]
    public required string Name { get; set; }

    [Range(2, 20)]
    public int MaxPlayers { get; set; } // optional

    [Required]
    [Range(1, int.MaxValue)]
    public int DiscussionTime { get; set; } // seconds

    [Required]
    [Range(1, int.MaxValue)]
    public int VotingTime { get; set; } // seconds

    [Required]
    [StringLength(64, MinimumLength = 4)]
    public required string Passcode { get; set; }
}

public sealed class JoinGameRequest
{
    [Required]
    [StringLength(64, MinimumLength = 4)]
    public required string Passcode { get; set; }
}

public sealed class AssignRoundQuestionRequest
{
    [StringLength(200)]
    public string? QuestionText { get; set; }
}

public sealed class SubmitRoundActionRequest
{
    [Required]
    public Guid SelectedPlayerId { get; set; }
}

public sealed class StartDiscussionRequest
{
    [Range(1, int.MaxValue)]
    public int? DurationSeconds { get; set; }
}

public sealed class StartVotingRequest
{
    [Range(1, int.MaxValue)]
    public int? DurationSeconds { get; set; }
}

public sealed class CastVoteRequest
{
    [Required]
    public Guid TargetPlayerId { get; set; }
}

public sealed class RoundStateDto
{
    public int RoundNumber { get; set; }
    public string Phase { get; set; } = "";
    public string? QuestionText { get; set; }
}

public sealed class NightResolutionDto
{
    public int RoundNumber { get; set; }
    public string Phase { get; set; } = "";
    public Guid? KilledPlayerId { get; set; }
    public Guid? HunterCheckedPlayerId { get; set; }
    public bool? HunterDetectedVampire { get; set; }
}

public sealed class VotingResolutionDto
{
    public int RoundNumber { get; set; }
    public string Phase { get; set; } = "";
    public Guid? ExecutedPlayerId { get; set; }
    public string? ExecutedPlayerRole { get; set; }
}

public sealed class GameAdvanceDto
{
    public bool IsGameEnded { get; set; }
    public string Winner { get; set; } = "None";
    public int CurrentRoundNumber { get; set; }
    public string GameState { get; set; } = "";
}

public sealed class HunterPrivateResultDto
{
    public bool IsVampire { get; set; }
}

public sealed class GameListItemDto
{
    public Guid GameId { get; set; }
    public string Name { get; set; } = "";
    public DateTimeOffset CreatedAtUtc { get; set; }
    public Guid HostPlayerId { get; set; }
    public int PlayerCount { get; set; }
    public int MaxPlayers { get; set; }
    public bool IsJoinable { get; set; }
    public bool PasscodeRequired { get; set; }
}

public sealed class GameDto
{
    public Guid GameId { get; set; }
    public string Name { get; set; } = "";
    public DateTimeOffset CreatedAtUtc { get; set; }
    public Guid HostPlayerId { get; set; }
    public string State { get; set; } = "Lobby";
    public Guid[] PlayerIds { get; set; } = Array.Empty<Guid>();
    public int PlayerCount { get; set; }
    public int MaxPlayers { get; set; }
    public int DiscussionTime { get; set; }
    public int VotingTime { get; set; }
    public bool IsJoinable { get; set; }
    public bool PasscodeRequired { get; set; }
}
