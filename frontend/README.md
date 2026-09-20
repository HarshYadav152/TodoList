# Todolist frontend

React (Vite) frontend for the Todolist app. See the root [README.md](../README.md)
for the full picture. This file is just the frontend-specific bits.

## Run locally

Needs the backend running first (see `../backend/README.md`).

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

## Structure

```
src/
  api/          fetch client (token attach + refresh-on-401 retry), todos/auth/shares API calls
  auth/         AuthContext, ProtectedRoute, Login/Register pages
  list/         ListContext — tracks which list (own or shared) is being viewed and whether you can edit it
  components/   TodoForm, TodoItem, TodoList (incl. drag-and-drop), SubtaskList, RecurrenceFields,
                Filters, StatsBar, PushToggle, ConfirmDialog, Navbar, ListSwitcher, ShareModal
  hooks/        react-query hooks for todos/subtasks/shares CRUD (incl. optimistic reorder)
  pages/        AppShell (layout + list-switching state), TodoDashboard, CalendarView
  push/         Web Push registration helpers
public/
  sw.js         service worker — displays push notifications, handles clicks
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |

## Notes

- Auth tokens: the access token lives in memory only (not `localStorage`),
  refreshed silently on load via the httpOnly refresh cookie. This means a
  hard refresh briefly shows a loading state while that silent refresh runs.
- Push notifications need the backend's VAPID keys configured — see the
  backend README — and only work over HTTPS or `localhost`.
- Drag-and-drop reordering uses the native HTML5 DnD API, which has no
  built-in touch support — reordering currently needs a mouse/trackpad,
  not a touchscreen.
