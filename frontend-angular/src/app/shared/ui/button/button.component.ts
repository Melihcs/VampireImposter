import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styles: `
    .vi-button {
      border-radius: 1rem;
      border: 2px solid transparent;
      font-weight: 500;
      transition: all 150ms ease;
      cursor: pointer;
    }

    .vi-button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .vi-button.full {
      width: 100%;
    }

    .vi-button.variant-primary {
      background: var(--color-accent);
      color: var(--color-foreground);
      border-color: var(--color-accent);
      box-shadow: 0 0 20px rgba(91, 222, 234, 0.2);
    }

    .vi-button.variant-primary:hover:not(:disabled) {
      background: var(--color-accent-hover);
      border-color: var(--color-accent-hover);
    }

    .vi-button.variant-secondary {
      background: transparent;
      color: var(--color-accent);
      border-color: color-mix(in srgb, var(--color-accent) 55%, transparent);
    }

    .vi-button.variant-secondary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    }

    .vi-button.variant-destructive {
      background: var(--color-destructive);
      color: var(--color-foreground);
      border-color: var(--color-destructive);
    }

    .vi-button.variant-destructive:hover:not(:disabled) {
      background: var(--color-destructive-hover);
      border-color: var(--color-destructive-hover);
    }

    .vi-button.size-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .vi-button.size-md {
      padding: 0.75rem 1.25rem;
      font-size: 1rem;
    }

    .vi-button.size-lg {
      padding: 1rem 1.5rem;
      font-size: 1.125rem;
    }
  `
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Output() pressed = new EventEmitter<MouseEvent>();

  get buttonClasses(): string[] {
    return [
      `variant-${this.variant}`,
      `size-${this.size}`,
      this.fullWidth ? 'full' : ''
    ];
  }
}
