import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { PhaseIndicatorComponent } from '../shared/ui/phase-indicator/phase-indicator.component';
import { TimerComponent } from '../shared/ui/timer/timer.component';

@Component({
  standalone: true,
  imports: [AppHeaderComponent, ButtonComponent, PhaseIndicatorComponent, TimerComponent],
  templateUrl: './day-discussion-page.component.html',
  styles: `
    .day-page {
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

    .intro h2 {
      margin: 0;
      font-size: 1.45rem;
    }

    .intro p {
      margin: 0.35rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }

    .center {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.9rem;
      text-align: center;
      padding: 0.5rem 0;
    }

    .bubble {
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-warning) 35%, transparent);
      background: color-mix(in srgb, var(--color-warning) 12%, transparent);
      display: grid;
      place-items: center;
      font-size: 2rem;
    }

    .center-copy h3 {
      margin: 0;
      font-size: 1.2rem;
    }

    .center-copy p {
      margin: 0.45rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }

    .tips {
      margin-top: 0.65rem;
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.7rem;
      text-align: left;
      display: grid;
      gap: 0.25rem;
    }

    .tips p {
      margin: 0;
      color: var(--color-muted-foreground);
      font-size: 0.78rem;
    }
  `
})
export class DayDiscussionPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private intervalId?: ReturnType<typeof setInterval>;

  readonly totalTime = 120;
  readonly timeLeft = signal(120);

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      const current = this.timeLeft();
      if (current <= 1) {
        this.clearInterval();
        this.timeLeft.set(0);
        this.router.navigateByUrl('/voting');
        return;
      }
      this.timeLeft.set(current - 1);
    }, 1000);
  }

  ngOnDestroy(): void {
    this.clearInterval();
  }

  leaveGame(): void {
    this.router.navigateByUrl('/create-or-join');
  }

  goToVoting(): void {
    this.router.navigateByUrl('/voting');
  }

  private clearInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
