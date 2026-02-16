using System.Security.Cryptography;
using Microsoft.Extensions.Options;

namespace VampireImposter.Api.Application.Security;

public sealed class Pbkdf2GamePasscodeService : IGamePasscodeService
{
    private const string Format = "pbkdf2-sha256-v1";
    private readonly PasscodeSecurityOptions _options;

    public Pbkdf2GamePasscodeService(IOptions<PasscodeSecurityOptions> options)
    {
        _options = options.Value;
    }

    public string Hash(string passcode)
    {
        if (string.IsNullOrWhiteSpace(passcode))
            throw new ArgumentException("Passcode is required.", nameof(passcode));

        var salt = RandomNumberGenerator.GetBytes(_options.SaltSizeBytes);
        var hash = Derive(passcode, salt, _options.Pbkdf2Iterations, _options.HashSizeBytes);

        return string.Join(':',
            Format,
            _options.Pbkdf2Iterations.ToString(),
            Convert.ToBase64String(salt),
            Convert.ToBase64String(hash));
    }

    public bool Verify(string passcode, string encodedHash)
    {
        if (string.IsNullOrWhiteSpace(passcode) || string.IsNullOrWhiteSpace(encodedHash))
            return false;

        var parts = encodedHash.Split(':', StringSplitOptions.None);
        if (parts.Length != 4) return false;
        if (!string.Equals(parts[0], Format, StringComparison.Ordinal)) return false;
        if (!int.TryParse(parts[1], out var iterations) || iterations <= 0) return false;

        byte[] salt;
        byte[] expectedHash;

        try
        {
            salt = Convert.FromBase64String(parts[2]);
            expectedHash = Convert.FromBase64String(parts[3]);
        }
        catch (FormatException)
        {
            return false;
        }

        var actualHash = Derive(passcode, salt, iterations, expectedHash.Length);
        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }

    private byte[] Derive(string passcode, byte[] salt, int iterations, int hashSize)
    {
        var passcodeWithPepper = $"{passcode}{_options.PasscodePepper}";
        return Rfc2898DeriveBytes.Pbkdf2(
            passcodeWithPepper,
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            hashSize);
    }
}
