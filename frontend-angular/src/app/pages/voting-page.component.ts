import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { PhaseIndicatorComponent } from '../shared/ui/phase-indicator/phase-indicator.component';
import { PlayerChipComponent } from '../shared/ui/player-chip/player-chip.component';
import { TimerComponent } from '../shared/ui/timer/timer.component';

interface VotingPlayer {
  name: string;
  isGM: boolean;
  isDead: boolean;
}

@Component({
  standalone: true,
  imports: [
    AppHeaderComponent,
    ButtonComponent,
    PhaseIndicatorComponent,
    PlayerChipComponent,
    TimerComponent
  ],
  template: `
    <section class="voting-page">
      <app-app-header roomCode="K7P4Q" [isConnected]="true" (leave)="leaveGame()" />

      <main class="content">
        <div class="top-row">
          <app-phase-indicator phase="vote" />
        </div>

        <div class="intro">
          <h2>Cast Your Vote</h2>
          <p>
            {{
              hasVoted()
                ? 'Vote submitted. Waiting for others...'
                : 'Select a player to execute'
            }}
          </p>
        </div>

        <app-timer [seconds]="timeLeft()" [totalSeconds]="totalTime" label="Voting time" />

        <div class="players">
          @for (player of players(); track player.name) {
            <app-player-chip
              [name]="player.name"
              variant="voting"
              [isSelected]="selectedPlayer() === player.name"
              [clickable]="!hasVoted()"
              (clicked)="selectPlayer(player.name)"
            />
          }
        </div>

        <app-button
          variant="primary"
          size="lg"
          [fullWidth]="true"
          [disabled]="!selectedPlayer() || hasVoted()"
          (pressed)="submitVote()"
        >
          {{ hasVoted() ? 'Vote Submitted' : 'Submit Vote' }}
        </app-button>
      </main>
    </section>
  `,
  styles: `
    .voting-page {
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

    .intro h2 {
      margin: 0;
      font-size: 1.45rem;
    }

    .intro p {
      margin: 0.35rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
    }

    .players {
      flex: 1;
      display: grid;
      gap: 0.55rem;
      align-content: start;
      padding: 0.25rem 0;
    }
  `
})
export class VotingPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private intervalId?: ReturnType<typeof setInterval>;
  private voteTimeoutId?: ReturnType<typeof setTimeout>;

  readonly totalTime = 60;
  readonly timeLeft = signal(60);
  readonly selectedPlayer = signal<string | null>(null);
  readonly hasVoted = signal(false);

  readonly players = signal<VotingPlayer[]>([
    { name: 'Deniz', isGM: false, isDead: false },
    { name: 'Eddie', isGM: false, isDead: false },
    { name: 'Ollie', isGM: false, isDead: false },
    { name: 'Ege', isGM: false, isDead: false },
    { name: 'Bilge', isGM: false, isDead: false }
  ]);

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      const current = this.timeLeft();
      if (current <= 1) {
        this.clearInterval();
        this.timeLeft.set(0);
        return;
      }
      this.timeLeft.set(current - 1);
    }, 1000);
  }

  ngOnDestroy(): void {
    this.clearInterval();
    this.clearVoteTimeout();
  }

  leaveGame(): void {
    this.router.navigateByUrl('/create-or-join');
  }

  selectPlayer(name: string): void {
    if (this.hasVoted()) {
      return;
    }
    this.selectedPlayer.set(name);
  }

  submitVote(): void {
    if (!this.selectedPlayer() || this.hasVoted()) {
      return;
    }

    this.hasVoted.set(true);
    this.clearVoteTimeout();
    this.voteTimeoutId = setTimeout(() => {
      this.router.navigateByUrl('/execution-reveal');
    }, 1500);
  }

  private clearInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private clearVoteTimeout(): void {
    if (this.voteTimeoutId) {
      clearTimeout(this.voteTimeoutId);
      this.voteTimeoutId = undefined;
    }
  }
}
