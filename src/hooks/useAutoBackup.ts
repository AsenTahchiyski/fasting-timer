import { useEffect, useRef } from 'react';
import type { FastSession, Settings } from '../db/types';
import { writeLocalBackup } from '../lib/backup';

/**
 * Keeps a localStorage mirror of the current data in sync, debounced so rapid
 * edits (e.g. typing a name) don't thrash storage. The mirror is used by
 * bootstrap to auto-recover if IndexedDB is lost.
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
    }, 800);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [settings, sessions]);
}
