import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-64 text-slate-500">Loading…</div>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
