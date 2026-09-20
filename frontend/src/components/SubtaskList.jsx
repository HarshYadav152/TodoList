import { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useAddSubtask, useDeleteSubtask, useUpdateSubtask } from '../hooks/useTodos';
import { useListContext } from '../list/ListContext';

export default function SubtaskList({ todo }) {
  const [newTitle, setNewTitle] = useState('');
  const { ownerId, canEdit } = useListContext();
  const addSubtask = useAddSubtask(ownerId);
  const updateSubtask = useUpdateSubtask(ownerId);
  const deleteSubtask = useDeleteSubtask(ownerId);

  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    await addSubtask.mutateAsync({ todoId: todo._id, title });
    setNewTitle('');
  };

  const doneCount = todo.subtasks.filter((s) => s.isCompleted).length;

  if (todo.subtasks.length === 0 && !canEdit) return null;

  return (
    <div className="mt-2 pl-6 border-l-2 border-slate-100">
      {todo.subtasks.length > 0 && (
        <p className="text-xs text-slate-400 mb-1">
          {doneCount}/{todo.subtasks.length} done
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {todo.subtasks.map((subtask) => (
          <li key={subtask._id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={subtask.isCompleted}
              disabled={!canEdit}
              onChange={(e) =>
                updateSubtask.mutate({
                  todoId: todo._id,
                  subtaskId: subtask._id,
                  payload: { isCompleted: e.target.checked },
                })
              }
            />
            <span className={subtask.isCompleted ? 'line-through text-slate-400' : ''}>{subtask.title}</span>
            {canEdit && (
              <button
                type="button"
                aria-label={`Delete subtask ${subtask.title}`}
                onClick={() => deleteSubtask.mutate({ todoId: todo._id, subtaskId: subtask._id })}
                className="text-slate-300 hover:text-red-500 ml-auto"
              >
                <FaTrash size={11} />
              </button>
            )}
          </li>
        ))}
      </ul>
      {canEdit && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 mt-1">
          <input
            type="text"
            placeholder="Add subtask…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="text-sm border-b border-dashed border-slate-300 focus:outline-none focus:border-slate-500 flex-1 py-0.5"
          />
          <button type="submit" aria-label="Add subtask" className="text-slate-400 hover:text-slate-700">
            <FaPlus size={11} />
          </button>
        </form>
      )}
    </div>
  );
}
