using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using VampireImposter.GameEngine.Domain;
using VampireImposter.Storage;

namespace Vampire.Api.Infrastructure.Auth;

/// <summary>
/// Ensures the authenticated player is the host of the resolved game.
/// This attribute should be used together with [RequirePlayer] and [RequireGame].
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequireHostAttribute : Attribute, IAsyncActionFilter, IOrderedFilter
{
    // Run after [RequirePlayer] and [RequireGame] (default order 0)
    public int Order => 1000;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var http = context.HttpContext;

        if (!http.Items.TryGetValue(HttpContextItemsKeys.Player, out var playerObj) || playerObj is not PlayerSession player)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (!http.Items.TryGetValue("CurrentGame", out var gameObj) || gameObj is not Game game)
        {
            context.Result = new NotFoundResult();
            return;
        }

        if (player.Id != game.HostPlayerId)
        {
            context.Result = new ObjectResult(new ProblemDetails
            {
                Title = "Forbidden",
                Detail = "Only the host can perform this action.",
                Status = StatusCodes.Status403Forbidden
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return;
        }

        await next();
    }
}
