import { useMemo, useState } from 'react';
import { Modal } from './Modal';
import { cityFromTimezone, listTimezones } from '../lib/time';

interface Props {
  value: string;
  onChange: (tz: string) => void;
}

export function TimezonePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const all = useMemo(() => listTimezones(), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (tz) =>
        tz.toLowerCase().includes(q) ||
        cityFromTimezone(tz).toLowerCase().includes(q)
    );
  }, [all, query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-12 px-3 rounded-xl border border-line bg-surface text-left flex items-center justify-between"
      >
        <span>
          <span className="block text-sm text-ink-dim">
            {value}
          </span>
          <span className="block text-base font-medium">
            {cityFromTimezone(value)}
          </span>
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-dim">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Timezone">
        <div className="grid gap-3">
          <input
            type="text"
            placeholder="Search city or zone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-line bg-surface"
            autoFocus
          />
          <div className="max-h-72 overflow-y-auto rounded-xl border border-line divide-y divide-line">
            {filtered.length === 0 && (
              <div className="p-4 text-sm text-ink-dim">No matches.</div>
            )}
            {filtered.slice(0, 200).map((tz) => (
              <button
                key={tz}
                type="button"
                onClick={() => {
                  onChange(tz);
                  setOpen(false);
                }}
                className={
                  'w-full text-left px-3 py-2.5 hover:bg-[rgb(var(--accent)/0.08)] ' +
                  (tz === value ? 'bg-[rgb(var(--accent)/0.12)]' : '')
                }
              >
                <div className="text-sm font-medium">
                  {cityFromTimezone(tz)}
                </div>
                <div className="text-xs text-ink-dim">{tz}</div>
              </button>
            ))}
            {filtered.length > 200 && (
              <div className="p-3 text-xs text-ink-dim">
                Showing first 200. Refine to narrow down.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
