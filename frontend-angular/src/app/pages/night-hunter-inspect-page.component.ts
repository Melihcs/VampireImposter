import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { PhaseIndicatorComponent } from '../shared/ui/phase-indicator/phase-indicator.component';
import { PlayerChipComponent } from '../shared/ui/player-chip/player-chip.component';

interface NightPlayer {
  name: string;
  isGM: boolean;
  isDead: boolean;
}

@Component({
  standalone: true,
  imports: [AppHeaderComponent, ButtonComponent, PhaseIndicatorComponent, PlayerChipComponent],
  templateUrl: './night-hunter-inspect-page.component.html',
  styles: `
    .hunter-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      padding: 1rem;
      overflow: auto;
    }

    .top-row {
      display: flex;
      justify-content: flex-start;
    }

    .phase-banner {
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.75rem;
    }

    .banner-title {
      margin: 0;
      color: var(--color-accent);
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .banner-text {
      margin: 0.35rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.8rem;
    }

    .selection-flow {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .selection-flow h2 {
      margin: 0;
      font-size: 1.45rem;
    }

    .subtitle {
      margin: 0;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
    }

    .players {
      flex: 1;
      display: grid;
      gap: 0.55rem;
      align-content: start;
    }

    .result-flow {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 0.7rem;
    }

    .eye {
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 12%, transparent);
      display: grid;
      place-items: center;
      font-size: 2rem;
    }

    .result-flow h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    .result-card {
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 82%, transparent);
      padding: 0.85rem 1rem;
      min-width: 11.5rem;
    }

    .result-label {
      margin: 0;
      color: var(--color-muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.7rem;
    }

    .result-value {
      margin: 0.35rem 0 0;
      font-size: 1.35rem;
      color: var(--color-accent);
      font-weight: 700;
    }

    .note {
      border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
      border-radius: 0.8rem;
      background: color-mix(in srgb, var(--color-muted) 25%, transparent);
      padding: 0.65rem;
      max-width: 17.5rem;
      font-size: 0.73rem;
      color: var(--color-muted-foreground);
      line-height: 1.45;
    }

    .result-actions {
      width: 100%;
      margin-top: 0.35rem;
    }

    .waiting-flow {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 0.5rem;
    }

    .moon {
      width: 3.2rem;
      height: 3.2rem;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 12%, transparent);
      display: grid;
      place-items: center;
      font-size: 1.45rem;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .waiting-flow h3 {
      margin: 0;
      font-size: 1.2rem;
    }

    .waiting-flow p {
      margin: 0;
      color: var(--color-muted-foreground);
      font-size: 0.8rem;
      max-width: 16rem;
      line-height: 1.45;
    }

    @keyframes pulse {
      0%,
      100% {
        transform: scale(1);
        opacity: 0.7;
      }
      50% {
        transform: scale(1.08);
        opacity: 1;
      }
    }
  `
})
export class NightHunterInspectPageComponent {
  private readonly router = inject(Router);

  readonly isHunter = true;
  readonly selectedTarget = signal<string | null>(null);
  readonly inspectResult = signal<string | null>(null);
  readonly players = signal<NightPlayer[]>([
    { name: 'Deniz', isGM: false, isDead: false },
    { name: 'Ollie', isGM: false, isDead: false },
    { name: 'Ege', isGM: false, isDead: false },
    { name: 'Bilge', isGM: false, isDead: false }
  ]);

  selectTarget(name: string): void {
    this.selectedTarget.set(name);
  }

  inspectPlayer(): void {
    if (!this.selectedTarget()) {
      return;
    }

    this.inspectResult.set('VILLAGER');
  }

  continueToGameOver(): void {
    this.router.navigateByUrl('/game-over');
  }
}
