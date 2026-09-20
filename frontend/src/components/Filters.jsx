import { useEffect, useState } from 'react';

export default function Filters({ filters, onChange }) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce the free-text search so every keystroke doesn't fire a request
  // — the fixed 4-category client-only filter in v1 didn't need this, but a
  // server-backed search does.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) onChange({ ...filters, search: searchInput });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className="bg-white rounded-lg shadow p-3 flex flex-wrap gap-2 items-center">
      <input
        type="text"
        placeholder="Search todos…"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="border rounded px-3 py-1.5 flex-1 min-w-[160px]"
      />
      <select
        value={filters.completed}
        onChange={(e) => onChange({ ...filters, completed: e.target.value })}
        className="border rounded px-2 py-1.5"
      >
        <option value="">All</option>
        <option value="false">Pending</option>
        <option value="true">Completed</option>
      </select>
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="border rounded px-2 py-1.5"
      >
        <option value="">Any priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        value={`${filters.sortBy}:${filters.sortDir}`}
        onChange={(e) => {
          const [sortBy, sortDir] = e.target.value.split(':');
          onChange({ ...filters, sortBy, sortDir });
        }}
        className="border rounded px-2 py-1.5"
      >
        <option value="order:asc">Manual order (drag to reorder)</option>
        <option value="createdAt:desc">Newest first</option>
        <option value="createdAt:asc">Oldest first</option>
        <option value="dueDate:asc">Due date ↑</option>
        <option value="dueDate:desc">Due date ↓</option>
      </select>
    </div>
  );
}
