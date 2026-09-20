# PHASES — Todolist v2

## Phase 1 — Backend foundation ✅
NestJS scaffold, env config with prod-fail-fast on missing secrets, Mongo
connection via `@nestjs/mongoose`.

## Phase 2 — Auth ✅
`User` schema, register/login/refresh/logout, JWT access + httpOnly-cookie
refresh with hashed rotation, `JwtAuthGuard` / `JwtRefreshGuard`.

## Phase 3 — Todos core ✅
`Todo` schema (category now free-text, not the old fixed 4-value enum),
CRUD, filter/search/sort/pagination, ownership enforced (404, not 403, on
cross-user access — avoids leaking existence of another user's todo).

## Phase 4 — Recurrence engine ✅
Pure `computeNextOccurrence()` function, fully unit-tested (7/7 passing:
daily/weekly-with-weekdays/monthly, `endDate` cutoff, week-wrap, bad-input
guard). Wired into `TodosService.update()`: completing a recurring todo
spawns the next occurrence as a new document.

## Phase 5 — Subtasks ✅
Embedded subdocuments on `Todo`, dedicated add/update/delete sub-routes.

## Phase 6 — Web Push notifications ✅
`PushSubscription` schema, `web-push` wrapper with dead-subscription
cleanup on 404/410, VAPID key generation script, 5-minute cron scanning
`reminderAt <= now AND notifiedAt == null AND isCompleted == false`.

## Phase 7 — Frontend integration ✅
`App.jsx` decomposed into `TodoForm` / `TodoItem` / `TodoList` /
`SubtaskList` / `RecurrenceFields` / `Filters` / `StatsBar` / `PushToggle` /
`ConfirmDialog`. Auth context with silent-refresh-on-load, protected
routing, `react-query` hooks replacing all direct `localStorage` calls,
service worker (`public/sw.js`) for push display + click-to-focus.

## Phase 8 — Verification, Tier 1 (partial — see STATUS.md) ⚠️
Done: `tsc --noEmit`, backend ESLint, `nest build`, DI-graph boot check,
frontend ESLint, `vite build`, recurrence unit tests.
**Not done:** endpoint-level / e2e testing against a live MongoDB — none was
available in the build environment. This is the first thing to run once
you have a local Mongo up (see START-HERE.md).

## Phase 9 — Manual ordering + drag-and-drop ✅ (Tier 2)
`order` field on `Todo` (fractional indexing), `PATCH /todos/:id/reorder`
taking `{prevId, nextId}` so a reorder only ever writes the one moved
document. Math extracted into a pure `computeReorderedValue()` — unit
tested (5/5 passing). Frontend: native HTML5 drag-and-drop in `TodoList`,
optimistic cache update in `useReorderTodo` (rolls back on failure), only
enabled when the sort is set to "Manual order".

## Phase 10 — Shareable lists ✅ (Tier 2)
New `Share` schema/service/controller: share your list with another
registered user's email at `view` or `edit` permission.
`SharesService.assertAccess()` is the single gate `TodosService` runs
through on every read/write — own list always passes; shared access needs
a matching Share record at or above the required level; anything else
404s (not 403) to avoid revealing whether a list exists. `TodosController`
threads an optional `ownerId` query param through every endpoint so the
same routes serve "my list" or "a list shared with me". Frontend:
`ListContext` tracks which list is being viewed and whether you can edit
it, `ListSwitcher` to change lists, `ShareModal` to grant/revoke access.

## Phase 11 — Calendar view ✅ (Tier 2)
Backend: `dueFrom`/`dueTo` range filters on `GET /todos`. Frontend: a
month-grid `CalendarView` page (no calendar library — a small
hand-rolled grid) showing todos on their due date, click-to-toggle-complete,
respects `canEdit` from `ListContext` same as the list view.

## Phase 12 — Verification, Tier 2 ✅
Backend: `tsc --noEmit`, ESLint, `nest build`, DI-graph boot check all
re-run clean after the Shares module and ordering changes; 12/12 unit
tests passing (recurrence + new ordering tests). Frontend: `vite build`
and ESLint clean after wiring `ListContext`/drag-and-drop/calendar
through every component.
**Still not done:** live-database endpoint testing (same gap as Phase 8 —
no MongoDB in the build sandbox). Sharing and drag-and-drop are exactly
the kind of feature that benefits from a real walkthrough (two accounts,
one sharing to the other) before trusting them — see STATUS.md.

## Not started (Tier 3 — future phases)
PWA installability, email-based reminders as a push fallback, per-todo
labels/tags (multiple, not just one category), notifications for shared
todos you don't own (see STATUS.md's "known gaps" — currently reminders
only fire to the todo's actual owner, not everyone with list access).
