const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecurrenceFields({ recurrence, onChange }) {
  const enabled = recurrence !== null;

  const update = (patch) => onChange({ ...recurrence, ...patch });

  const toggleWeekday = (day) => {
    const current = recurrence.daysOfWeek || [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort();
    update({ daysOfWeek: next });
  };

  return (
    <div className="border rounded p-3 bg-slate-50">
      <label className="flex items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked ? { frequency: 'daily', interval: 1 } : null)}
        />
        Repeat this todo
      </label>

      {enabled && (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span>Every</span>
            <input
              type="number"
              min={1}
              max={365}
              value={recurrence.interval}
              onChange={(e) => update({ interval: Number(e.target.value) || 1 })}
              className="border rounded px-2 py-1 w-16"
            />
            <select
              value={recurrence.frequency}
              onChange={(e) => update({ frequency: e.target.value, daysOfWeek: undefined })}
              className="border rounded px-2 py-1"
            >
              <option value="daily">day(s)</option>
              <option value="weekly">week(s)</option>
              <option value="monthly">month(s)</option>
            </select>
          </div>

          {recurrence.frequency === 'weekly' && (
            <div className="flex gap-1 flex-wrap">
              {WEEKDAYS.map((label, day) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => toggleWeekday(day)}
                  className={`px-2 py-1 rounded text-xs border ${
                    (recurrence.daysOfWeek || []).includes(day)
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-slate-600">
            Ends on (optional)
            <input
              type="date"
              value={recurrence.endDate || ''}
              onChange={(e) => update({ endDate: e.target.value || undefined })}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>
      )}
    </div>
  );
}
