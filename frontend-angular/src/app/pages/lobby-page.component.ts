import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../core/services/session.service';
import { AppHeaderComponent } from '../shared/ui/app-header/app-header.component';
import { BottomSheetComponent } from '../shared/ui/bottom-sheet/bottom-sheet.component';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { PhaseIndicatorComponent } from '../shared/ui/phase-indicator/phase-indicator.component';
import { PlayerChipComponent } from '../shared/ui/player-chip/player-chip.component';

interface LobbyPlayer {
  name: string;
  isGM: boolean;
  isDead: boolean;
}

@Component({
  standalone: true,
  imports: [
    AppHeaderComponent,
    BottomSheetComponent,
    ButtonComponent,
    PhaseIndicatorComponent,
    PlayerChipComponent
  ],
  templateUrl: './lobby-page.component.html',
  styles: `
    .lobby-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      overflow: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }

    .top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.7rem;
    }

    .count-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: color-mix(in srgb, var(--color-card) 85%, transparent);
      padding: 0.35rem 0.65rem;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .intro h2 {
      margin: 0;
      font-size: 1.45rem;
    }

    .intro p {
      margin: 0.35rem 0 0;
      font-size: 0.82rem;
      color: var(--color-muted-foreground);
      line-height: 1.4;
    }

    .players-list {
      display: grid;
      gap: 0.55rem;
      flex: 1;
      align-content: start;
    }

    .button-content {
      display: inline-flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
    }

    .waiting-note {
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-card) 80%, transparent);
      padding: 0.8rem;
      text-align: center;
      color: var(--color-muted-foreground);
      font-size: 0.82rem;
    }

    .host-name {
      color: var(--color-accent);
      font-weight: 500;
    }

    .sheet-body {
      display: grid;
      gap: 0.9rem;
    }

    .sheet-body p {
      margin: 0;
      color: var(--color-muted-foreground);
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .sheet-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
    }
  `
})
export class LobbyPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  readonly players = signal<LobbyPlayer[]>([
    { name: 'Melih', isGM: true, isDead: false },
    { name: 'Deniz', isGM: false, isDead: false },
    { name: 'Eddie', isGM: false, isDead: false },
    { name: 'Ollie', isGM: false, isDead: false },
    { name: 'Ege', isGM: false, isDead: false },
    { name: 'Bilge', isGM: false, isDead: false }
  ]);
  readonly showLockConfirm = signal(false);
  readonly roomCode = computed(() => this.session.gameId() ?? 'K7P4Q');

  readonly isGM = true;

  ngOnInit(): void {
    if (!this.session.playerName()) {
      this.router.navigateByUrl('/enter-name');
      return;
    }

    if (!this.session.gameId()) {
      this.session.setGameId('K7P4Q');
    }
  }

  leaveLobby(): void {
    this.session.clearGameContext();
    this.router.navigateByUrl('/create-or-join');
  }

  openLockDialog(): void {
    this.showLockConfirm.set(true);
  }

  closeLockDialog(): void {
    this.showLockConfirm.set(false);
  }

  lockAndStart(): void {
    this.showLockConfirm.set(false);
    this.router.navigateByUrl('/role-reveal');
  }
}
