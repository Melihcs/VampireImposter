import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/splash-page.component').then((m) => m.SplashPageComponent)
  },
  {
    path: 'enter-name',
    loadComponent: () =>
      import('./pages/enter-name-page.component').then((m) => m.EnterNamePageComponent)
  },
  {
    path: 'create-or-join',
    loadComponent: () =>
      import('./pages/create-or-join-page.component').then((m) => m.CreateOrJoinPageComponent)
  },
  {
    path: 'create-room',
    loadComponent: () =>
      import('./pages/create-room-page.component').then((m) => m.CreateRoomPageComponent)
  },
  {
    path: 'join-room',
    loadComponent: () =>
      import('./pages/join-room-page.component').then((m) => m.JoinRoomPageComponent)
  },
  {
    path: 'lobby',
    loadComponent: () =>
      import('./pages/lobby-page.component').then((m) => m.LobbyPageComponent)
  },
  {
    path: 'role-reveal',
    loadComponent: () =>
      import('./pages/role-reveal-page.component').then((m) => m.RoleRevealPageComponent)
  },
  {
    path: 'waiting-for-others',
    loadComponent: () =>
      import('./pages/waiting-for-others-page.component').then((m) => m.WaitingForOthersPageComponent)
  },
  {
    path: 'day-discussion',
    loadComponent: () =>
      import('./pages/day-discussion-page.component').then((m) => m.DayDiscussionPageComponent)
  },
  {
    path: 'voting',
    loadComponent: () =>
      import('./pages/voting-page.component').then((m) => m.VotingPageComponent)
  },
  {
    path: 'execution-reveal',
    loadComponent: () =>
      import('./pages/execution-reveal-page.component').then((m) => m.ExecutionRevealPageComponent)
  },
  {
    path: 'night-random-question',
    loadComponent: () =>
      import('./pages/night-random-question-page.component').then((m) => m.NightRandomQuestionPageComponent)
  },
  {
    path: 'night-vampire-kill',
    loadComponent: () =>
      import('./pages/night-vampire-kill-page.component').then((m) => m.NightVampireKillPageComponent)
  },
  {
    path: 'night-hunter-inspect',
    loadComponent: () =>
      import('./pages/night-hunter-inspect-page.component').then((m) => m.NightHunterInspectPageComponent)
  },
  {
    path: 'game-over',
    loadComponent: () =>
      import('./pages/game-over-page.component').then((m) => m.GameOverPageComponent)
  },
  {
    path: 'style-guide',
    loadComponent: () =>
      import('./pages/style-guide-page.component').then((m) => m.StyleGuidePageComponent)
  },
  {
    path: 'roster',
    loadComponent: () =>
      import('./pages/roster-page.component').then((m) => m.RosterPageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
