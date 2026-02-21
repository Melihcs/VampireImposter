using System.ComponentModel.DataAnnotations;

namespace VampireImposter.Api.Contracts;

public sealed record CreatePlayerRequest(string Name);
public sealed record RenamePlayerRequest(
    [Required]
    [StringLength(32, MinimumLength = 1)]
    [RegularExpression(@".*\S.*", ErrorMessage = "Name is required.")]
    string Name);

public sealed record CreatePlayerResponse(Guid PlayerId, string Name, string PlayerToken);
public sealed record PlayerDto(Guid PlayerId, string Name, DateTime CreatedAtUtc);
