# Todo App — Competitive Comparison

**Subject:** React/Vite/Tailwind todo list app (localStorage-based, client-only, GitHub Pages deployment)
**Compared against:** Todoist, TickTick, Microsoft To Do, Google Tasks, Any.do
**Prepared:** September 2026

---

## 1. What this app is today

A single-page React 18 + Vite app styled with Tailwind. All state lives in one 500-line `App.jsx` component and persists to the browser's `localStorage` — there is no backend, no account system, and no cross-device sync. Core capabilities: add/edit/delete todos, mark complete, assign a category (personal/work/shopping/other), a priority level, and a due date, plus client-side search, filter (all/completed/pending), and basic sorting.

This puts it in the "single-device personal checklist" category rather than the "cross-platform task management service" category that all five competitors below occupy.

## 2. Feature matrix

| Capability | **This app** | Todoist | TickTick | Microsoft To Do | Google Tasks | Any.do |
|---|---|---|---|---|---|---|
| Account / cloud sync | ❌ browser-local only | ✅ | ✅ | ✅ (Microsoft 365) | ✅ (Google account) | ✅ |
| Cross-device access | ❌ single browser | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projects / lists structure | ⚠️ 4 fixed categories | ✅ nested projects & sections | ✅ lists & folders | ✅ lists & groups | ✅ flat lists | ✅ lists |
| Priority levels | ✅ high/med/low | ✅ 4 levels | ✅ | ⚠️ "important" flag only | ❌ | ⚠️ basic |
| Due dates | ✅ date only | ✅ date + time, recurring | ✅ date + time, recurring | ✅ recurring | ✅ recurring | ✅ recurring |
| Push reminders/notifications | ❌ | ✅ (paid tiers) | ✅ native | ✅ native | ⚠️ via Calendar only, no native push | ✅ native (+location/WhatsApp on paid) |
| Recurring tasks | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subtasks / checklists | ❌ | ✅ nested | ✅ | ✅ ("steps") | ⚠️ single level | ⚠️ single level |
| Search | ✅ text match | ✅ + saved filters/labels | ✅ smart lists | ✅ | ⚠️ basic | ✅ |
| Sharing / collaboration | ❌ | ✅ shared projects, assignment, comments | ✅ shared lists (paid) | ✅ shared lists | ❌ | ✅ shared lists (paid) |
| Calendar view | ❌ | ⚠️ paywalled on most plans | ✅ built-in | ⚠️ via Outlook only | ✅ (it *is* Calendar's sidebar) | ✅ "My Day" planner |
| Habit tracking / Pomodoro | ❌ | ❌ | ✅ both, native | ❌ | ❌ | ❌ |
| Offline use | ✅ fully offline (no sync) | ✅ offline + sync | ✅ offline + sync | ✅ offline + sync | ⚠️ limited | ✅ offline + sync |
| Platforms | Web (any modern browser) | Web, iOS, Android, desktop, browser ext. | Web, iOS, Android, macOS, Windows, watch, ext. | Web, iOS, Android, Windows, Outlook | Web, Gmail sidebar, iOS, Android | Web, iOS, Android, macOS, Windows, ext. |
| Price | Free, open source | Free tier (capped ~5 projects); paid tiers roughly $4–7/mo individual, ~$6–10/user/mo team (confirm current pricing — figures vary by source/region) | Free tier; Premium roughly $28–36/yr (~$2.80–3/mo) | Completely free | Completely free | Free tier; Premium roughly $3–8/mo |

⚠️ = partial support. Pricing changes frequently — treat the figures above as directional, not quotes, and check each vendor's site before relying on them.

## 3. Where this app is competitive

- **Privacy and zero cost.** Nothing leaves the browser — no account, no server, no data collection. That's a genuine, defensible angle none of the five competitors fully offer (all require an account for sync).
- **Simplicity.** The add/edit/filter/sort flow is fast to learn and covers the 80% case (a flat personal list with categories and priority) without the paywalled complexity of Todoist or the feature sprawl of TickTick.
- **No lock-in.** Data sits in `localStorage` as plain JSON — trivial to export or migrate, unlike proprietary sync formats.

## 4. Where the gap is largest

- **No sync or multi-device access** is the single biggest functional gap — every competitor treats this as table stakes, and it's the main reason someone would open one of them over this app.
- **No reminders/notifications.** Due dates are stored but nothing alerts the user when they arrive; Todoist, TickTick, Microsoft To Do, and Any.do all push native reminders.
- **No recurring tasks or subtasks.** Both are near-universal in the competitive set and are common asks even in simple personal-productivity workflows (e.g., weekly chores, multi-step tasks).
- **No collaboration.** Fine for a personal tool, but rules out shared household/team use cases that Todoist, TickTick, Microsoft To Do, and Any.do all support.
- **Fixed category list.** The four categories are hardcoded; competitors allow arbitrary lists/projects/labels.

## 5. If this were to compete as a product, not a portfolio piece

**Tier 1 — closes the biggest functional gaps**
- Add a backend + account so todos sync across devices (this is the prerequisite for almost everything else)
- Browser/push notifications for due dates
- Recurring tasks
- Subtasks/checklist items

**Tier 2 — parity with mid-tier competitors**
- User-defined categories/labels instead of a fixed list
- Shareable lists (even read-only) for household/team use
- A calendar view of due dates
- Drag-and-drop reordering

**Tier 3 — differentiation, not just parity**
- Lean into the privacy angle: local-first with *optional* end-to-end-encrypted sync, rather than mandatory cloud accounts like every competitor above
- PWA packaging (installable, offline-first, works without the App/Play Store overhead of TickTick or Any.do)

## 6. Bottom line

As a learning/portfolio project, the app is a solid, clean implementation of CRUD + filtering patterns in React. As a competitor to Todoist, TickTick, Microsoft To Do, Google Tasks, or Any.do, it currently sits well below all of them on functionality — it lacks the one feature every single competitor treats as baseline (sync across devices) and the one feature most treat as baseline (reminders). Its most credible competitive angle is privacy/no-account-required simplicity, which is worth leaning into deliberately rather than trying to out-feature apps like TickTick.

*A separate code-level audit (bugs, architecture, accessibility, security) was covered in the chat response and isn't duplicated here.*
