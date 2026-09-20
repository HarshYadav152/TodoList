import { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useCreateShare, useMyShares, useRevokeShare } from '../hooks/useShares';

export default function ShareModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [error, setError] = useState('');

  const { data: myShares = [] } = useMyShares();
  const createShare = useCreateShare();
  const revokeShare = useRevokeShare();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createShare.mutateAsync({ email, permission });
      setEmail('');
    } catch (err) {
      setError(err.message || 'Could not share list');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share your todo list"
        className="bg-white rounded-lg shadow-lg p-6 w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-3">Share your list</h2>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="email"
            required
            placeholder="Their email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-2 py-1.5 flex-1 text-sm"
          />
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm"
          >
            <option value="view">Can view</option>
            <option value="edit">Can edit</option>
          </select>
          <button type="submit" className="bg-slate-700 text-white px-3 rounded text-sm hover:bg-slate-800">
            Share
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {myShares.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 uppercase mb-1">Shared with</p>
            <ul className="flex flex-col gap-1.5">
              {myShares.map((share) => (
                <li key={share._id} className="flex items-center justify-between text-sm bg-slate-50 rounded px-2 py-1.5">
                  <span>
                    {share.sharedWithUser.email} <span className="text-slate-400">· {share.permission}</span>
                  </span>
                  <button
                    aria-label={`Revoke access for ${share.sharedWithUser.email}`}
                    onClick={() => revokeShare.mutate(share._id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <FaTrash size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-3 py-1.5 rounded border hover:bg-slate-50 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
