using Microsoft.AspNetCore.Http;
using Vampire.Api.Infrastructure.Auth;

public static class HttpContextTokenExtensions
{
    private const string PlayerTokenItemKey = HttpContextItemsKeys.PlayerToken;

    /// <summary>
    /// Returns the player token saved by RequirePlayerAttribute.
    /// Throws if the attribute wasn't applied.
    /// </summary>
    public static string PlayerToken(this HttpContext ctx)
    {
        if (ctx.Items.TryGetValue(PlayerTokenItemKey, out var val) && val is string s && !string.IsNullOrWhiteSpace(s))
            return s;

        // In case someone stored it as something else
        if (val is not null)
        {
            var str = val.ToString()?.Trim();
            if (!string.IsNullOrWhiteSpace(str))
                return str;
        }

        throw new InvalidOperationException("Player token is not available. Did you forget [RequirePlayer]?");
    }

    /// <summary>
    /// Safe version if you want to avoid exceptions.
    /// </summary>
    public static bool TryGetPlayerToken(this HttpContext ctx, out string? token)
    {
        token = null;

        if (ctx.Items.TryGetValue(PlayerTokenItemKey, out var val))
        {
            token = (val as string)?.Trim() ?? val?.ToString()?.Trim();
        }

        return !string.IsNullOrWhiteSpace(token);
    }
}
