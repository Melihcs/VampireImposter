import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreatePlayerRequest,
  CreatePlayerResponse,
  LegacyRosterPlayer,
  PlayerDto,
  RenamePlayerRequest
} from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PlayersApiService {
  private readonly api = inject(ApiService);

  getLegacyRoster(): Observable<LegacyRosterPlayer[]> {
    return this.api.get<LegacyRosterPlayer[]>('/players', { auth: false });
  }

  createPlayer(request: CreatePlayerRequest): Observable<CreatePlayerResponse> {
    return this.api.post<CreatePlayerResponse>('/players', request, { auth: false });
  }

  getPlayerById(playerId: string): Observable<PlayerDto> {
    return this.api.get<PlayerDto>(`/players/${playerId}`);
  }

  renameCurrentPlayer(request: RenamePlayerRequest): Observable<PlayerDto> {
    return this.api.patch<PlayerDto>('/players/me', request);
  }

  endPlayerSession(): Observable<void> {
    return this.api.delete<void>('/players/session');
  }
}
