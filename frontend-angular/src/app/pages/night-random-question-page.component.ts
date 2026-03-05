import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { PhaseIndicatorComponent } from '../shared/ui/phase-indicator/phase-indicator.component';

@Component({
  standalone: true,
  imports: [AppHeaderComponent, ButtonComponent, PhaseIndicatorComponent],
  template: `
    <section class="night-question-page">
      <app-app-header roomCode="K7P4Q" [isConnected]="true" [showLeave]="false" />

      <main class="content">
        <div class="top-row">
          <app-phase-indicator phase="night" />
        </div>

        <div class="center">
          <div class="moon">🌙</div>
          <h2>Night Phase</h2>
          <p class="subtitle">Random discussion question for all players</p>

          <article class="question-card">
            <p class="question-label">❔ Question</p>
            <p class="question-text">{{ question }}</p>
          </article>

          <article class="note">
            This question is visible to everyone. Discuss while special roles take their actions.
          </article>
        </div>

        <app-button variant="primary" size="lg" [fullWidth]="true" (pressed)="continueToVampireTurn()">
          Continue (Vampire Turn)
        </app-button>
      </main>
    </section>
  `,
  styles: `
    .night-question-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      padding: 1rem;
    }

    .top-row {
      display: flex;
      justify-content: flex-start;
    }

    .center {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 0.8rem;
    }

    .moon {
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 12%, transparent);
      display: grid;
      place-items: center;
      font-size: 2rem;
      box-shadow: 0 0 24px rgba(91, 222, 234, 0.2);
    }

    .center h2 {
      margin: 0;
      font-size: 1.45rem;
    }

    .subtitle {
      margin: 0;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
    }

    .question-card {
      margin-top: 0.2rem;
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 82%, transparent);
      padding: 0.85rem;
      max-width: 19rem;
    }

    .question-label {
      margin: 0;
      color: var(--color-accent);
      font-size: 0.78rem;
      font-weight: 600;
    }

    .question-text {
      margin: 0.4rem 0 0;
      font-size: 1rem;
      line-height: 1.45;
    }

    .note {
      border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
      border-radius: 0.8rem;
      background: color-mix(in srgb, var(--color-muted) 25%, transparent);
      padding: 0.65rem;
      max-width: 17.5rem;
      font-size: 0.73rem;
      color: var(--color-muted-foreground);
      line-height: 1.45;
    }
  `
})
export class NightRandomQuestionPageComponent {
  private readonly router = inject(Router);
  readonly question = 'Who do you think is acting most suspicious?';

  continueToVampireTurn(): void {
    this.router.navigateByUrl('/night-vampire-kill');
  }
}
