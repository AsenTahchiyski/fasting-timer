import { useState } from 'react';
import type { FastSession, Settings } from '../db/types';
import { useT } from '../lib/i18n';
import {
  BACKUP_REMINDER_MS,
  buildPayload,
  downloadPayload,
  getLastBackupAt
} from '../lib/backup';
import { Button } from './Button';

interface Props {
  settings: Settings;
  sessions: FastSession[];
}

export function BackupReminder({ settings, sessions }: Props) {
  const t = useT();
  const [dismissed, setDismissed] = useState(false);
  const last = getLastBackupAt();
  const stale = last === null || Date.now() - last > BACKUP_REMINDER_MS;

  // Only nag once there's something worth losing and it's actually overdue.
  if (dismissed || sessions.length === 0 || !stale) return null;

  const handleBackup = () => {
    downloadPayload(buildPayload(settings, sessions));
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-24 z-30 px-3">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface-2 p-4 shadow-lg">
        <div className="text-sm font-semibold">{t('backup.reminder.title')}</div>
        <p className="mt-1 text-xs text-ink-dim">{t('backup.reminder.sub')}</p>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDismissed(true)}>
            {t('backup.reminder.dismiss')}
          </Button>
          <Button onClick={handleBackup}>{t('backup.reminder.action')}</Button>
        </div>
      </div>
    </div>
  );
}
