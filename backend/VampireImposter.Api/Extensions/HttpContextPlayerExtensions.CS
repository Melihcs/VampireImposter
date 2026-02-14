// HttpContextPlayerExtensions.cs
using Microsoft.AspNetCore.Http;
using Vampire.Api.Infrastructure.Auth;
using VampireImposter.Storage;

namespace Vampire.Api.Infrastructure;

public static class HttpContextPlayerExtensions
{
    public static PlayerSession CurrentPlayer(this HttpContext ctx)
    {
        if (ctx.Items.TryGetValue(HttpContextItemsKeys.Player, out var value) && value is PlayerSession p)
            return p;

        throw new InvalidOperationException("Current player is not available. Did you forget [RequirePlayer]?");
    }
}
