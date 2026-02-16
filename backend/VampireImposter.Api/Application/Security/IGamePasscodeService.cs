namespace VampireImposter.Api.Application.Security;

public interface IGamePasscodeService
{
    string Hash(string passcode);
    bool Verify(string passcode, string encodedHash);
}
