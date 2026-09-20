# PRD — Todolist v2

## Problem

v1 was a single-browser, `localStorage`-only React app (see `compare.md` from the
earlier audit). It couldn't sync across devices, had no reminders, no recurring
tasks, and no subtasks — the four gaps that put it well below every mainstream
competitor (Todoist, TickTick, Microsoft To Do, Google Tasks, Any.do).

## Goal

Close the Tier-1 gaps identified in that audit, on a backend architecture
that could keep growing — and then Tier 2 (sharing, calendar view,
drag-and-drop) did in fact slot in without a rewrite, which is the real
validation of the original architecture decision.

## Scope (Tier 1 — done)

1. **Account + cross-device sync** — todos live server-side, not in the browser.
2. **Due-date reminders via Web Push** — fire even when the tab/browser is closed.
3. **Recurring tasks** — daily/weekly (specific weekdays)/monthly, with an optional end date.
4. **Subtasks** — a checklist inside a todo.

## Scope (Tier 2 — done)

5. **Drag-and-drop reordering** — fractional-index `order` field, so reordering only ever writes the one moved row.
6. **Shareable lists** — grant another registered user `view` or `edit` access to your whole list.
7. **Calendar view** — a month grid of todos by due date.

Free-form categories (vs. v1's fixed 4-value list) shipped as part of Tier 1's schema redesign rather than as a separate Tier 2 item.

## Explicitly out of scope for this pass

PWA installability, email-based reminders as a push fallback, per-todo
sharing (currently whole-list only), multiple labels/tags per todo (still
one free-text category). These are Tier 3 items and natural follow-ups.

## Architecture decision

- **Backend:** NestJS + MongoDB (Mongoose) — matches the standard stack used
  across the Geeta Systems suite.
- **Frontend:** kept as Vite + React (explicit decision — not migrated to
  Next.js) and restructured from one 500-line `App.jsx` into composable
  components (`TodoForm`, `TodoItem`, `TodoList`, `SubtaskList`,
  `RecurrenceFields`, `Filters`, `StatsBar`, `PushToggle`, `ConfirmDialog`,
  `ListSwitcher`, `ShareModal`) plus `react-query` for server-state
  caching/sync and `react-router-dom` for auth-gated routing.
- **Auth:** JWT access token (15 min, held in memory only) + refresh token
  (7 days, httpOnly cookie) with hash-rotation on every refresh.
- **Recurrence:** generate-next-on-complete, not pre-generate-all-future —
  keeps completed history intact and avoids unbounded future todo creation.
- **Notifications:** Web Push (`web-push` + VAPID) with a 5-minute cron scan
  of due, unsent reminders. `reminderAt` is a field distinct from `dueDate` so
  "due Sept 20" and "remind me at 9am on Sept 20" aren't conflated.
- **Ordering:** fractional indexing (`computeReorderedValue`) rather than
  renumbering the whole list on every drag — a reorder is always a single
  document write.
- **Sharing:** one flat permission (`view`/`edit`) per (owner, invitee) pair,
  gated through a single `SharesService.assertAccess()` check that
  `TodosService` calls on every operation. Invitee must already have an
  account — no pending-invite state for an email that hasn't signed up.

## Success criteria

- A user can register, log in from a second browser, and see the same todos.
- A todo with a `reminderAt` in the past gets pushed within 5 minutes, even
  with the tab closed (browser running, permission granted).
- Completing a recurring todo produces exactly one new occurrence, correctly
  dated, and never duplicates on repeat completions or overlapping cron ticks.
- Subtasks can be added/toggled/removed without reloading the parent todo list.
- Dragging a todo to a new position persists that order across reloads and
  devices, and only ever writes the one moved todo.
- Sharing your list with `view` permission lets the other user see and check
  off todos but not add/edit/delete/reorder them; `edit` permission allows all
  of it. Revoking access removes it immediately.
- The calendar view shows a todo on the correct day and lets you toggle it
  complete without leaving the month grid.

## Known limitation of this pass

No live MongoDB was available in the build sandbox, so verification stopped at:
TypeScript compiles clean, ESLint clean, Nest DI graph boots clean, `vite build`
succeeds, and the recurrence + ordering engines' pure logic is unit-tested
(12/12 passing). **Endpoint-level testing against a real database has not been
done yet** — see STATUS.md for the exact commands to do that locally,
including a specific checklist for the sharing and drag-and-drop features.
Also see STATUS.md's "known gaps" for a real, not-yet-fixed limitation: push
reminders currently only notify a todo's owner, not everyone with shared
access to that list.
