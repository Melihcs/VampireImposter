import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateGameRequest,
  GameDto,
  GameListItemDto,
  GameStateDto,
  JoinGameRequest
} from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class GamesApiService {
  private readonly api = inject(ApiService);

  listLobbyGames(skip = 0, take = 50): Observable<GameListItemDto[]> {
    return this.api.get<GameListItemDto[]>('/games', {
      params: {
        state: 'lobby',
        skip,
        take
      }
    });
  }

  createGame(request: CreateGameRequest): Observable<GameDto> {
    return this.api.post<GameDto>('/games', request);
  }

  getGameById(gameId: string): Observable<GameDto> {
    return this.api.get<GameDto>(`/games/${gameId}`);
  }

  getGameState(gameId: string): Observable<GameStateDto> {
    return this.api.get<GameStateDto>(`/games/${gameId}/state`);
  }

  joinGame(gameId: string, request: JoinGameRequest): Observable<GameDto> {
    return this.api.post<GameDto>(`/games/${gameId}/join`, request);
  }

  startGame(gameId: string): Observable<GameDto> {
    return this.api.post<GameDto>(`/games/${gameId}/start`);
  }

  leaveGame(gameId: string): Observable<void> {
    return this.api.delete<void>(`/games/${gameId}/players/me`);
  }
}
