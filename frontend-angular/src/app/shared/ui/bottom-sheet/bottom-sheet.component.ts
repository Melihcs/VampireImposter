import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  templateUrl: './bottom-sheet.component.html',
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 40;
    }

    .sheet {
      position: fixed;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      width: min(390px, 100%);
      box-sizing: border-box;
      border-top-left-radius: 1.5rem;
      border-top-right-radius: 1.5rem;
      border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: var(--color-card);
      z-index: 50;
      padding: 0.9rem 1rem 1rem;
      box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.45);
      animation: slide-up 180ms ease-out;
    }

    .handle {
      width: 3rem;
      height: 0.25rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--color-muted-foreground) 40%, transparent);
      margin: 0 auto 0.8rem;
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.8rem;
    }

    .sheet-header h3 {
      margin: 0;
      font-size: 1.05rem;
    }

    .sheet-header button {
      border: 1px solid var(--color-border);
      background: transparent;
      color: var(--color-muted-foreground);
      border-radius: 0.5rem;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
    }

    .sheet-content {
      max-height: min(70vh, 32rem);
      overflow: auto;
    }

    @keyframes slide-up {
      from {
        transform: translateX(-50%) translateY(100%);
      }
      to {
        transform: translateX(-50%) translateY(0);
      }
    }
  `
})
export class BottomSheetComponent {
  @Input() isOpen = false;
  @Input() title?: string;
  @Output() closed = new EventEmitter<void>();
}
