import { useEffect, useState } from 'react';
import { disablePushNotifications, enablePushNotifications, isPushSupported } from '../push/push';

export default function PushToggle() {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      setEnabled(Boolean(sub));
    });
  }, []);

  if (!isPushSupported()) return null;

  const toggle = async () => {
    setBusy(true);
    setError('');
    try {
      if (enabled) {
        await disablePushNotifications();
        setEnabled(false);
      } else {
        await enablePushNotifications();
        setEnabled(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        className={`text-sm px-3 py-1.5 rounded border ${
          enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600'
        }`}
      >
        {enabled ? 'Reminders on' : 'Enable reminders'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
