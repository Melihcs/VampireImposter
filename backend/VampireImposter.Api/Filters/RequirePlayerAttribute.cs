// RequirePlayerAttribute.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using VampireImposter.Storage;

namespace Vampire.Api.Infrastructure.Auth;

/// <summary>
/// Ensures a valid player token exists and resolves the PlayerSession from IPlayerStore.
/// Stores the resolved player session and token in HttpContext.Items for downstream usage.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequirePlayerAttribute : Attribute, IAsyncActionFilter
{
    public const string HeaderName = "X-Player-Token";
    private const string PlayerItemKey = HttpContextItemsKeys.Player;
    private const string PlayerTokenItemKey = HttpContextItemsKeys.PlayerToken;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var http = context.HttpContext;

        if (!TryGetToken(http.Request, out var token))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var players = http.RequestServices.GetRequiredService<IPlayerStore>();

        if (!players.TryGetByToken(token!, out var player) || player is null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        http.Items[PlayerItemKey] = player;
        http.Items[PlayerTokenItemKey] = token!;

        await next();
    }

    private static bool TryGetToken(HttpRequest request, out string? token)
    {
        token = null;

        // 1) Header: X-Player-Token: abc
        if (request.Headers.TryGetValue(HeaderName, out var direct) && !string.IsNullOrWhiteSpace(direct))
        {
            token = direct.ToString().Trim();
            return true;
        }

        // 2) Authorization: Bearer abc
        if (request.Headers.TryGetValue("Authorization", out var auth) &&
            auth.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = auth.ToString().Substring("Bearer ".Length).Trim();
            return !string.IsNullOrWhiteSpace(token);
        }

        return false;
    }
}

internal static class HttpContextItemsKeys
{
    public const string Player = "CurrentPlayer";
    public const string PlayerToken = "CurrentPlayerToken";
}
