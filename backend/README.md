# Todolist backend

NestJS + MongoDB API for the Todolist app. See the root [README.md](../README.md)
for the full picture (features, both services, deployment). This file is
just the backend-specific bits.

## Run locally

```bash
docker compose up -d       # local MongoDB on :27017
cp .env.example .env
npm install
npm run generate:vapid     # paste the two printed keys into .env
npm run start:dev          # http://localhost:3001
```

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | Dev server with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled build |
| `npm test` | Unit tests (recurrence engine, etc.) |
| `npm run lint` | ESLint with `--fix` |
| `npm run generate:vapid` | Generate a VAPID keypair for Web Push |

## Modules

- `auth/` — register/login/refresh/logout, JWT access + httpOnly-cookie refresh
- `users/` — user schema and lookups
- `todos/` — CRUD, subtasks, recurrence engine (`todos/recurrence/`), manual ordering (`todos/ordering/`)
- `notifications/` — push subscriptions, `web-push` wrapper, cron reminder scan
- `shares/` — grant/revoke another user view/edit access to your list; `SharesService.assertAccess()` is the access-control gate `TodosService` runs through on every request

## Testing

```bash
npm test                 # unit tests — no database required
```

There's no e2e suite yet — it needs a running MongoDB (`docker compose up -d`)
and wasn't set up in the environment this was originally built in. See the
root `STATUS.md` for the manual walkthrough to run in the meantime.
