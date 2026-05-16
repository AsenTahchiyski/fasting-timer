import { useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ColorSwatch } from '../components/ColorSwatch';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import { Segmented } from '../components/Segmented';
import { TimezonePicker } from '../components/TimezonePicker';
import { db, updateSettings } from '../db/db';
import type {
  ExportPayload,
  FastSession,
  HourFormat,
  Settings,
  ThemeMode
} from '../db/types';

interface Props {
  settings: Settings;
  sessions: FastSession[];
}

export function SettingsScreen({ settings, sessions }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState<{
    payload: ExportPayload;
  } | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const set = (patch: Partial<Settings>) => updateSettings(patch);

  const handleExport = () => {
    const payload: ExportPayload = {
      version: 1,
      exportedAt: Date.now(),
      settings,
      sessions
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    a.download = `fasting-timer-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    flash('Exported');
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<ExportPayload>;
      if (parsed.version !== 1 || !parsed.settings || !Array.isArray(parsed.sessions)) {
        flash('Not a valid export file');
        return;
      }
      setImportOpen({ payload: parsed as ExportPayload });
    } catch {
      flash('Could not read that file');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const applyImport = async (mode: 'merge' | 'replace') => {
    if (!importOpen) return;
    const payload = importOpen.payload;
    await db.transaction('rw', db.settings, db.sessions, async () => {
      if (mode === 'replace') {
        await db.sessions.clear();
      }
      const importedSettings: Settings = {
        ...payload.settings,
        id: 'default',
        updatedAt: Date.now()
      };
      await db.settings.put(importedSettings);
      for (const s of payload.sessions) {
        const { id: _id, ...rest } = s;
        void _id;
        await db.sessions.add(rest);
      }
    });
    setImportOpen(null);
    flash(mode === 'replace' ? 'Imported (replaced)' : 'Imported (merged)');
  };

  const handleClearHistory = async () => {
    await db.sessions.clear();
    setClearOpen(false);
    flash('History cleared');
  };

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="app-shell">
      <div className="max-w-md mx-auto p-5 pt-6 grid gap-5">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-ink-dim mt-1">
            Everything is stored on this device.
          </p>
        </header>

        <section className="grid gap-4 rounded-2xl border border-line bg-surface-2 p-5">
          <Field label="Your name">
            <input
              type="text"
              value={settings.name}
              onChange={(e) => set({ name: e.target.value })}
              className="w-full h-12 px-3 rounded-xl border border-line bg-surface"
            />
          </Field>

          <Field label="Accent color">
            <ColorSwatch
              value={settings.accentColor}
              onChange={(hex) => set({ accentColor: hex })}
            />
          </Field>

          <Field label="Theme">
            <Segmented
              id="set-theme"
              ariaLabel="Theme"
              value={settings.themeMode}
              onChange={(v: ThemeMode) => set({ themeMode: v })}
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' }
              ]}
            />
          </Field>
        </section>

        <section className="grid gap-4 rounded-2xl border border-line bg-surface-2 p-5">
          <Field label="Timezone">
            <TimezonePicker
              value={settings.timezone}
              onChange={(tz) => set({ timezone: tz })}
            />
          </Field>

          <Field label="Hour format">
            <Segmented
              id="set-hour"
              ariaLabel="Hour format"
              value={settings.hourFormat}
              onChange={(v: HourFormat) => set({ hourFormat: v })}
              options={[
                { value: '24h', label: '24-hour' },
                { value: '12h', label: '12-hour' }
              ]}
            />
          </Field>

          <Field label="Default fasting target (hours)" hint="Used for new fasts. Existing fasts keep their original goal.">
            <input
              type="number"
              min={1}
              max={120}
              value={settings.targetHours}
              onChange={(e) =>
                set({
                  targetHours: Math.max(
                    1,
                    Math.min(120, Number(e.target.value) || 0)
                  )
                })
              }
              className="w-full h-12 px-3 rounded-xl border border-line bg-surface"
            />
          </Field>
        </section>

        <section className="grid gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <div>
            <h2 className="font-semibold tracking-tight">Data</h2>
            <p className="text-sm text-ink-dim mt-1">
              Export a backup or move your data to another device.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleExport}>
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              Import JSON
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <Button
            variant="danger"
            onClick={() => setClearOpen(true)}
          >
            Clear all history
          </Button>
        </section>

        <p className="text-xs text-ink-dim text-center">
          Fasting Timer · {sessions.length} record
          {sessions.length === 1 ? '' : 's'}
        </p>
      </div>

      <Modal
        open={!!importOpen}
        onClose={() => setImportOpen(null)}
        title="Import data"
      >
        <div className="grid gap-3">
          <p className="text-sm text-ink-dim">
            {importOpen?.payload.sessions.length} fast
            {importOpen?.payload.sessions.length === 1 ? '' : 's'} found in
            this file. Settings will be overwritten with the imported values.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => applyImport('merge')}>
              Merge into current
            </Button>
            <Button variant="danger" onClick={() => applyImport('replace')}>
              Replace existing
            </Button>
          </div>
          <Button variant="outline" onClick={() => setImportOpen(null)}>
            Cancel
          </Button>
        </div>
      </Modal>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear all history?"
      >
        <div className="grid gap-3">
          <p className="text-sm text-ink-dim">
            This permanently deletes every recorded fast. Your settings are kept.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearHistory}>
              Delete everything
            </Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 rounded-full bg-ink text-surface px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
