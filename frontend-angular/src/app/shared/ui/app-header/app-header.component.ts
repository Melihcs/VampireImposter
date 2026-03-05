import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-app-header',
  standalone: true,
  template: `
    <header class="vi-header">
      <div class="vi-header__left">
        @if (roomCode) {
          <button class="chip chip-code" type="button" (click)="copyRoomCode()">
            <span class="room-code">{{ roomCode }}</span>
            <span aria-hidden="true">⎘</span>
          </button>
        }

        <div class="chip chip-state">
          <span class="state-dot" [class.connected]="isConnected" [class.disconnected]="!isConnected"></span>
          <span>{{ isConnected ? 'Connected' : 'Reconnecting...' }}</span>
        </div>
      </div>

      @if (showLeave) {
        <button class="leave-button" type="button" aria-label="Leave room" (click)="leave.emit()">
          Exit
        </button>
      }
    </header>
  `,
  styles: `
    .vi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid color-mix(in srgb, var(--color-border) 55%, transparent);
    }

    .vi-header__left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 0;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: color-mix(in srgb, var(--color-card) 85%, transparent);
      color: var(--color-foreground);
      font-size: 0.75rem;
      padding: 0.4rem 0.65rem;
      min-height: 2rem;
    }

    .chip-code {
      cursor: pointer;
    }

    .room-code {
      letter-spacing: 0.18em;
      font-weight: 600;
    }

    .chip-state {
      color: var(--color-muted-foreground);
    }

    .state-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      display: inline-block;
    }

    .state-dot.connected {
      background: var(--color-success);
    }

    .state-dot.disconnected {
      background: var(--color-error);
    }

    .leave-button {
      border: 1px solid var(--color-border);
      border-radius: 0.6rem;
      background: transparent;
      color: var(--color-muted-foreground);
      font-size: 0.75rem;
      padding: 0.45rem 0.7rem;
      cursor: pointer;
    }

    .leave-button:hover {
      color: var(--color-foreground);
      background: color-mix(in srgb, var(--color-muted) 45%, transparent);
    }
  `
})
export class AppHeaderComponent {
  @Input() roomCode?: string;
  @Input() isConnected = true;
  @Input() showLeave = true;

  @Output() leave = new EventEmitter<void>();
  @Output() copied = new EventEmitter<string>();

  async copyRoomCode(): Promise<void> {
    if (!this.roomCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.roomCode);
    } catch {
      // no-op fallback for unsupported clipboard environments
    }

    this.copied.emit(this.roomCode);
  }
}
