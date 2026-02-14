# Vampire Imposter Monorepo

Monorepo containing:

- ASP.NET Core Web API backend (`backend/VampireImposter.Api`)
- React + TypeScript + Vite + Tailwind frontend (`frontend`)

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

Frontend install:

```bash
cd frontend
npm install
```

## Run

Terminal 1 (backend):

```bash
cd backend/VampireImposter.Api
dotnet run
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

The frontend uses a Vite proxy so `/api` calls go to `https://localhost:5001`.

## API

- `GET https://localhost:5001/api/players`

## HTTPS Dev Cert (macOS)

If HTTPS fails locally, trust the dev cert:

```bash
dotnet dev-certs https --trust
```

## Common Issues

- Port conflicts:
  - Backend defaults to `https://localhost:5001` and `http://localhost:5000` (see `backend/VampireImposter.Api/Properties/launchSettings.json`).
  - Frontend defaults to `http://localhost:5173`.
- Tailwind not applying:
  - Ensure `@import "tailwindcss";` is present in `frontend/src/index.css`.
  - Ensure `@tailwindcss/vite` is in `frontend/vite.config.ts` plugins.
  - Ensure `frontend/src/index.css` is imported in `frontend/src/main.tsx`.
  - Restart the Vite dev server after changing config.
- HTTPS proxy errors:
  - Confirm the backend is running on `https://localhost:5001`.
  - If using a different port, update the Vite proxy target in `frontend/vite.config.ts`.
