import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { ButtonComponent } from '../shared/ui/button/button.component';

interface FinalPlayer {
  name: string;
  role: string;
  isDead: boolean;
}

@Component({
  standalone: true,
  imports: [AppHeaderComponent, ButtonComponent],
  templateUrl: './game-over-page.component.html',
  styles: `
    .game-over-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: 1rem;
      overflow: auto;
    }

    .hero {
      text-align: center;
      padding-top: 0.25rem;
    }

    .trophy {
      width: 5rem;
      height: 5rem;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 12%, transparent);
      display: grid;
      place-items: center;
      margin: 0 auto 0.6rem;
      font-size: 2.2rem;
    }

    .hero h2 {
      margin: 0;
      font-size: 1.75rem;
    }

    .winner {
      margin: 0.35rem 0 0;
      color: var(--color-accent);
      font-size: 1.1rem;
      font-weight: 600;
    }

    .roster h3 {
      margin: 0 0 0.55rem;
      font-size: 0.95rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .roster-list {
      display: grid;
      gap: 0.45rem;
    }

    .roster-item {
      border: 1px solid var(--color-border);
      border-radius: 0.8rem;
      background: color-mix(in srgb, var(--color-card) 82%, transparent);
      padding: 0.65rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.65rem;
    }

    .left {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      min-width: 0;
    }

    .avatar {
      width: 2.15rem;
      height: 2.15rem;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: var(--color-muted);
      font-size: 0.74rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .avatar.dead {
      opacity: 0.45;
    }

    .name {
      margin: 0;
      font-size: 0.86rem;
      font-weight: 600;
    }

    .name.dead {
      text-decoration: line-through;
      opacity: 0.6;
    }

    .role {
      margin: 0.15rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.72rem;
    }

    .state {
      border-radius: 999px;
      padding: 0.2rem 0.5rem;
      font-size: 0.68rem;
      background: color-mix(in srgb, var(--color-accent) 18%, transparent);
      color: var(--color-accent);
    }

    .state.dead {
      background: color-mix(in srgb, var(--color-muted) 40%, transparent);
      color: var(--color-muted-foreground);
    }

    .summary {
      border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
      border-radius: 0.8rem;
      background: color-mix(in srgb, var(--color-muted) 22%, transparent);
      padding: 0.65rem;
      text-align: center;
      color: var(--color-muted-foreground);
      font-size: 0.74rem;
      line-height: 1.45;
    }

    .actions {
      display: grid;
      gap: 0.55rem;
      margin-top: 0.1rem;
    }
  `
})
export class GameOverPageComponent {
  private readonly router = inject(Router);

  readonly winner = 'Villagers';
  readonly finalRoster: FinalPlayer[] = [
    { name: 'Melih', role: 'Villager', isDead: false },
    { name: 'Deniz', role: 'Hunter', isDead: false },
    { name: 'Eddie', role: 'Villager', isDead: true },
    { name: 'Ollie', role: 'Vampire', isDead: true },
    { name: 'Ege', role: 'Villager', isDead: false },
    { name: 'Bilge', role: 'Villager', isDead: false }
  ];

  playAgain(): void {
    this.router.navigateByUrl('/lobby');
  }

  leaveRoom(): void {
    this.router.navigateByUrl('/create-or-join');
  }
}
