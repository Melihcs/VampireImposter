using System.ComponentModel.DataAnnotations;

namespace VampireImposter.Api.Application.Security;

public sealed class PasscodeSecurityOptions
{
    public const string SectionName = "Security";

    [Required]
    [MinLength(16)]
    public string PasscodePepper { get; init; } = string.Empty;

    [Range(10_000, int.MaxValue)]
    public int Pbkdf2Iterations { get; init; } = 120_000;

    [Range(16, 64)]
    public int SaltSizeBytes { get; init; } = 16;

    [Range(16, 64)]
    public int HashSizeBytes { get; init; } = 32;
}
