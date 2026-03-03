namespace VampireImposter.Api.Application.Concurrency;

public interface IGameMutationLock
{
    ValueTask<IAsyncDisposable> AcquireAsync(Guid gameId, CancellationToken ct);
}
