import { Moon, Sun, Vote, Skull, Users, Eye } from 'lucide-react';

type Phase = 'lobby' | 'reveal' | 'day' | 'vote' | 'execute' | 'night';

interface PhaseIndicatorProps {
  phase: Phase;
}

export function PhaseIndicator({ phase }: PhaseIndicatorProps) {
  const phases = {
    lobby: { icon: Users, label: 'Lobby', color: 'text-muted-foreground' },
    reveal: { icon: Eye, label: 'Role Reveal', color: 'text-accent' },
    day: { icon: Sun, label: 'Day Discussion', color: 'text-warning' },
    vote: { icon: Vote, label: 'Voting', color: 'text-accent' },
    execute: { icon: Skull, label: 'Execution', color: 'text-destructive' },
    night: { icon: Moon, label: 'Night Phase', color: 'text-accent' },
  };

  const current = phases[phase];
  const Icon = current.icon;

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
      <Icon className={`w-4 h-4 ${current.color}`} />
      <span className="text-sm font-medium uppercase tracking-wider" style={{ fontVariant: 'small-caps' }}>
        {current.label}
      </span>
    </div>
  );
}
