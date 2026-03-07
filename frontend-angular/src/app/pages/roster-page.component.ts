import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { LegacyRosterPlayer } from '../core/models/api.models';
import { PlayersApiService } from '../core/services/players-api.service';

type LoadState = 'loading' | 'ready' | 'error';

@Component({
  standalone: true,
  templateUrl: './roster-page.component.html',
  styles: `
    .roster-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      color: #f1f5f9;
    }

    .roster-header {
      background: #ef4444;
      color: #fff;
      border-radius: 0 0 1rem 1rem;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.35);
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .roster-header h2 {
      margin: 0;
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      line-height: 1.1;
    }

    .roster-header p {
      margin: 0.3rem 0 0;
      font-size: 0.8rem;
      opacity: 0.9;
    }

    .badge {
      background: rgba(0, 0, 0, 0.28);
      border-radius: 999px;
      padding: 0.35rem 0.7rem;
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      white-space: nowrap;
    }

    .roster-content {
      padding: 1rem;
      flex: 1;
    }

    .state-card {
      border-radius: 0.9rem;
      border: 1px solid #1f2937;
      background: rgba(15, 23, 42, 0.78);
      padding: 1rem;
    }

    .state-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .loading-bar {
      margin-top: 0.6rem;
      width: 12rem;
      max-width: 100%;
      height: 0.5rem;
      border-radius: 999px;
      background: rgba(239, 68, 68, 0.6);
      animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
    }

    .state-card-error {
      border-color: #f87171;
      background: rgba(127, 29, 29, 0.25);
      color: #fecaca;
    }

    .state-error-message {
      margin: 0.5rem 0 0;
      font-size: 0.85rem;
    }

    .retry-btn {
      margin-top: 0.75rem;
      border: 1px solid #fca5a5;
      border-radius: 0.55rem;
      background: transparent;
      color: #fee2e2;
      padding: 0.35rem 0.7rem;
      cursor: pointer;
    }

    .retry-btn:hover {
      background: rgba(248, 113, 113, 0.15);
    }

    .players-grid {
      display: grid;
      gap: 0.75rem;
    }

    .player-card {
      border-radius: 1rem;
      border: 1px solid #1f2937;
      background: rgba(15, 23, 42, 0.72);
      padding: 0.95rem;
      box-shadow: 0 12px 20px rgba(2, 6, 23, 0.2);
    }

    .player-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
    }

    .player-name {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .player-id {
      background: #ef4444;
      color: #fff;
      border-radius: 999px;
      padding: 0.25rem 0.55rem;
      font-size: 0.7rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .player-position {
      margin: 0.65rem 0 0;
      display: inline-flex;
      border-radius: 0.55rem;
      background: #1e293b;
      color: #e2e8f0;
      padding: 0.25rem 0.5rem;
      font-size: 0.78rem;
    }
  `
})
export class RosterPageComponent implements OnInit {
  private readonly playersApi = inject(PlayersApiService);

  readonly players = signal<LegacyRosterPlayer[]>([]);
  readonly state = signal<LoadState>('loading');
  readonly error = signal('');

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.state.set('loading');
    this.error.set('');

    this.playersApi.getLegacyRoster().subscribe({
      next: (data) => {
        this.players.set(data);
        this.state.set('ready');
      },
      error: (err: unknown) => {
        this.error.set(this.resolveErrorMessage(err));
        this.state.set('error');
      }
    });
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status) {
        return `Request failed with ${err.status}`;
      }
      return 'Network request failed';
    }

    if (err instanceof Error && err.message.trim()) {
      return err.message;
    }

    return 'Unknown error';
  }
}
