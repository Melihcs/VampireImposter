import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timer',
  standalone: true,
  template: `
    <section class="timer-card">
      <div class="timer-row">
        <span class="timer-label">{{ label }}</span>
        <span class="timer-value" [class.low]="isLow">{{ formattedTime }}</span>
      </div>

      <div class="track">
        <div class="fill" [class.low]="isLow" [style.width.%]="progress"></div>
      </div>
    </section>
  `,
  styles: `
    .timer-card {
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.9rem;
    }

    .timer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.55rem;
    }

    .timer-label {
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
    }

    .timer-value {
      color: var(--color-accent);
      font-size: 1.3rem;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      font-weight: 700;
    }

    .timer-value.low {
      color: var(--color-error);
    }

    .track {
      height: 0.45rem;
      border-radius: 999px;
      background: var(--color-muted);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      background: var(--color-accent);
      transition: width 350ms linear;
    }

    .fill.low {
      background: var(--color-error);
    }
  `
})
export class TimerComponent {
  @Input() seconds = 0;
  @Input() totalSeconds = 1;
  @Input() label = 'Time remaining';

  get progress(): number {
    if (this.totalSeconds <= 0) {
      return 0;
    }
    const percent = (this.seconds / this.totalSeconds) * 100;
    return Math.min(100, Math.max(0, percent));
  }

  get isLow(): boolean {
    return this.seconds <= 10;
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.seconds / 60);
    const remaining = Math.max(0, this.seconds % 60);
    return `${minutes}:${String(remaining).padStart(2, '0')}`;
  }
}
