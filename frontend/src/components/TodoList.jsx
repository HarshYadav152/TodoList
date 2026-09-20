import { useState } from 'react'
import { useReorderTodo } from '../hooks/useTodos'
import { useListContext } from '../list/ListContext'
import TodoItem from './TodoItem'

export default function TodoList({ todos, isLoading, error, enableDragDrop }) {
  const { ownerId, canEdit } = useListContext()
  const reorderTodo = useReorderTodo(ownerId)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  if (isLoading) {
    return <p className="text-center text-slate-400 py-8">Loading todos…</p>
  }
  if (error) {
    return <p className="text-center text-red-500 py-8">Couldn&apos;t load todos: {error.message}</p>
  }
  if (todos.length === 0) {
    return <p className="text-center text-slate-400 py-8">No todos match your filters.</p>
  }

  const canDrag = enableDragDrop && canEdit

  const handleDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const fromIndex = todos.findIndex((t) => t._id === draggedId)
    const toIndex = todos.findIndex((t) => t._id === targetId)
    if (fromIndex === -1 || toIndex === -1) return

    // "Drop onto target" means: land immediately before the target,
    // pushing it (and everything after it) forward by one. After removing
    // the dragged item, the target's own index shifts left by one if it
    // was originally *after* the dragged item's position.
    const reordered = [...todos]
    const [moved] = reordered.splice(fromIndex, 1)
    const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex
    reordered.splice(insertAt, 0, moved)

    const movedIndex = reordered.findIndex((t) => t._id === draggedId)
    const prevId = reordered[movedIndex - 1]?._id
    const nextId = reordered[movedIndex + 1]?._id

    reorderTodo.mutate({ id: draggedId, prevId, nextId })
    setDraggedId(null)
    setDragOverId(null)
  }

  return (
    <ul className="flex flex-col gap-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo._id}
          todo={todo}
          isDragTarget={canDrag && dragOverId === todo._id && draggedId !== todo._id}
          dragHandlers={
            canDrag
              ? {
                  onDragStart: () => setDraggedId(todo._id),
                  onDragOver: (e) => {
                    e.preventDefault()
                    if (dragOverId !== todo._id) setDragOverId(todo._id)
                  },
                  onDrop: (e) => {
                    e.preventDefault()
                    handleDrop(todo._id)
                  },
                  onDragEnd: () => {
                    setDraggedId(null)
                    setDragOverId(null)
                  },
                }
              : undefined
          }
        />
      ))}
    </ul>
  )
}
