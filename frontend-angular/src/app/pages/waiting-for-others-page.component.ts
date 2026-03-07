import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { PhaseIndicatorComponent } from '../shared/ui/phase-indicator/phase-indicator.component';
import { PlayerChipComponent } from '../shared/ui/player-chip/player-chip.component';

interface ReadyPlayer {
  name: string;
  isGM: boolean;
  isDead: boolean;
  isReady: boolean;
}

@Component({
  standalone: true,
  imports: [AppHeaderComponent, PhaseIndicatorComponent, PlayerChipComponent],
  templateUrl: './waiting-for-others-page.component.html',
  styles: `
    .waiting-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      gap: 0.9rem;
      overflow: auto;
    }

    .top-row {
      display: flex;
      justify-content: flex-start;
    }

    .intro {
      text-align: center;
      margin-bottom: 0.25rem;
    }

    .hourglass {
      width: 3.2rem;
      height: 3.2rem;
      margin: 0 auto 0.65rem;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 10%, transparent);
      display: grid;
      place-items: center;
      font-size: 1.5rem;
      animation: pulse 1.5s ease-in-out infinite;
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

    .intro h2 {
      margin: 0;
      font-size: 1.45rem;
    }

    .intro p {
      margin: 0.35rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
    }

    .players-list {
      display: grid;
      gap: 0.55rem;
      align-content: start;
    }
  `
})
export class WaitingForOthersPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private timeoutId?: ReturnType<typeof setTimeout>;

  readonly players = signal<ReadyPlayer[]>([
    { name: 'Melih', isGM: true, isDead: false, isReady: true },
    { name: 'Deniz', isGM: false, isDead: false, isReady: true },
    { name: 'Eddie', isGM: false, isDead: false, isReady: true },
    { name: 'Ollie', isGM: false, isDead: false, isReady: false },
    { name: 'Ege', isGM: false, isDead: false, isReady: true },
    { name: 'Bilge', isGM: false, isDead: false, isReady: false }
  ]);

  ngOnInit(): void {
    this.timeoutId = setTimeout(() => {
      this.router.navigateByUrl('/day-discussion');
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
