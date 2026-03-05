import { Component, signal } from '@angular/core';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { BottomSheetComponent } from '../shared/ui/bottom-sheet/bottom-sheet.component';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { PhaseIndicatorComponent } from '../shared/ui/phase-indicator/phase-indicator.component';
import { PlayerChipComponent } from '../shared/ui/player-chip/player-chip.component';
import { RoleCardComponent } from '../shared/ui/role-card/role-card.component';
import { TimerComponent } from '../shared/ui/timer/timer.component';

@Component({
  standalone: true,
  imports: [
    AppHeaderComponent,
    BottomSheetComponent,
    ButtonComponent,
    PhaseIndicatorComponent,
    PlayerChipComponent,
    RoleCardComponent,
    TimerComponent
  ],
  template: `
    <section class="style-guide-page">
      <app-app-header roomCode="GUIDE" [isConnected]="true" />

      <main class="content">
        <header class="section-intro">
          <h2>Style Guide</h2>
          <p>Imposter Room Design System</p>
        </header>

        <section class="block">
          <h3>Colors</h3>
          <div class="color-grid">
            <article class="swatch">
              <div class="sample accent"></div>
              <p>Accent Teal</p>
              <span>#5BDEEA</span>
            </article>
            <article class="swatch">
              <div class="sample destructive"></div>
              <p>Destructive</p>
              <span>#C85D5D</span>
            </article>
            <article class="swatch">
              <div class="sample card"></div>
              <p>Card</p>
              <span>#151923</span>
            </article>
            <article class="swatch">
              <div class="sample muted"></div>
              <p>Muted</p>
              <span>#2A3040</span>
            </article>
          </div>
        </section>

        <section class="block">
          <h3>Buttons</h3>
          <div class="stack">
            <app-button variant="primary" [fullWidth]="true">Primary Button</app-button>
            <app-button variant="secondary" [fullWidth]="true">Secondary Button</app-button>
            <app-button variant="destructive" [fullWidth]="true">Destructive Button</app-button>
            <app-button variant="primary" [fullWidth]="true" [disabled]="true">Disabled Button</app-button>
          </div>
        </section>

        <section class="block">
          <h3>Player Chips</h3>
          <div class="stack">
            <app-player-chip name="Melih" [isGM]="true" />
            <app-player-chip name="Deniz" [isReady]="true" />
            <app-player-chip name="Eddie" [isDead]="true" />
            <app-player-chip name="Ollie" variant="voting" />
          </div>
        </section>

        <section class="block">
          <h3>Phase Indicators</h3>
          <div class="stack">
            <app-phase-indicator phase="lobby" />
            <app-phase-indicator phase="reveal" />
            <app-phase-indicator phase="day" />
            <app-phase-indicator phase="vote" />
            <app-phase-indicator phase="execute" />
            <app-phase-indicator phase="night" />
          </div>
        </section>

        <section class="block">
          <h3>Timer</h3>
          <app-timer [seconds]="45" [totalSeconds]="60" label="Time remaining" />
        </section>

        <section class="block">
          <h3>Role Cards</h3>
          <p class="small-copy">
            All role cards are visually identical except for role text. Privacy blur can be
            toggled.
          </p>
          <div class="role-grid">
            <div class="role-col">
              <app-role-card role="villager" [isRevealed]="true" [privacyMode]="false" />
              <span>Villager</span>
            </div>
            <div class="role-col">
              <app-role-card role="vampire" [isRevealed]="true" [privacyMode]="false" />
              <span>Vampire</span>
            </div>
          </div>
        </section>

        <section class="block">
          <h3>Bottom Sheet</h3>
          <app-button variant="secondary" [fullWidth]="true" (pressed)="openSheet()">
            Show Bottom Sheet
          </app-button>
        </section>
      </main>

      <app-bottom-sheet [isOpen]="showSheet()" title="Example Bottom Sheet" (closed)="closeSheet()">
        <p class="sheet-copy">
          This is an example bottom sheet modal. You can place any content here.
        </p>
        <app-button variant="primary" [fullWidth]="true" (pressed)="closeSheet()">Close</app-button>
      </app-bottom-sheet>
    </section>
  `,
  styles: `
    .style-guide-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .content {
      padding: 1rem;
      display: grid;
      gap: 1.1rem;
      overflow: auto;
    }

    .section-intro {
      text-align: center;
    }

    .section-intro h2 {
      margin: 0;
      font-size: 1.65rem;
    }

    .section-intro p {
      margin: 0.35rem 0 0;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
    }

    .block {
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 82%, transparent);
      padding: 0.85rem;
      display: grid;
      gap: 0.65rem;
    }

    .block h3 {
      margin: 0;
      font-size: 0.92rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .color-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.55rem;
    }

    .swatch {
      display: grid;
      gap: 0.22rem;
    }

    .sample {
      height: 2.8rem;
      border-radius: 0.6rem;
      border: 1px solid var(--color-border);
    }

    .sample.accent {
      background: var(--color-accent);
    }

    .sample.destructive {
      background: var(--color-destructive);
    }

    .sample.card {
      background: var(--color-card);
    }

    .sample.muted {
      background: var(--color-muted);
    }

    .swatch p {
      margin: 0;
      font-size: 0.76rem;
      font-weight: 500;
    }

    .swatch span {
      color: var(--color-muted-foreground);
      font-size: 0.68rem;
    }

    .stack {
      display: grid;
      gap: 0.55rem;
    }

    .small-copy {
      margin: 0;
      font-size: 0.72rem;
      color: var(--color-muted-foreground);
      line-height: 1.45;
    }

    .role-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.55rem;
      align-items: start;
    }

    .role-col {
      display: grid;
      justify-items: center;
      gap: 0.3rem;
    }

    .role-col span {
      font-size: 0.7rem;
      color: var(--color-muted-foreground);
    }

    .sheet-copy {
      margin: 0 0 0.7rem;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
      line-height: 1.45;
    }
  `
})
export class StyleGuidePageComponent {
  readonly showSheet = signal(false);

  openSheet(): void {
    this.showSheet.set(true);
  }

  closeSheet(): void {
    this.showSheet.set(false);
  }
}
