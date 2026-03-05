# Vampire Imposter Monorepo

Monorepo containing:

- ASP.NET Core Web API backend (`backend/VampireImposter.Api`)
- React + TypeScript + Vite + Tailwind frontend (`frontend`)
- Angular + TypeScript + Tailwind frontend (`frontend-angular`)

## Prerequisites

- nvm (Node Version Manager)
- Node.js latest stable (use `.nvmrc`)
- .NET SDK latest stable (currently `net10.0` for the backend)

Check versions:

```bash
nvm --version
node -v
npm -v
dotnet --version
```

## Setup

```bash
cd vampire-imposter
nvm use
```

Backend restore:

```bash
dotnet restore VampireImposter.sln
```

Backend secret setup (required for game passcode hashing):

```bash
cd backend/VampireImposter.Api
dotnet user-secrets set "Security:PasscodePepper" "replace-with-a-long-random-secret"
```

Frontend install:

```bash
cd frontend
npm install
```

Angular frontend install:

```bash
cd frontend-angular
npm install
```

## Run

Terminal 1 (backend):

```bash
cd backend/VampireImposter.Api
dotnet run
```

Terminal 2 (React frontend):

```bash
cd frontend
npm run dev
```

Terminal 3 (Angular frontend):

```bash
cd frontend-angular
npm run start -- --port 4210 --host 127.0.0.1
```

Both frontends proxy `/api` to backend HTTP local dev (`http://localhost:5000`).

## API

- `GET https://localhost:5001/api/players`

## Passcode Secret In CI

For GitHub Actions, add repository secret `SECURITY__PASSCODE_PEPPER`.
The workflow reads it as environment variable `Security__PasscodePepper`.

## HTTPS Dev Cert (macOS)

If HTTPS fails locally, trust the dev cert:

```bash
dotnet dev-certs https --trust
```

## Common Issues

- Port conflicts:
  - Backend defaults to `https://localhost:5001` and `http://localhost:5000` (see `backend/VampireImposter.Api/Properties/launchSettings.json`).
  - React frontend defaults to `http://localhost:5173`.
  - Angular frontend defaults to `http://localhost:4200` unless overridden (examples above use `4210`).
- Tailwind not applying:
  - Ensure `@import "tailwindcss";` is present in `frontend/src/index.css`.
  - Ensure `@tailwindcss/vite` is in `frontend/vite.config.ts` plugins.
  - Ensure `frontend/src/index.css` is imported in `frontend/src/main.tsx`.
  - For Angular, ensure `frontend-angular/src/styles.css` includes `@import "tailwindcss";`.
  - For Angular, ensure `frontend-angular/.postcssrc.json` contains `@tailwindcss/postcss`.
  - Restart the Vite dev server after changing config.
- Proxy errors:
  - Confirm the backend is running on `http://localhost:5000`.
  - If using a different backend port, update:
    - `frontend/vite.config.ts` (React)
    - `frontend-angular/proxy.conf.json` (Angular)
