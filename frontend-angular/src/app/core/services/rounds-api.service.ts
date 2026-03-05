import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CastVoteRequest,
  RoundStateDto,
  StartDiscussionRequest,
  StartVotingRequest,
  SubmitRoundActionRequest
} from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RoundsApiService {
  private readonly api = inject(ApiService);

  startRound(gameId: string): Observable<RoundStateDto> {
    return this.api.post<RoundStateDto>(`/games/${gameId}/rounds/start`);
  }

  startDiscussion(gameId: string, request: StartDiscussionRequest): Observable<RoundStateDto> {
    return this.api.post<RoundStateDto>(`/games/${gameId}/rounds/discussion/start`, request);
  }

  closeDiscussion(gameId: string): Observable<RoundStateDto> {
    return this.api.post<RoundStateDto>(`/games/${gameId}/rounds/discussion/close`);
  }

  startVoting(gameId: string, request: StartVotingRequest): Observable<RoundStateDto> {
    return this.api.post<RoundStateDto>(`/games/${gameId}/rounds/voting/start`, request);
  }

  castVote(gameId: string, request: CastVoteRequest): Observable<RoundStateDto> {
    return this.api.post<RoundStateDto>(`/games/${gameId}/rounds/votes`, request);
  }

  submitRoundAction(gameId: string, request: SubmitRoundActionRequest): Observable<RoundStateDto> {
    return this.api.post<RoundStateDto>(`/games/${gameId}/rounds/actions`, request);
  }
}
