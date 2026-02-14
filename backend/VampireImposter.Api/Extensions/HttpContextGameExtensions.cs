// HttpContextGameExtensions.cs
using Microsoft.AspNetCore.Http;
using Vampire.Api.Infrastructure.Auth;
using VampireImposter.GameEngine.Domain;

namespace Vampire.Api.Infrastructure;

public static class HttpContextGameExtensions
{
    public static Game CurrentGame(this HttpContext ctx)
    {
        if (ctx.Items.TryGetValue("CurrentGame", out var value) && value is Game g)
            return g;

        throw new InvalidOperationException("Current game is not available. Did you forget [RequireGame]?");
    }
}
