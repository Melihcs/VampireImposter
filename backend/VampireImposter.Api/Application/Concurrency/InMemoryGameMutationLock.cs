using System.Collections.Concurrent;

namespace VampireImposter.Api.Application.Concurrency;

public sealed class InMemoryGameMutationLock : IGameMutationLock
{
    private readonly ConcurrentDictionary<Guid, SemaphoreSlim> _locks = new();

    public async ValueTask<IAsyncDisposable> AcquireAsync(Guid gameId, CancellationToken ct)
    {
        var gate = _locks.GetOrAdd(gameId, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(ct);
        return new Releaser(gate);
    }

    private sealed class Releaser : IAsyncDisposable
    {
        private readonly SemaphoreSlim _gate;
        private int _released;

        public Releaser(SemaphoreSlim gate)
        {
            _gate = gate;
        }

        public ValueTask DisposeAsync()
        {
            if (Interlocked.Exchange(ref _released, 1) == 0)
                _gate.Release();

            return ValueTask.CompletedTask;
        }
    }
}
