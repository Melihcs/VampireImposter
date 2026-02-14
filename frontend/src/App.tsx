import { useEffect, useState } from 'react';

type Player = {
  id: number;
  name: string;
  position: string;
};

type LoadState = 'loading' | 'ready' | 'error';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        const data: Player[] = await response.json();
        if (!cancelled) {
          setPlayers(data);
          setState('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setState('error');
        }
      }
    };

    loadPlayers();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-red-500 text-white p-4 rounded-b-2xl shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Vampire Imposter</h1>
            <p className="text-sm opacity-90">Suspects and survivors</p>
          </div>
          <span className="rounded-full bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.2em]">
            Live Roster
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        {state === 'loading' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
            <div className="text-lg font-semibold">Loading players...</div>
            <div className="mt-2 h-2 w-48 animate-pulse rounded-full bg-red-500/60" />
          </div>
        )}

        {state === 'error' && (
          <div className="rounded-xl border border-red-400 bg-red-500/10 p-6 text-red-100">
            <div className="text-lg font-semibold">Unable to load players</div>
            <p className="mt-2 text-sm text-red-200">{error}</p>
          </div>
        )}

        {state === 'ready' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold text-white">{player.name}</div>
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                    #{player.id}
                  </span>
                </div>
                <div className="mt-3 inline-flex rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-200">
                  {player.position}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
