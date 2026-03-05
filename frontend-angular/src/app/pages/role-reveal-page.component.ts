import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { PhaseIndicatorComponent } from '../shared/ui/phase-indicator/phase-indicator.component';
import { Role, RoleCardComponent } from '../shared/ui/role-card/role-card.component';

@Component({
  standalone: true,
  imports: [AppHeaderComponent, ButtonComponent, PhaseIndicatorComponent, RoleCardComponent],
  template: `
    <section class="role-reveal-page">
      <app-app-header roomCode="K7P4Q" [isConnected]="true" [showLeave]="false" />

      <main class="content">
        <div class="top-row">
          <app-phase-indicator phase="reveal" />
        </div>

        <div class="center-content">
          <div class="intro">
            <h2>Your Role</h2>
            <p>
              {{
                isRevealed()
                  ? 'Remember your role and mission'
                  : 'Tap the card to reveal your role'
              }}
            </p>
          </div>

          <app-role-card
            [role]="role()"
            [isRevealed]="isRevealed()"
            [privacyMode]="privacyMode()"
            (reveal)="handleReveal()"
          />

          <label class="privacy-toggle">
            <input type="checkbox" [checked]="privacyMode()" (change)="onPrivacyToggle($event)" />
            <div class="privacy-text">
              <p class="privacy-title">{{ privacyMode() ? '👁 Anti-peek Blur' : '🙈 Blur Off' }}</p>
              <p class="privacy-subtitle">Hold to read role when blur is active</p>
            </div>
          </label>
        </div>

        <div class="bottom-actions">
          <p class="tip">
            <span>Privacy tip:</span> Shield your screen from others.
            @if (privacyMode()) {
              <span> Hold the blurred text to read clearly.</span>
            }
          </p>

          <app-button
            variant="primary"
            size="lg"
            [fullWidth]="true"
            [disabled]="!hasRevealed()"
            (pressed)="confirmRoleSeen()"
          >
            I Saw My Role
          </app-button>
        </div>
      </main>
    </section>
  `,
  styles: `
    .role-reveal-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      gap: 0.9rem;
    }

    .top-row {
      display: flex;
      justify-content: flex-start;
    }

    .center-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.95rem;
    }

    .intro {
      text-align: center;
    }

    .intro h2 {
      margin: 0;
      font-size: 1.45rem;
    }

    .intro p {
      margin: 0.35rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
    }

    .privacy-toggle {
      width: min(100%, 280px);
      display: flex;
      align-items: center;
      gap: 0.7rem;
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.7rem;
      cursor: pointer;
      box-sizing: border-box;
    }

    .privacy-toggle input[type='checkbox'] {
      width: 1rem;
      height: 1rem;
      accent-color: var(--color-accent);
    }

    .privacy-text {
      min-width: 0;
    }

    .privacy-title {
      margin: 0;
      font-size: 0.84rem;
      font-weight: 600;
    }

    .privacy-subtitle {
      margin: 0.2rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.72rem;
      line-height: 1.35;
    }

    .bottom-actions {
      display: grid;
      gap: 0.65rem;
    }

    .tip {
      margin: 0;
      border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
      border-radius: 0.8rem;
      background: color-mix(in srgb, var(--color-muted) 25%, transparent);
      padding: 0.65rem;
      text-align: center;
      font-size: 0.74rem;
      color: var(--color-muted-foreground);
      line-height: 1.45;
    }

    .tip span:first-child {
      color: var(--color-accent);
      font-weight: 600;
    }
  `
})
export class RoleRevealPageComponent {
  private readonly router = inject(Router);

  readonly role = signal<Role>('hunter');
  readonly isRevealed = signal(false);
  readonly hasRevealed = signal(false);
  readonly privacyMode = signal(true);

  handleReveal(): void {
    this.isRevealed.set(true);
    this.hasRevealed.set(true);
  }

  onPrivacyToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.privacyMode.set(checked);
  }

  confirmRoleSeen(): void {
    this.router.navigateByUrl('/waiting-for-others');
  }
}
