import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

export type Role = 'villager' | 'vampire' | 'hunter';

const ROLE_META: Record<Role, { name: string; instruction: string }> = {
  villager: {
    name: 'VILLAGER',
    instruction: 'Survive and find the vampire.'
  },
  vampire: {
    name: 'VAMPIRE',
    instruction: 'Eliminate villagers without being caught.'
  },
  hunter: {
    name: 'HUNTER',
    instruction: 'Inspect one player each night.'
  }
};

@Component({
  selector: 'app-role-card',
  standalone: true,
  template: `
    <button class="role-card" type="button" (click)="onCardClick()">
      @if (!isRevealed) {
        <div class="face">
          <p class="face-title">Tap to Reveal</p>
          <p class="face-subtitle">Private role card</p>
        </div>
      } @else {
        <div class="face revealed">
          <h3 class="role-name" [style.filter]="nameFilter">{{ roleMeta.name }}</h3>
          <p class="role-text" [style.filter]="instructionFilter">{{ roleMeta.instruction }}</p>

          @if (privacyMode) {
            <span
              class="hold-chip"
              (mousedown)="setUnblurred(true)"
              (mouseup)="setUnblurred(false)"
              (mouseleave)="setUnblurred(false)"
              (touchstart)="setUnblurred(true)"
              (touchend)="setUnblurred(false)"
            >
              {{ isUnblurred() ? 'Release to hide' : 'Hold to read' }}
            </span>
          }
        </div>
      }
    </button>
  `,
  styles: `
    .role-card {
      width: min(100%, 280px);
      aspect-ratio: 3 / 4;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      border-radius: 1.1rem;
      background: color-mix(in srgb, var(--color-card) 85%, transparent);
      color: var(--color-foreground);
      cursor: pointer;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(91, 222, 234, 0.12);
      padding: 1rem;
      text-align: center;
    }

    .face {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }

    .face-title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-accent);
    }

    .face-subtitle {
      margin: 0;
      color: var(--color-muted-foreground);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .face.revealed {
      gap: 0.95rem;
      justify-content: center;
      padding: 0.5rem;
      position: relative;
    }

    .role-name {
      margin: 0;
      font-size: 1.45rem;
      letter-spacing: 0.08em;
      color: var(--color-accent);
      transition: filter 150ms ease;
    }

    .role-text {
      margin: 0;
      color: var(--color-muted-foreground);
      line-height: 1.45;
      transition: filter 150ms ease;
    }

    .hold-chip {
      position: absolute;
      bottom: 0.4rem;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--color-muted-foreground) 35%, transparent);
      background: color-mix(in srgb, var(--color-muted) 40%, transparent);
      color: var(--color-muted-foreground);
      font-size: 0.68rem;
      padding: 0.3rem 0.55rem;
      user-select: none;
    }
  `
})
export class RoleCardComponent {
  @Input() role: Role = 'villager';
  @Input() isRevealed = false;
  @Input() privacyMode = true;
  @Output() reveal = new EventEmitter<void>();

  readonly isUnblurred = signal(false);

  get roleMeta(): { name: string; instruction: string } {
    return ROLE_META[this.role];
  }

  get nameFilter(): string {
    return this.privacyMode && !this.isUnblurred() ? 'blur(8px)' : 'none';
  }

  get instructionFilter(): string {
    return this.privacyMode && !this.isUnblurred() ? 'blur(6px)' : 'none';
  }

  onCardClick(): void {
    if (!this.isRevealed) {
      this.reveal.emit();
    }
  }

  setUnblurred(isUnblurred: boolean): void {
    this.isUnblurred.set(isUnblurred);
  }
}
