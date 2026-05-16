import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { db, ensureSettings, updateSettings } from '../db/db';
import type { Settings } from '../db/types';

export interface SettingsHook {
  settings: Settings | undefined;
  loading: boolean;
  update: (patch: Partial<Settings>) => Promise<void>;
}

export function useSettings(): SettingsHook {
  const settings = useLiveQuery(() => db.settings.get('default'), []);

  useEffect(() => {
    if (settings === undefined) {
      // initial bootstrap; ensureSettings is idempotent.
      ensureSettings();
    }
  }, [settings]);

  return {
    settings,
    loading: settings === undefined,
    update: (patch) => updateSettings(patch)
  };
}
