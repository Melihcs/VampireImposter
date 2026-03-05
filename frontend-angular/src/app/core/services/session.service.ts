import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEYS = {
  playerName: 'vi.playerName',
  playerToken: 'vi.playerToken',
  playerId: 'vi.playerId',
  gameId: 'vi.gameId'
} as const;

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly playerNameSignal = signal<string | null>(this.read(STORAGE_KEYS.playerName));
  private readonly playerTokenSignal = signal<string | null>(this.read(STORAGE_KEYS.playerToken));
  private readonly playerIdSignal = signal<string | null>(this.read(STORAGE_KEYS.playerId));
  private readonly gameIdSignal = signal<string | null>(this.read(STORAGE_KEYS.gameId));

  readonly playerName = computed(() => this.playerNameSignal());
  readonly playerToken = computed(() => this.playerTokenSignal());
  readonly playerId = computed(() => this.playerIdSignal());
  readonly gameId = computed(() => this.gameIdSignal());
  readonly hasSession = computed(() => Boolean(this.playerTokenSignal() && this.playerIdSignal()));

  setPlayerName(name: string | null): void {
    this.write(STORAGE_KEYS.playerName, name);
    this.playerNameSignal.set(name);
  }

  setPlayerToken(token: string | null): void {
    this.write(STORAGE_KEYS.playerToken, token);
    this.playerTokenSignal.set(token);
  }

  setPlayerId(playerId: string | null): void {
    this.write(STORAGE_KEYS.playerId, playerId);
    this.playerIdSignal.set(playerId);
  }

  setGameId(gameId: string | null): void {
    this.write(STORAGE_KEYS.gameId, gameId);
    this.gameIdSignal.set(gameId);
  }

  setPlayerSession(data: { playerId: string; playerToken: string; playerName?: string | null }): void {
    this.setPlayerId(data.playerId);
    this.setPlayerToken(data.playerToken);
    if (data.playerName !== undefined) {
      this.setPlayerName(data.playerName);
    }
  }

  clearGameContext(): void {
    this.setGameId(null);
  }

  clearSession(): void {
    this.setPlayerName(null);
    this.setPlayerToken(null);
    this.setPlayerId(null);
    this.setGameId(null);
  }

  private read(key: string): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(key);
  }

  private write(key: string, value: string | null): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    if (value === null || value.trim() === '') {
      sessionStorage.removeItem(key);
      return;
    }

    sessionStorage.setItem(key, value);
  }
}
