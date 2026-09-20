import { useMemo, useState } from 'react';
import { useTodosQuery, useUpdateTodo } from '../hooks/useTodos';
import { useListContext } from '../list/ListContext';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PRIORITY_DOT = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-emerald-500' };

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Builds the full 6-week grid (including padding days from adjacent
 * months) so every month renders as a consistent rectangle. */
function buildMonthGrid(monthStart) {
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return date;
  });
}

export default function CalendarView() {
  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()));
  const { ownerId, canEdit } = useListContext();
  const updateTodo = useUpdateTodo(ownerId);

  const grid = useMemo(() => buildMonthGrid(monthStart), [monthStart]);
  const rangeStart = grid[0];
  const rangeEnd = grid[grid.length - 1];

  const { data, isLoading } = useTodosQuery(
    {
      dueFrom: rangeStart.toISOString(),
      dueTo: rangeEnd.toISOString(),
      sortBy: 'dueDate',
      sortDir: 'asc',
      limit: 200,
    },
    ownerId,
  );

  const todosByDay = useMemo(() => {
    const map = {};
    (data?.items ?? []).forEach((todo) => {
      if (!todo.dueDate) return;
      const key = todo.dueDate.slice(0, 10);
      (map[key] ??= []).push(todo);
    });
    return map;
  }, [data]);

  const changeMonth = (delta) => {
    setMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const today = toDateKey(new Date());

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => changeMonth(-1)} className="px-2 py-1 rounded hover:bg-slate-100" aria-label="Previous month">
          ←
        </button>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">
            {monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => setMonthStart(startOfMonth(new Date()))}
            className="text-xs px-2 py-1 rounded border hover:bg-slate-50"
          >
            Today
          </button>
        </div>
        <button onClick={() => changeMonth(1)} className="px-2 py-1 rounded hover:bg-slate-100" aria-label="Next month">
          →
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-slate-400 py-8">Loading…</p>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded overflow-hidden text-xs">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="bg-slate-50 text-slate-500 text-center py-1 font-medium">
              {label}
            </div>
          ))}
          {grid.map((date) => {
            const key = toDateKey(date);
            const inMonth = date.getMonth() === monthStart.getMonth();
            const dayTodos = todosByDay[key] ?? [];

            return (
              <div key={key} className={`bg-white min-h-[84px] p-1 ${inMonth ? '' : 'bg-slate-50'}`}>
                <span className={`${key === today ? 'font-bold text-slate-800' : inMonth ? 'text-slate-500' : 'text-slate-300'}`}>
                  {date.getDate()}
                </span>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {dayTodos.slice(0, 3).map((todo) => (
                    <li key={todo._id}>
                      <button
                        disabled={!canEdit}
                        onClick={() => updateTodo.mutate({ id: todo._id, payload: { isCompleted: !todo.isCompleted } })}
                        className={`w-full text-left flex items-center gap-1 truncate px-1 py-0.5 rounded ${
                          todo.isCompleted ? 'text-slate-300 line-through' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                        title={todo.title}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[todo.priority]}`} />
                        {todo.title}
                      </button>
                    </li>
                  ))}
                  {dayTodos.length > 3 && <li className="text-slate-400 px-1">+{dayTodos.length - 3} more</li>}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
