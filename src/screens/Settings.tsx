import { useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ColorSwatch } from '../components/ColorSwatch';
import { Field } from '../components/Field';
import { LanguagePicker } from '../components/LanguagePicker';
import { Modal } from '../components/Modal';
import { Segmented } from '../components/Segmented';
import { TimezonePicker } from '../components/TimezonePicker';
import { db, updateSettings } from '../db/db';
import type {
  ExportPayload,
  FastSession,
  HourFormat,
  Language,
  Settings,
  ThemeMode
} from '../db/types';
import { useT } from '../lib/i18n';

interface Props {
  settings: Settings;
  sessions: FastSession[];
}

export function SettingsScreen({ settings, sessions }: Props) {
  const t = useT();
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
    flash(t('settings.toast.exported'));
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<ExportPayload>;
      if (parsed.version !== 1 || !parsed.settings || !Array.isArray(parsed.sessions)) {
        flash(t('settings.toast.invalid'));
        return;
      }
      setImportOpen({ payload: parsed as ExportPayload });
    } catch {
      flash(t('settings.toast.unreadable'));
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
    flash(
      mode === 'replace'
        ? t('settings.toast.importedReplace')
        : t('settings.toast.importedMerge')
    );
  };

  const handleClearHistory = async () => {
    await db.sessions.clear();
    setClearOpen(false);
    flash(t('settings.toast.cleared'));
  };

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const importCount = importOpen?.payload.sessions.length ?? 0;

  return (
    <div className="app-shell">
      <div className="max-w-md mx-auto p-5 pt-6 grid gap-5">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="text-sm text-ink-dim mt-1">{t('settings.subtitle')}</p>
        </header>

        <section className="grid gap-4 rounded-2xl border border-line bg-surface-2 p-5">
          <Field label={t('settings.language')}>
            <LanguagePicker
              value={settings.language ?? 'bg'}
              onChange={(lang: Language) => set({ language: lang })}
            />
          </Field>

          <Field label={t('settings.name')}>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => set({ name: e.target.value })}
              className="w-full h-12 px-3 rounded-xl border border-line bg-surface"
            />
          </Field>

          <Field label={t('settings.accent')}>
            <ColorSwatch
              value={settings.accentColor}
              onChange={(hex) => set({ accentColor: hex })}
            />
          </Field>

          <Field label={t('settings.theme')}>
            <Segmented
              id="set-theme"
              ariaLabel={t('settings.theme')}
              value={settings.themeMode}
              onChange={(v: ThemeMode) => set({ themeMode: v })}
              options={[
                { value: 'system', label: t('common.theme.system') },
                { value: 'light', label: t('common.theme.light') },
                { value: 'dark', label: t('common.theme.dark') }
              ]}
            />
          </Field>
        </section>

        <section className="grid gap-4 rounded-2xl border border-line bg-surface-2 p-5">
          <Field label={t('settings.timezone')}>
            <TimezonePicker
              value={settings.timezone}
              onChange={(tz) => set({ timezone: tz })}
            />
          </Field>

          <Field label={t('settings.hourFormat')}>
            <Segmented
              id="set-hour"
              ariaLabel={t('settings.hourFormat')}
              value={settings.hourFormat}
              onChange={(v: HourFormat) => set({ hourFormat: v })}
              options={[
                { value: '24h', label: t('common.hour.24h') },
                { value: '12h', label: t('common.hour.12h') }
              ]}
            />
          </Field>

          <Field
            label={t('settings.target')}
            hint={t('settings.targetHint')}
          >
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
            <h2 className="font-semibold tracking-tight">{t('settings.data')}</h2>
            <p className="text-sm text-ink-dim mt-1">{t('settings.dataSub')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleExport}>
              {t('settings.export')}
            </Button>
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              {t('settings.import')}
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
            {t('settings.clearHistory')}
          </Button>
        </section>

        <p className="text-xs text-ink-dim text-center">
          {sessions.length === 1
            ? t('settings.footerOne')
            : t('settings.footerMany', { count: sessions.length })}
        </p>
      </div>

      <Modal
        open={!!importOpen}
        onClose={() => setImportOpen(null)}
        title={t('settings.import.title')}
      >
        <div className="grid gap-3">
          <p className="text-sm text-ink-dim">
            {importCount === 1
              ? t('settings.import.subOne')
              : t('settings.import.subMany', { count: importCount })}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => applyImport('merge')}>
              {t('settings.import.merge')}
            </Button>
            <Button variant="danger" onClick={() => applyImport('replace')}>
              {t('settings.import.replace')}
            </Button>
          </div>
          <Button variant="outline" onClick={() => setImportOpen(null)}>
            {t('common.cancel')}
          </Button>
        </div>
      </Modal>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title={t('settings.clear.title')}
      >
        <div className="grid gap-3">
          <p className="text-sm text-ink-dim">{t('settings.clear.sub')}</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleClearHistory}>
              {t('settings.clear.confirm')}
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
