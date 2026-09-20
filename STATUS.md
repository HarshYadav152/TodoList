# STATUS — Todolist v2

_Last updated: this build session._

## What's verified

| Check | Result |
|---|---|
| Backend `tsc --noEmit` | ✅ clean |
| Backend ESLint | ✅ clean (auto-fixed formatting) |
| Backend `nest build` | ✅ succeeds |
| Backend DI graph boot (`node dist/main.js`) | ✅ boots through full module wiring; blocks on Mongo connection, as expected with no DB in the sandbox |
| Recurrence engine unit tests | ✅ 7/7 passing (`src/todos/recurrence/recurrence.util.spec.ts`) |
| Ordering (fractional-index) unit tests | ✅ 5/5 passing (`src/todos/ordering/compute-order.util.spec.ts`) — 12/12 total across the backend |
| Frontend ESLint | ✅ clean (2 harmless fast-refresh warnings — `AuthContext.jsx` and `ListContext.jsx` each export both a provider and a hook, a normal pattern, left as-is) |
| Frontend `vite build` | ✅ succeeds (both after Tier 1 and after the Tier 2 sharing/ordering/calendar additions) |

## What's NOT verified (do this next)

**No MongoDB was available in the build sandbox** (no `mongodb-server` in apt,
no network access to download `mongodb-memory-server` binaries). Everything
that touches an actual database query is written and internally consistent,
but hasn't been run against real data. Before relying on this:

```bash
# 1. Start Mongo locally
cd backend && docker compose up -d

# 2. Configure env
cp .env.example .env
npm run generate:vapid   # paste the two keys into .env

# 3. Start the backend
npm run start:dev

# 4. In another terminal, frontend
cd ../frontend
cp .env.example .env
npm run dev
```

Then manually walk through: register → create a todo with a `reminderAt` a
few minutes out → enable push (browser will prompt for notification
permission) → confirm the push arrives → mark a recurring todo complete and
confirm exactly one new occurrence appears, dated correctly → add/toggle/
delete a subtask → log in from a second browser and confirm the same todos
show up.

**Tier 2 additions to walk through specifically:**
- Drag a todo card to a new position (switch the sort dropdown to "Manual
  order" first) → confirm it lands where dropped and the order survives a
  page reload.
- Register a second account → from account A, click **Share**, enter
  account B's email, grant "Can edit" → log in as account B → use the list
  switcher to select account A's list → confirm you can see, add, and edit
  todos on it → switch account A's share to "Can view" → confirm account B
  can no longer add/edit/delete from that list.
- Open the **Calendar** tab, add a todo with a due date this month, confirm
  it appears on the right day, click it to toggle complete.

## Known gaps worth knowing about

- **Shared-list viewers don't get push reminders for todos they don't
  own.** `RemindersScheduler` sends to `todo.owner` only — if account B has
  edit access to account A's list, B won't be pushed a reminder for a todo
  on that list even though B can see and edit it. Fixing this means
  notifying every user with access (owner + anyone with a Share record),
  not just the owner — a reasonable Tier 3 addition.
- **Sharing is all-or-nothing per list, not per-todo.** There's no way to
  share a single todo or a subset — it's the whole list at one permission
  level. Matches the "shareable lists" Tier 2 goal from the original audit,
  but worth knowing if per-todo sharing is what's actually wanted.
- **Drag-and-drop uses the browser's native HTML5 DnD API**, not a library
  — works well on desktop, but native HTML5 drag-and-drop has known rough
  edges on mobile touch (no built-in touch support at all, actually) —
  reordering therefore only works with a mouse/trackpad right now, not on
  a phone/tablet. A touch-friendly library (e.g. `@dnd-kit`) is the
  upgrade path if mobile reordering matters.

- **No automated e2e/integration tests yet** — the default Nest e2e scaffold
  was removed because it required a live DB the sandbox didn't have. Adding
  a real e2e suite (with `mongodb-memory-server`, which needs network access
  this sandbox didn't have either) is the natural next addition.
- **Push notifications require HTTPS in production** (or `localhost` for
  dev — browsers exempt localhost from the secure-context requirement).
  Deploying the frontend anywhere other than `localhost` needs TLS for push
  to work at all.
- **No rate limiting** on `/auth/*` — fine for personal use, worth adding
  (`@nestjs/throttler`) before any public-facing deployment.
- **npm audit** flagged a handful of vulnerabilities in transitive deps on
  both backend and frontend installs (mostly older tooling packages, not
  runtime dependencies actually reachable by user input) — worth a look with
  `npm audit` before deploying, not urgent for local dev.
