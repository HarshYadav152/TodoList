import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import ListSwitcher from '../components/ListSwitcher';
import Navbar from '../components/Navbar';
import ShareModal from '../components/ShareModal';
import { ListProvider } from '../list/ListContext';

const tabClass = ({ isActive }) => `px-3 py-1.5 rounded text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-200'}`;

export default function AppShell() {
  const [selectedList, setSelectedList] = useState({ ownerId: null, ownerEmail: null, permission: 'edit' });
  const [shareOpen, setShareOpen] = useState(false);
  const isOwnList = selectedList.ownerId === null;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav className="flex gap-1 bg-slate-100 rounded p-1">
            <NavLink to="/" end className={tabClass}>
              List
            </NavLink>
            <NavLink to="/calendar" className={tabClass}>
              Calendar
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <ListSwitcher ownerId={selectedList.ownerId} onChange={setSelectedList} />
            {isOwnList && (
              <button
                onClick={() => setShareOpen(true)}
                className="text-sm px-3 py-1.5 rounded border bg-white hover:bg-slate-50"
              >
                Share
              </button>
            )}
          </div>
        </div>

        <ListProvider
          ownerId={selectedList.ownerId}
          ownerEmail={selectedList.ownerEmail}
          permission={selectedList.permission}
        >
          <Outlet />
        </ListProvider>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
