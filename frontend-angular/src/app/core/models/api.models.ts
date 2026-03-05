export interface LegacyRosterPlayer {
  id: number;
  name: string;
  position: string;
}

export interface CreatePlayerRequest {
  name: string;
}

export interface CreatePlayerResponse {
  playerId: string;
  name: string;
  playerToken: string;
}

export interface PlayerDto {
  playerId: string;
  name: string;
  createdAtUtc: string;
}

export interface RenamePlayerRequest {
  name: string;
}

export interface CreateGameRequest {
  name: string;
  maxPlayers?: number;
  discussionTime: number;
  votingTime: number;
  passcode: string;
}

export interface JoinGameRequest {
  passcode: string;
}

export interface GameListItemDto {
  gameId: string;
  name: string;
  createdAtUtc: string;
  hostPlayerId: string;
  playerCount: number;
  maxPlayers: number;
  isJoinable: boolean;
  passcodeRequired: boolean;
}

export interface GameDto {
  gameId: string;
  name: string;
  createdAtUtc: string;
  hostPlayerId: string;
  state: string;
  playerIds: string[];
  playerCount: number;
  maxPlayers: number;
  discussionTime: number;
  votingTime: number;
  isJoinable: boolean;
  passcodeRequired: boolean;
}

export interface GamePlayerStateDto {
  playerId: string;
  name: string;
  isAlive: boolean;
  isHost: boolean;
}

export interface RoundStateDto {
  roundNumber: number;
  phase: string;
  questionText?: string | null;
  serverTimeUtc: string;
  questionStartedAtUtc?: string | null;
  discussionStartedAtUtc?: string | null;
  discussionDurationSeconds?: number | null;
  discussionEndsAtUtc?: string | null;
  votingStartedAtUtc?: string | null;
  votingDurationSeconds?: number | null;
  votingEndsAtUtc?: string | null;
}

export interface GameStateDto {
  gameId: string;
  name: string;
  state: string;
  serverTimeUtc: string;
  hostPlayerId: string;
  currentRoundNumber: number;
  discussionTime: number;
  votingTime: number;
  requestingPlayerId: string;
  requestingPlayerRole: string;
  requestingPlayerIsAlive: boolean;
  players: GamePlayerStateDto[];
  currentRound?: RoundStateDto | null;
}

export interface StartDiscussionRequest {
  durationSeconds?: number | null;
}

export interface StartVotingRequest {
  durationSeconds?: number | null;
}

export interface SubmitRoundActionRequest {
  selectedPlayerId: string;
}

export interface CastVoteRequest {
  targetPlayerId: string;
}

export interface ErrorResponse {
  error: string;
}
