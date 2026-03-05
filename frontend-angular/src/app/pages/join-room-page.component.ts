import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../core/services/session.service';
import { ButtonComponent } from '../shared/ui/button/button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <section class="join-room-page">
      <div class="content">
        <div class="intro">
          <div class="badge">↪</div>
          <h2>Join Room</h2>
          <p>Enter the 5-character room code</p>
        </div>

        <div class="form">
          <label for="roomCode">Room Code</label>
          <input
            id="roomCode"
            type="text"
            [value]="roomCode()"
            (input)="onRoomCodeInput($event)"
            (keydown.enter)="joinRoom()"
            placeholder="K7P4Q"
            maxlength="5"
            autocomplete="off"
            [class.input-error]="error().length > 0"
          />

          @if (error()) {
            <p class="error">{{ error() }}</p>
          }

          <app-button
            variant="primary"
            size="lg"
            [fullWidth]="true"
            [disabled]="roomCode().length !== 5"
            (pressed)="joinRoom()"
          >
            Join Room
          </app-button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .join-room-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.2rem;
      box-sizing: border-box;
    }

    .content {
      width: 100%;
      display: grid;
      gap: 1.4rem;
    }

    .intro {
      text-align: center;
    }

    .badge {
      width: 4.6rem;
      height: 4.6rem;
      margin: 0 auto 1rem;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 10%, transparent);
      display: grid;
      place-items: center;
      font-size: 2rem;
    }

    .intro h2 {
      margin: 0;
      font-size: 1.8rem;
      line-height: 1.1;
    }

    .intro p {
      margin: 0.45rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.9rem;
    }

    .form {
      display: grid;
      gap: 0.7rem;
    }

    label {
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--color-muted-foreground);
    }

    input {
      width: 100%;
      box-sizing: border-box;
      border-radius: 1rem;
      border: 2px solid var(--color-border);
      background: color-mix(in srgb, var(--color-card) 85%, transparent);
      color: var(--color-foreground);
      padding: 0.8rem 0.9rem;
      text-align: center;
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      outline: none;
    }

    input:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 25%, transparent);
    }

    input.input-error {
      border-color: var(--color-error);
      box-shadow: none;
    }

    .error {
      margin: 0;
      font-size: 0.82rem;
      color: var(--color-error);
    }
  `
})
export class JoinRoomPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  readonly roomCode = signal('');
  readonly error = signal('');

  ngOnInit(): void {
    if (!this.session.playerName()) {
      this.router.navigateByUrl('/enter-name');
    }
  }

  onRoomCodeInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const normalized = raw.toUpperCase().slice(0, 5);
    this.error.set('');
    this.roomCode.set(normalized);
  }

  joinRoom(): void {
    const value = this.roomCode();
    if (value.length !== 5) {
      this.error.set('Room code must be 5 characters');
      return;
    }

    if (value !== 'K7P4Q') {
      this.error.set('Room not found. Please check the code.');
      return;
    }

    this.session.setGameId(value);
    this.router.navigateByUrl('/lobby');
  }
}
