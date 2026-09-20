import { useState } from 'react';
import { useCreateTodo } from '../hooks/useTodos';
import { useListContext } from '../list/ListContext';
import RecurrenceFields from './RecurrenceFields';

const EMPTY_FORM = {
  title: '',
  notes: '',
  category: 'general',
  priority: 'medium',
  dueDate: '',
  reminderAt: '',
  recurrence: null,
};

export default function TodoForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const { ownerId, canEdit } = useListContext();
  const createTodo = useCreateTodo(ownerId);

  if (!canEdit) {
    return <p className="bg-white rounded-lg shadow p-4 text-sm text-slate-400">You have view-only access to this list.</p>;
  }

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (title.length < 3) {
      setError('Title needs to be at least 3 characters.');
      return;
    }
    setError('');

    const payload = {
      title,
      notes: form.notes.trim() || undefined,
      category: form.category.trim() || 'general',
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      reminderAt: form.reminderAt ? new Date(form.reminderAt).toISOString() : undefined,
      recurrence: form.recurrence
        ? {
            ...form.recurrence,
            endDate: form.recurrence.endDate ? new Date(form.recurrence.endDate).toISOString() : undefined,
          }
        : undefined,
    };

    try {
      await createTodo.mutateAsync(payload);
      setForm(EMPTY_FORM);
      setExpanded(false);
    } catch (err) {
      setError(err.message || 'Could not create todo');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a new todo…"
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
          onFocus={() => setExpanded(true)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" disabled={createTodo.isPending} className="bg-slate-700 text-white px-4 rounded hover:bg-slate-800">
          Add
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {expanded && (
        <div className="flex flex-col gap-3 border-t pt-3">
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => update({ notes: e.target.value })}
            className="border rounded px-3 py-2"
            rows={2}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={(e) => update({ category: e.target.value })}
              className="border rounded px-2 py-1.5"
            />
            <select
              value={form.priority}
              onChange={(e) => update({ priority: e.target.value })}
              className="border rounded px-2 py-1.5"
            >
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
            <label className="flex flex-col text-xs text-slate-500">
              Due date
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => update({ dueDate: e.target.value })}
                className="border rounded px-2 py-1.5 text-sm text-slate-800"
              />
            </label>
            <label className="flex flex-col text-xs text-slate-500">
              Remind me at
              <input
                type="datetime-local"
                value={form.reminderAt}
                onChange={(e) => update({ reminderAt: e.target.value })}
                className="border rounded px-2 py-1.5 text-sm text-slate-800"
              />
            </label>
          </div>

          <RecurrenceFields recurrence={form.recurrence} onChange={(recurrence) => update({ recurrence })} />
        </div>
      )}
    </form>
  );
}
