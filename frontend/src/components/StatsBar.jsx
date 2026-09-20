import { useTodoStats } from '../hooks/useTodos';
import { useListContext } from '../list/ListContext';

export default function StatsBar() {
  const { ownerId } = useListContext();
  const { pending, completed, isLoading } = useTodoStats(ownerId);

  if (isLoading) return null;

  const total = (pending ?? 0) + (completed ?? 0);

  return (
    <div className="flex gap-4 text-sm text-slate-500">
      <span>{total} total</span>
      <span>{pending} pending</span>
      <span>{completed} done</span>
    </div>
  );
}
