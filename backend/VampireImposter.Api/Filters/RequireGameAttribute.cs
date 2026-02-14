// RequireGameAttribute.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using VampireImposter.GameEngine.Domain;
using VampireImposter.Storage;

namespace Vampire.Api.Infrastructure.Auth;

/// <summary>
/// Ensures a game exists for the given route parameter (default: "gameId").
/// Stores the resolved Game in HttpContext.Items for downstream usage.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequireGameAttribute : Attribute, IAsyncActionFilter
{
    private readonly string _routeKey;
    private const string GameItemKey = "CurrentGame";

    public RequireGameAttribute(string routeKey = "gameId")
    {
        _routeKey = routeKey;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var http = context.HttpContext;

        if (!TryGetGameId(context, out var gameId))
        {
            context.Result = new BadRequestObjectResult(new { error = $"Route parameter '{_routeKey}' must be a GUID." });
            return;
        }

        var games = http.RequestServices.GetRequiredService<IGameStore>();

        if (!games.TryGet(gameId, out var game) || game is null)
        {
            context.Result = new NotFoundResult();
            return;
        }

        http.Items[GameItemKey] = game;

        await next();
    }

    private bool TryGetGameId(ActionExecutingContext context, out Guid gameId)
    {
        gameId = default;

        // Prefer bound action arguments (best case)
        if (context.ActionArguments.TryGetValue(_routeKey, out var val) && val is Guid g)
        {
            gameId = g;
            return true;
        }

        // Fallback: raw route values
        if (context.RouteData.Values.TryGetValue(_routeKey, out var raw) &&
            raw is not null &&
            Guid.TryParse(raw.ToString(), out var parsed))
        {
            gameId = parsed;
            return true;
        }

        return false;
    }
}
