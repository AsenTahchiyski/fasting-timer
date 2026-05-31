import type { ExportPayload, FastSession, Settings } from '../db/types';

// localStorage is a separate store from IndexedDB, so it survives an
// IndexedDB-only loss (corruption / partial eviction). Note: a full
// origin storage clear wipes localStorage too — the off-device backup
// file (downloadPayload) is the only guard against that.
const LOCAL_BACKUP_KEY = 'fasting-timer-backup-v1';
const LAST_BACKUP_KEY = 'fasting-timer-last-backup-v1';

// Nudge the user to save an off-device backup if it's been this long.
export const BACKUP_REMINDER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function buildPayload(
  settings: Settings,
  sessions: FastSession[]
): ExportPayload {
  return {
    version: 1,
    exportedAt: Date.now(),
    settings,
    sessions
  };
}

function isValidPayload(p: Partial<ExportPayload> | null): p is ExportPayload {
  return (
    !!p && p.version === 1 && !!p.settings && Array.isArray(p.sessions)
  );
}

/**
 * Ask the browser to keep our storage durable so it isn't evicted under
 * storage pressure. Auto-granted for installed PWAs; a no-op elsewhere.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** Mirror the current data into localStorage (best effort). */
export function writeLocalBackup(
  settings: Settings,
  sessions: FastSession[]
): void {
  try {
    localStorage.setItem(
      LOCAL_BACKUP_KEY,
      JSON.stringify(buildPayload(settings, sessions))
    );
  } catch {
    // Storage full or unavailable — nothing we can do.
  }
}

export function readLocalBackup(): ExportPayload | null {
  try {
    const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ExportPayload>;
    return isValidPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getLastBackupAt(): number | null {
  const raw = localStorage.getItem(LAST_BACKUP_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function markBackedUp(at: number = Date.now()): void {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, String(at));
  } catch {
    // ignore
  }
}

/**
 * Download a JSON file. This lands outside the origin's storage box (in the
 * device's Downloads), so it survives a full browser storage clear.
 */
export function downloadPayload(payload: ExportPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const stamp = new Date(payload.exportedAt)
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  a.download = `fasting-timer-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  markBackedUp(payload.exportedAt);
}
