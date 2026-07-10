import { useEffect, useRef } from 'react';
import type { FastSession, Settings } from '../db/types';
import { buildPayload, writeLocalBackup } from '../lib/backup';
import { writeBackupFile } from '../lib/fileSync';

/**
 * Mirrors the current data on every change, debounced so rapid edits (e.g.
 * typing a name) don't thrash storage. Two mirrors: localStorage (used by
 * bootstrap to auto-recover if IndexedDB is lost) and the backup JSON file
 * (user-chosen, or the default one in app storage).
 */
export function useAutoBackup(
  settings: Settings | undefined,
  sessions: FastSession[]
): void {
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!settings) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      writeLocalBackup(settings, sessions);
      void writeBackupFile(buildPayload(settings, sessions));
    }, 800);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [settings, sessions]);
}
