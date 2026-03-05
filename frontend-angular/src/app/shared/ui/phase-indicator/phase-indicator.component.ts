import { Component, Input } from '@angular/core';

export type GamePhase = 'lobby' | 'reveal' | 'day' | 'vote' | 'execute' | 'night';

const PHASE_META: Record<GamePhase, { icon: string; label: string; color: string }> = {
  lobby: { icon: '👥', label: 'Lobby', color: 'var(--color-muted-foreground)' },
  reveal: { icon: '👁', label: 'Role Reveal', color: 'var(--color-accent)' },
  day: { icon: '☀', label: 'Day Discussion', color: 'var(--color-warning)' },
  vote: { icon: '🗳', label: 'Voting', color: 'var(--color-accent)' },
  execute: { icon: '☠', label: 'Execution', color: 'var(--color-destructive)' },
  night: { icon: '🌙', label: 'Night Phase', color: 'var(--color-accent)' }
};

@Component({
  selector: 'app-phase-indicator',
  standalone: true,
  template: `
    <div class="phase-pill">
      <span class="phase-icon" [style.color]="meta.color" aria-hidden="true">{{ meta.icon }}</span>
      <span class="phase-label">{{ meta.label }}</span>
    </div>
  `,
  styles: `
    .phase-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.45rem 0.8rem;
    }

    .phase-icon {
      line-height: 1;
      font-size: 0.9rem;
    }

    .phase-label {
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.72rem;
      font-weight: 600;
    }
  `
})
export class PhaseIndicatorComponent {
  @Input() phase: GamePhase = 'lobby';

  get meta(): { icon: string; label: string; color: string } {
    return PHASE_META[this.phase] ?? PHASE_META.lobby;
  }
}
