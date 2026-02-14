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
}
