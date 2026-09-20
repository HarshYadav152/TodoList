# START HERE — Todolist v2

Read order: this file → PRD.md (what/why) → PHASES.md (what's built) →
STATUS.md (what's verified vs. still needs a real Mongo to test).

## Layout

```
todolist-v2/
  backend/    NestJS API (auth, todos, sharing, notifications) — MongoDB via Mongoose
  frontend/   Vite + React app (kept from v1, restructured + API-wired)
  compare.md  (from the earlier audit — competitive comparison, unchanged)
```

## Fastest path to running it

```bash
# Backend
cd backend
docker compose up -d          # local MongoDB on :27017
cp .env.example .env
npm install
npm run generate:vapid        # copy the two output keys into .env
npm run start:dev             # http://localhost:3001

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

Open `http://localhost:5173`, register an account, and you're in.

## What changed from v1

- **Was:** everything in one `localStorage`-backed `App.jsx`, no accounts, no backend.
- **Now:** NestJS + MongoDB backend, JWT auth, todos synced server-side,
  recurring tasks, subtasks, Web Push reminders, drag-and-drop manual
  ordering, a calendar view, and shareable lists (view/edit access for
  another registered user). Frontend stayed on Vite/React by request but
  was split into proper components.
- The four v1 bugs from the original audit are fixed as a side effect of the
  new architecture, not patched: the shared add/edit form state bug is gone
  because `TodoItem` now owns its own edit state; the broken `gh-pages -d
  build` deploy script and the missing `eslint-plugin-react` dependency were
  both removed since gh-pages static-only deployment no longer fits a
  backend-having app the same way (see below).

## If you still want to deploy the frontend as a static site

It's still just Vite output — deployable anywhere static (GitHub Pages,
Netlify, Vercel, S3). Point `VITE_API_URL` in `.env` at wherever the backend
ends up hosted, and make sure that backend's `FRONTEND_URL` CORS setting
matches your deployed frontend origin exactly. Push notifications need
HTTPS once you're off `localhost` — see STATUS.md.

## Biggest open item

No MongoDB was available in the sandbox this was built in, so nothing that
touches the database has been run against real data yet — only compiled,
linted, and boot-tested. Run through the manual walkthrough in STATUS.md
before treating this as done-done.
