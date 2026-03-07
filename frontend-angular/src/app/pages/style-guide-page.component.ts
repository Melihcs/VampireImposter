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
  templateUrl: './style-guide-page.component.html',
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
