import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../core/services/session.service';
import { ButtonComponent } from '../shared/ui/button/button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './create-room-page.component.html',
  styles: `
    .create-room-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      padding: 1rem 1.2rem;
      border-bottom: 1px solid color-mix(in srgb, var(--color-border) 55%, transparent);
    }

    .header-icon {
      width: 2.4rem;
      height: 2.4rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 10%, transparent);
      display: grid;
      place-items: center;
      font-size: 1rem;
    }

    .page-header h2 {
      margin: 0;
      font-size: 1.2rem;
    }

    .page-header p {
      margin: 0.15rem 0 0;
      font-size: 0.74rem;
      color: var(--color-muted-foreground);
    }

    .content {
      flex: 1;
      overflow: auto;
      padding: 1rem;
      display: grid;
      gap: 0.9rem;
    }

    .card {
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.9rem;
    }

    .card-top {
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
      margin-bottom: 0.8rem;
    }

    .clock {
      font-size: 1.1rem;
      line-height: 1.2;
      margin-top: 0.1rem;
    }

    .card h3 {
      margin: 0;
      font-size: 0.95rem;
    }

    .card p {
      margin: 0.25rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.74rem;
      line-height: 1.4;
    }

    .range-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .range-row input[type='range'] {
      flex: 1;
      accent-color: var(--color-accent);
    }

    .value {
      min-width: 3.4rem;
      text-align: right;
      color: var(--color-accent);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .check-row {
      display: flex;
      gap: 0.7rem;
      align-items: flex-start;
      cursor: pointer;
    }

    .check-row input[type='checkbox'] {
      margin-top: 0.1rem;
      width: 1rem;
      height: 1rem;
      accent-color: var(--color-accent);
    }

    .footer {
      border-top: 1px solid color-mix(in srgb, var(--color-border) 55%, transparent);
      padding: 1rem;
    }
  `
})
export class CreateRoomPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  readonly discussionTime = signal(120);
  readonly votingTime = signal(60);
  readonly allowRejoin = signal(false);

  ngOnInit(): void {
    if (!this.session.playerName()) {
      this.router.navigateByUrl('/enter-name');
    }
  }

  onDiscussionChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.discussionTime.set(value);
  }

  onVotingChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.votingTime.set(value);
  }

  onRejoinChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.allowRejoin.set(isChecked);
  }

  formatSeconds(total: number): string {
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  createRoom(): void {
    this.session.setGameId('K7P4Q');
    this.router.navigateByUrl('/lobby');
  }
}
