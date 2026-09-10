# Todolist

A todo app that syncs across devices, reminds you when things are due —
even with the tab closed — and handles recurring tasks and subtasks
properly. NestJS + MongoDB API underneath, React frontend on top.

## Features

- **Accounts & cross-device sync** — log in from any browser, see the same todos
- **Due-date reminders** — real browser push notifications, delivered even if the tab or browser is closed, as long as permission was granted
- **Recurring tasks** — daily, weekly (pick specific weekdays), or monthly, with an optional end date; completing one instance generates the next automatically
- **Subtasks** — a checklist inside any todo
- **Search, filter, and sort** — by status, priority, and free-text search, all server-side
- **Free-form categories** — not locked into a fixed list

## Tech stack

| Layer | Choice |
|---|---|
| Backend | NestJS, MongoDB (Mongoose), JWT auth, `web-push` |
| Frontend | React (Vite), Tailwind CSS, TanStack Query, React Router |
| Notifications | Web Push API (VAPID), server-side cron reminder scan |

## Project structure

```
todolist-v2/
  backend/     NestJS API — auth, todos, notifications
  frontend/    React app
  PRD.md       what this is and why it's built this way
  PHASES.md    build phases and what's done
  STATUS.md    verification status and what to check before relying on it
  compare.md   how this stacks up against Todoist, TickTick, etc.
```

## Getting started

Requires Node 18+ and either Docker or a local MongoDB install.

```bash
# 1. Database
cd backend
docker compose up -d

# 2. Backend
cp .env.example .env
npm install
npm run generate:vapid    # copy the two printed keys into .env
npm run start:dev         # → http://localhost:3001

# 3. Frontend (new terminal)
cd ../frontend
cp .env.example .env
npm install
npm run dev                # → http://localhost:5173
```

Open `http://localhost:5173`, register an account, and start adding todos.
To get reminders, click **Enable reminders** and accept the browser's
notification permission prompt.

## How reminders work

Every todo can have a `dueDate` (when it's due) and separately a
`reminderAt` (when you want to be pinged about it — these don't have to be
the same moment). A backend job checks every 5 minutes for reminders that
have arrived and haven't been sent yet, and pushes a real OS-level
notification to every device you've enabled reminders on. Click the
notification and it opens the app.

## How recurrence works

Set a todo to repeat daily, weekly, or monthly (weekly lets you pick which
days). When you complete an occurrence, the next one is generated
automatically with its due date and reminder shifted forward by the same
rule — your completed history stays intact rather than being overwritten.

## Environment variables

**`backend/.env`**

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `FRONTEND_URL` | Must match the frontend's origin exactly — used for CORS |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Sign the two token types — generate real ones for anything beyond local dev |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | From `npm run generate:vapid` — required for push to work |

**`frontend/.env`**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Where the backend is running |

## Deploying

The frontend is a static build (`npm run build` in `frontend/`) — deployable
anywhere static (Netlify, Vercel, GitHub Pages, S3). Push notifications
require HTTPS once you're off `localhost`. Point `VITE_API_URL` at your
deployed backend, and make sure the backend's `FRONTEND_URL` matches your
deployed frontend's origin exactly, or CORS will block requests.

## What's not built yet

Shared/collaborative lists, a calendar view, drag-and-drop reordering, and
PWA installability — see `compare.md` for the full competitive gap analysis
and `PHASES.md` for what's planned next.

## Status

Backend and frontend both build and lint clean, and the recurrence logic is
unit-tested. Endpoint-level testing against a live database is the one thing
that hasn't been run yet — see `STATUS.md` for the exact walkthrough to do
that before treating this as production-ready.