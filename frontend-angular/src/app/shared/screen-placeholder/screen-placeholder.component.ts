import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-screen-placeholder',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './screen-placeholder.component.html',
  styles: `
    .placeholder-card {
      width: 100%;
      align-self: stretch;
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 1.25rem;
      box-sizing: border-box;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
    }

    .placeholder-route {
      margin: 0;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-accent);
    }

    .placeholder-title {
      margin: 0.5rem 0 0;
      font-size: 1.4rem;
      line-height: 1.2;
    }

    .placeholder-description {
      margin: 0.75rem 0 0;
      font-size: 0.95rem;
      color: var(--color-muted-foreground);
      line-height: 1.5;
    }

    .placeholder-action {
      display: inline-block;
      margin-top: 1rem;
      color: #06292d;
      background: var(--color-accent);
      text-decoration: none;
      font-weight: 600;
      border-radius: 0.75rem;
      padding: 0.6rem 0.9rem;
      transition: opacity 150ms ease;
    }

    .placeholder-action:hover {
      opacity: 0.9;
    }
  `
})
export class ScreenPlaceholderComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) routePath!: string;
  @Input({ required: true }) description!: string;
  @Input() nextRoute?: string;
  @Input() nextLabel?: string;
}
