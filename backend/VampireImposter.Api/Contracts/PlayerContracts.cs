using System.ComponentModel.DataAnnotations;

namespace VampireImposter.Api.Contracts;

public sealed record CreatePlayerRequest(string Name);
public sealed record RenamePlayerRequest(
    [property: Required]
    [property: StringLength(32, MinimumLength = 1)]
    [property: RegularExpression(@".*\S.*", ErrorMessage = "Name is required.")]
    string Name);

public sealed record CreatePlayerResponse(Guid PlayerId, string Name, string PlayerToken);
public sealed record PlayerDto(Guid PlayerId, string Name, DateTime CreatedAtUtc);
