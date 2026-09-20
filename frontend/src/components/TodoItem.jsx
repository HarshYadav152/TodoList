import { useState } from 'react';
import { FaEdit, FaGripVertical, FaSave, FaTrash } from 'react-icons/fa';
import { useDeleteTodo, useUpdateTodo } from '../hooks/useTodos';
import { useListContext } from '../list/ListContext';
import ConfirmDialog from './ConfirmDialog';
import RecurrenceFields from './RecurrenceFields';
import SubtaskList from './SubtaskList';

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function toDateInputValue(iso) {
  return iso ? iso.slice(0, 10) : '';
}
function toDateTimeInputValue(iso) {
  return iso ? iso.slice(0, 16) : '';
}

export default function TodoItem({ todo, dragHandlers, isDragTarget }) {
  // Local to this exact card. Editing one todo can never bleed into another
  // todo's fields or into the "add new" form — each TodoItem owns its edit
  // state independently, which is what actually fixes the v1 bug rather
  // than just patching around it.
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState(() => toDraft(todo));

  const { ownerId, canEdit } = useListContext();
  const updateTodo = useUpdateTodo(ownerId);
  const deleteTodo = useDeleteTodo(ownerId);

  const startEditing = () => {
    setDraft(toDraft(todo));
    setIsEditing(true);
  };

  const saveEdits = async () => {
    await updateTodo.mutateAsync({
      id: todo._id,
      payload: {
        title: draft.title.trim(),
        notes: draft.notes.trim() || undefined,
        category: draft.category.trim() || 'general',
        priority: draft.priority,
        dueDate: draft.dueDate ? new Date(draft.dueDate).toISOString() : undefined,
        reminderAt: draft.reminderAt ? new Date(draft.reminderAt).toISOString() : undefined,
        recurrence: draft.recurrence
          ? {
              ...draft.recurrence,
              endDate: draft.recurrence.endDate ? new Date(draft.recurrence.endDate).toISOString() : undefined,
            }
          : undefined,
      },
    });
    setIsEditing(false);
  };

  const toggleComplete = () => {
    updateTodo.mutate({ id: todo._id, payload: { isCompleted: !todo.isCompleted } });
  };

  if (isEditing) {
    return (
      <li className="bg-white rounded-lg shadow p-4 flex flex-col gap-3 border-2 border-slate-300">
        <input
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className="border rounded px-2 py-1.5 font-medium"
        />
        <textarea
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          placeholder="Notes"
          rows={2}
          className="border rounded px-2 py-1.5 text-sm"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <input
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className="border rounded px-2 py-1.5 text-sm"
          />
          <select
            value={draft.priority}
            onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}
            className="border rounded px-2 py-1.5 text-sm"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            value={draft.dueDate}
            onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
            className="border rounded px-2 py-1.5 text-sm"
          />
          <input
            type="datetime-local"
            value={draft.reminderAt}
            onChange={(e) => setDraft((d) => ({ ...d, reminderAt: e.target.value }))}
            className="border rounded px-2 py-1.5 text-sm"
          />
        </div>
        <RecurrenceFields
          recurrence={draft.recurrence}
          onChange={(recurrence) => setDraft((d) => ({ ...d, recurrence }))}
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded border hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={saveEdits}
            disabled={updateTodo.isPending}
            className="px-3 py-1.5 rounded bg-slate-700 text-white flex items-center gap-1.5 hover:bg-slate-800"
          >
            <FaSave size={12} /> Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`bg-white rounded-lg shadow p-4 ${isDragTarget ? 'ring-2 ring-slate-400' : ''}`}
      draggable={canEdit && Boolean(dragHandlers)}
      onDragStart={dragHandlers?.onDragStart}
      onDragOver={dragHandlers?.onDragOver}
      onDrop={dragHandlers?.onDrop}
      onDragEnd={dragHandlers?.onDragEnd}
    >
      <div className="flex items-start gap-3">
        {canEdit && dragHandlers && (
          <span className="mt-1 text-slate-300 cursor-grab" aria-hidden="true">
            <FaGripVertical size={12} />
          </span>
        )}
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={toggleComplete}
          disabled={!canEdit}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <p className={`font-medium break-words ${todo.isCompleted ? 'line-through text-slate-400' : ''}`}>
            {todo.title}
          </p>
          {todo.notes && <p className="text-sm text-slate-500 mt-0.5">{todo.notes}</p>}

          <div className="flex flex-wrap gap-1.5 mt-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[todo.priority]}`}>
              {todo.priority}
            </span>
            <span className="px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
              {todo.category}
            </span>
            {todo.dueDate && (
              <span className="px-2 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                Due {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
            {todo.reminderAt && (
              <span className="px-2 py-0.5 rounded-full border bg-purple-50 text-purple-600 border-purple-200">
                Reminds {new Date(todo.reminderAt).toLocaleString()}
              </span>
            )}
            {todo.recurrence && (
              <span className="px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                Repeats every {todo.recurrence.interval > 1 ? todo.recurrence.interval : ''} {todo.recurrence.frequency}
              </span>
            )}
          </div>

          <SubtaskList todo={todo} />
        </div>

        {canEdit && (
          <div className="flex gap-2 shrink-0">
            <button aria-label="Edit todo" onClick={startEditing} className="text-slate-400 hover:text-slate-700">
              <FaEdit />
            </button>
            <button
              aria-label="Delete todo"
              onClick={() => setConfirmingDelete(true)}
              className="text-slate-400 hover:text-red-500"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this todo?"
        message={`"${todo.title}" will be permanently deleted.`}
        onConfirm={() => {
          deleteTodo.mutate(todo._id);
          setConfirmingDelete(false);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  );
}

function toDraft(todo) {
  return {
    title: todo.title,
    notes: todo.notes || '',
    category: todo.category,
    priority: todo.priority,
    dueDate: toDateInputValue(todo.dueDate),
    reminderAt: toDateTimeInputValue(todo.reminderAt),
    recurrence: todo.recurrence
      ? { ...todo.recurrence, endDate: todo.recurrence.endDate ? toDateInputValue(todo.recurrence.endDate) : undefined }
      : null,
  };
}
