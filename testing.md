# testing.md — Todolist v2 manual test plan

This is the walkthrough referenced from `STATUS.md`. Nothing here has been
run yet — everything up to this point was verified by compiling, linting,
and booting the app, not by hitting a real database. Check items off as you
go; anything that fails, note it here or open an issue against it.

## 0. Setup

- [ ] `cd backend && docker compose up -d` — Mongo running on `:27017`
- [ ] `cp backend/.env.example backend/.env`
- [ ] `cd backend && npm install && npm run generate:vapid` — paste both keys into `backend/.env`
- [ ] `cd backend && npm run start:dev` — confirm it logs `Backend listening on http://localhost:3001` with no errors
- [ ] `cp frontend/.env.example frontend/.env`
- [ ] `cd frontend && npm install && npm run dev` — open `http://localhost:5173`
- [ ] You'll need **two accounts** for the sharing tests — either two browser profiles or one normal + one incognito window, so cookies don't collide

---

## 1. Auth

- [ ] Register a new account (email + password ≥8 chars) → lands on the dashboard, no console errors
- [ ] Register again with the **same email** → clear error, not a raw 500
- [ ] Log out → redirected to `/login`
- [ ] Log in with the correct password → back on the dashboard
- [ ] Log in with the **wrong password** → clear error, not logged in
- [ ] While logged in, **hard refresh the page** → briefly shows a loading state, then lands back on the dashboard still logged in (this is the silent-refresh-via-cookie path — if it instead bounces you to `/login`, that's a bug)
- [ ] Open browser devtools → Application → Cookies → confirm `refresh_token` is present, `HttpOnly` is checked, and it is **not** readable from `document.cookie` in the console
- [ ] Confirm the access token is **not** in `localStorage` or `sessionStorage` (devtools → Application → Storage)
- [ ] Try visiting `/` in a fresh incognito tab with no login → redirected to `/login`, not a blank/broken page

---

## 2. Todos — core CRUD

- [ ] Create a todo with just a title → appears in the list immediately
- [ ] Create a todo with title < 3 characters → inline validation error, no request sent
- [ ] Expand the form and create a todo with notes, category, priority, due date all set → all fields show correctly on the card
- [ ] Edit a todo (click the pencil icon) → change title, notes, category, priority, due date → Save → card reflects changes
- [ ] **Specifically check the old v1 bug is actually fixed:** open the edit form on one todo, *without saving*, also start filling out the "Add new todo" form at the top → confirm the two forms' fields never bleed into each other (this was the worst bug in v1)
- [ ] Click Cancel while editing → no changes persisted
- [ ] Check the checkbox to mark complete → strikes through, moves according to current sort
- [ ] Delete a todo → confirm dialog appears → Cancel → todo still there → Delete again → Confirm → todo gone
- [ ] Confirm the delete dialog closes on **Escape key** and on **clicking outside** it

## 3. Filters, search, sort

- [ ] Search box: type part of a todo's title → list narrows to matches, debounced (doesn't fire a request on every keystroke — check the Network tab)
- [ ] Filter by "Pending" / "Completed" / "All" → list updates correctly
- [ ] Filter by priority → only matching todos shown
- [ ] Sort by "Newest first" / "Oldest first" / "Due date ↑" / "Due date ↓" → order changes correctly
- [ ] Stats bar (total/pending/done counts) stays accurate as you complete/delete todos

## 4. Subtasks

- [ ] Add a subtask to a todo → appears under it, "0/1 done" counter shows
- [ ] Toggle a subtask complete → strikethrough, counter updates
- [ ] Delete a subtask → removed, counter updates
- [ ] Add several subtasks → confirm none of this affects other todos' subtasks

## 5. Recurrence

- [ ] Create a todo with a due date, enable "Repeat this todo," set **daily**, interval 1 → complete it → confirm exactly **one** new occurrence appears, due date = original + 1 day
- [ ] Create a **weekly** recurring todo with specific weekdays selected (e.g. Mon/Wed/Fri) → complete it → confirm the next occurrence lands on the correct next weekday, not just +7 days
- [ ] Create a **monthly** recurring todo → complete it → confirm next due date is one month later (check a month-end date like the 31st to see how it handles shorter months)
- [ ] Set an `endDate` on a recurring todo, then complete occurrences until you'd cross that date → confirm it **stops** generating new ones instead of continuing forever
- [ ] Complete a recurring todo, then **un-check** it, then **re-complete** it → confirm it does **not** spawn a second duplicate occurrence
- [ ] Confirm the completed occurrence still exists in "Completed" filter (history isn't overwritten)

## 6. Push notifications (Web Push)

- [ ] Click "Enable reminders" → browser prompts for notification permission → Allow
- [ ] Button changes to "Reminders on"
- [ ] Create a todo with **"Remind me at"** set to ~2 minutes from now
- [ ] Wait for the reminder time to pass, then wait up to 5 minutes (the cron scan interval)
- [ ] **Close the browser tab entirely** (or the whole browser, if you want to test the strongest case) before the reminder time — confirm the OS notification still appears
- [ ] Click the notification → app opens/focuses
- [ ] Click "Reminders on" to disable → confirm no further notifications arrive for new reminders
- [ ] Check the backend logs around the reminder time — should log something like `Sending N due reminder(s)`
- [ ] If nothing arrives: confirm `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` are actually set in `backend/.env` (the service logs a warning at boot if they're missing) and that you're on `localhost` or HTTPS (push requires a secure context)

## 7. Drag-and-drop reordering

- [ ] Switch the sort dropdown to **"Manual order (drag to reorder)"**
- [ ] Drag a todo to a new position → it lands where dropped, other cards shift accordingly
- [ ] Reload the page → order persists
- [ ] Switch sort to "Newest first" then back to "Manual order" → your manual order is still there (proves it's a stored field, not just client-side state)
- [ ] Try dragging while a **different** sort (e.g. "Due date ↑") is active → drag handles/dragging should be disabled — reordering only makes sense in manual mode
- [ ] (Known limitation — not a bug) try this on a touchscreen device → won't work; native HTML5 drag-and-drop has no touch support

## 8. Sharing

Use your two accounts for this section — call them **A** (owner) and **B** (invitee).

- [ ] As A: click **Share**, enter B's email, choose **"Can view"** → submit → no error
- [ ] As B: open the list-switcher dropdown in the top bar → A's email should appear as an option
- [ ] As B: select A's list → A's todos load
- [ ] As B, with **view** permission: confirm the "Add new todo" form is replaced with a "You have view-only access" message, and there are no edit/delete icons on any card, and checkboxes are disabled
- [ ] As A: change B's permission to **"Can edit"** (re-share with the same email + edit, or from the Share modal's list)
- [ ] As B: refresh / re-select A's list → now the add form is back, checkboxes are enabled, edit/delete icons appear
- [ ] As B with edit access: create a todo, edit one, delete one, drag-reorder one, toggle a subtask → all should work and show up for A too
- [ ] As A: open the Share modal → revoke B's access → as B, confirm A's list disappears from the switcher (or a subsequent request to it 404s)
- [ ] As A: try sharing with an email that has **no account** → clear "no account exists with that email" error, not a 500
- [ ] As A: try sharing your list **with your own email** → clear error, not accepted
- [ ] As B (no access at all, or after revocation): try to directly hit a todo that belongs to A (e.g. via devtools/Postman with A's todo id and `?ownerId=<A's id>`) → should 404, not 403, and definitely not return A's data

## 9. Calendar view

- [ ] Click the **Calendar** tab
- [ ] Create a todo with a due date this month → appears on the correct day cell
- [ ] Click a todo on the calendar → toggles complete (strikethrough), without navigating away
- [ ] Navigate to next/previous month → grid updates, "Today" button jumps back to the current month
- [ ] Put more than 3 todos on one day → confirm it shows "+N more" instead of overflowing the cell
- [ ] Switch the list-switcher to a shared list while on the Calendar tab → confirm it shows that list's todos and respects the same view/edit permission as the list view

## 10. Cross-device / cross-tab sync

- [ ] Log into the same account in two separate browser windows
- [ ] Create a todo in window 1 → switch focus to window 2 → it should refetch and show the new todo (react-query's `refetchOnWindowFocus`) without a manual reload
- [ ] Complete a todo in window 1, switch to window 2, confirm it reflects there too

## 11. Input validation / error handling spot-checks

- [ ] Try creating a todo with an extremely long title (>500 chars) → should be rejected with a validation error, not silently truncated or a crash
- [ ] Try setting priority to something invalid via devtools/direct API call (not through the UI) → `400` with a clear validation message
- [ ] Stop the backend, try creating a todo from the UI → frontend shows a reasonable error state, not a silent hang or a blank crash
- [ ] Restart the backend, confirm the frontend recovers on the next action without needing a hard refresh

---

## If something fails

Most likely places to look first:
- **Auth weirdness** → check `backend/.env` has real (even if dev) values for `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, and that `FRONTEND_URL` exactly matches the frontend's actual origin (CORS + cookies are strict about this)
- **Push not arriving** → VAPID keys configured? Browser permission actually granted? Are you on `localhost` or HTTPS?
- **Sharing 404s unexpectedly** → double check the email you shared with actually has a registered account, and that the permission level matches what the action needs (view vs edit)
- **Recurrence looks wrong** → the logic itself is unit-tested (`backend/src/todos/recurrence/recurrence.util.spec.ts`) — if the *math* seems off, run `npm test` in `backend/` first to rule out an environment issue vs an actual logic bug

Once you've been through this, update `STATUS.md`'s "What's NOT verified" section to move whatever passed into "What's verified," and note anything that failed as a new entry under "Known gaps."
