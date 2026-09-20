import { useState } from 'react';
import Filters from '../components/Filters';
import PushToggle from '../components/PushToggle';
import StatsBar from '../components/StatsBar';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import { useListContext } from '../list/ListContext';
import { useTodosQuery } from '../hooks/useTodos';

const DEFAULT_FILTERS = {
  search: '',
  completed: '',
  priority: '',
  sortBy: 'order',
  sortDir: 'asc',
};

export default function TodoDashboard() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { ownerId } = useListContext();
  const { data, isLoading, error } = useTodosQuery(filters, ownerId);

  return (
    <>
      <div className="flex justify-between items-center">
        <StatsBar />
        <PushToggle />
      </div>
      <TodoForm />
      <Filters filters={filters} onChange={setFilters} />
      <TodoList
        todos={data?.items ?? []}
        isLoading={isLoading}
        error={error}
        enableDragDrop={filters.sortBy === 'order'}
      />
    </>
  );
}
