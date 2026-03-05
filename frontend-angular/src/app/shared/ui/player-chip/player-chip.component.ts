import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type PlayerChipVariant = 'default' | 'compact' | 'voting';

@Component({
  selector: 'app-player-chip',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="chip" [ngClass]="chipClasses" (click)="clicked.emit()">
      <div class="avatar" [ngClass]="{ dead: isDead, large: variant === 'voting' }">
        @if (isDead) {
          <span aria-hidden="true">☠</span>
        } @else {
          <span>{{ initials }}</span>
        }
      </div>

      <div class="details">
        <div class="name-row">
          <span class="name" [ngClass]="{ dead: isDead }">{{ name }}</span>
          @if (isGM) {
            <span class="gm-pill">GM</span>
          }
        </div>

        <p class="status">
          {{ isDead ? 'Dead' : 'Alive' }}
          @if (isReady) {
            <span> • Ready</span>
          }
        </p>
      </div>
    </div>
  `,
  styles: `
    .chip {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      border-radius: 0.9rem;
      border: 1px solid var(--color-border);
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.65rem 0.75rem;
    }

    .chip.clickable {
      cursor: pointer;
    }

    .chip.clickable:hover {
      background: color-mix(in srgb, var(--color-card-hover) 80%, transparent);
    }

    .chip.voting {
      border-width: 2px;
      border-radius: 1rem;
      padding: 0.9rem;
    }

    .chip.selected {
      border-color: var(--color-accent);
      box-shadow: 0 0 20px rgba(91, 222, 234, 0.25);
    }

    .avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      background: var(--color-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .avatar.large {
      width: 2.8rem;
      height: 2.8rem;
      font-size: 0.95rem;
    }

    .avatar.dead {
      opacity: 0.55;
    }

    .details {
      min-width: 0;
      flex: 1;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .name {
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .name.dead {
      text-decoration: line-through;
      opacity: 0.6;
    }

    .gm-pill {
      border-radius: 0.35rem;
      border: 1px solid color-mix(in srgb, var(--color-accent) 50%, transparent);
      color: var(--color-accent);
      font-size: 0.65rem;
      line-height: 1;
      padding: 0.2rem 0.35rem;
      font-weight: 600;
    }

    .status {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: var(--color-muted-foreground);
    }
  `
})
export class PlayerChipComponent {
  @Input({ required: true }) name!: string;
  @Input() isGM = false;
  @Input() isDead = false;
  @Input() isReady = false;
  @Input() variant: PlayerChipVariant = 'default';
  @Input() isSelected = false;
  @Input() clickable = false;

  @Output() clicked = new EventEmitter<void>();

  get initials(): string {
    return this.name
      .split(' ')
      .map((segment) => segment.trim()[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get chipClasses(): Record<string, boolean> {
    return {
      voting: this.variant === 'voting',
      selected: this.isSelected,
      clickable: this.clickable
    };
  }
}
