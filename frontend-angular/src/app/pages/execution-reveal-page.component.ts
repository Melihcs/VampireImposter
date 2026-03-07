import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { PhaseIndicatorComponent } from '../shared/ui/phase-indicator/phase-indicator.component';

@Component({
  standalone: true,
  imports: [AppHeaderComponent, ButtonComponent, PhaseIndicatorComponent],
  templateUrl: './execution-reveal-page.component.html',
  styles: `
    .execution-page {
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
    }

    .top-row {
      display: flex;
      justify-content: flex-start;
    }

    .center {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 0.7rem;
    }

    .skull {
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-destructive) 35%, transparent);
      background: color-mix(in srgb, var(--color-destructive) 12%, transparent);
      display: grid;
      place-items: center;
      font-size: 2rem;
    }

    .center h2 {
      margin: 0;
      font-size: 1.8rem;
      line-height: 1.1;
    }

    .executed-text {
      margin: 0;
      font-size: 0.82rem;
      color: var(--color-muted-foreground);
    }

    .reveal-card {
      margin-top: 0.25rem;
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.8rem 1rem;
      min-width: 11.5rem;
      animation: reveal 220ms ease-out;
    }

    @keyframes reveal {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .reveal-label {
      margin: 0;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--color-muted-foreground);
    }

    .reveal-role {
      margin: 0.35rem 0 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--color-accent);
    }

    .note {
      margin-top: 0.2rem;
      border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
      border-radius: 0.8rem;
      background: color-mix(in srgb, var(--color-muted) 25%, transparent);
      padding: 0.65rem;
      max-width: 17.5rem;
      font-size: 0.73rem;
      color: var(--color-muted-foreground);
      line-height: 1.45;
    }

    .waiting-note {
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.8rem;
      text-align: center;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
    }

    .waiting-note span {
      color: var(--color-accent);
      font-weight: 500;
    }
  `
})
export class ExecutionRevealPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private revealTimeoutId?: ReturnType<typeof setTimeout>;

  readonly isRevealed = signal(false);
  readonly executedPlayer = 'Eddie';
  readonly revealedRole = 'VILLAGER';
  readonly isGM = true;

  ngOnInit(): void {
    this.revealTimeoutId = setTimeout(() => {
      this.isRevealed.set(true);
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.revealTimeoutId) {
      clearTimeout(this.revealTimeoutId);
    }
  }

  goToNightPhase(): void {
    this.router.navigateByUrl('/night-random-question');
  }
}
