import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../core/services/session.service';
import { ButtonComponent } from '../shared/ui/button/button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './create-or-join-page.component.html',
  styles: `
    .choice-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.2rem;
      box-sizing: border-box;
    }

    .content {
      display: grid;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .intro {
      text-align: center;
    }

    .moon-badge {
      width: 4.6rem;
      height: 4.6rem;
      margin: 0 auto 1rem;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 10%, transparent);
      font-size: 2rem;
      box-shadow: 0 0 24px rgba(91, 222, 234, 0.2);
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

    .welcome {
      color: var(--color-accent) !important;
      font-weight: 500;
    }

    .actions {
      display: grid;
      gap: 0.85rem;
    }

    .button-content {
      display: inline-flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
    }

    .footer-note {
      margin: 0;
      text-align: center;
      font-size: 0.74rem;
      color: var(--color-muted-foreground);
      letter-spacing: 0.02em;
      padding-bottom: 0.35rem;
    }
  `
})
export class CreateOrJoinPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  ngOnInit(): void {
    if (!this.session.playerName()) {
      this.router.navigateByUrl('/enter-name');
    }
  }

  playerName(): string | null {
    return this.session.playerName();
  }

  goToCreateRoom(): void {
    this.router.navigateByUrl('/create-room');
  }

  goToJoinRoom(): void {
    this.router.navigateByUrl('/join-room');
  }
}
