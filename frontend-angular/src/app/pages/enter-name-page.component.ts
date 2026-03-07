import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../core/services/session.service';
import { ButtonComponent } from '../shared/ui/button/button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './enter-name-page.component.html',
  styles: `
    .enter-name-page {
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
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .intro {
      text-align: center;
    }

    .avatar-badge {
      width: 4.6rem;
      height: 4.6rem;
      margin: 0 auto 1rem;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 10%, transparent);
      font-size: 2rem;
    }

    .intro h2 {
      margin: 0;
      font-size: 1.85rem;
      line-height: 1.1;
    }

    .intro p {
      margin: 0.5rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.9rem;
    }

    .form {
      display: grid;
      gap: 0.75rem;
    }

    .form label {
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
      font-weight: 500;
    }

    .form input {
      width: 100%;
      box-sizing: border-box;
      border-radius: 1rem;
      border: 2px solid var(--color-border);
      background: color-mix(in srgb, var(--color-card) 85%, transparent);
      color: var(--color-foreground);
      padding: 0.78rem 0.9rem;
      font-size: 1rem;
      outline: none;
    }

    .form input:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 25%, transparent);
    }
  `
})
export class EnterNamePageComponent {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  readonly name = signal(this.session.playerName() ?? '');

  hasName(): boolean {
    return this.name().trim().length > 0;
  }

  onNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.name.set(value);
  }

  continue(): void {
    const trimmed = this.name().trim();
    if (!trimmed) {
      return;
    }

    this.session.setPlayerName(trimmed);
    this.router.navigateByUrl('/create-or-join');
  }
}
