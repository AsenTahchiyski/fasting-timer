import Dexie, { type Table } from 'dexie';
import type { ExportPayload, FastSession, Settings } from './types';

interface KVEntry {
  key: string;
  value: unknown;
}

class FastingDB extends Dexie {
  settings!: Table<Settings, 'default'>;
  sessions!: Table<FastSession, number>;
  kv!: Table<KVEntry, string>;

  constructor() {
    super('fasting-timer');
    this.version(1).stores({
      settings: 'id',
      sessions: '++id, startedAt, endedAt'
    });
    // v2 adds a kv table for values that must survive across sessions but
    // aren't user settings — e.g. the FileSystemFileHandle of the backup file
    // (handles are structured-cloneable, so IndexedDB can store them).
    this.version(2).stores({
      settings: 'id',
      sessions: '++id, startedAt, endedAt',
      kv: 'key'
    });
  }
}

export const db = new FastingDB();

export const defaultSettings = (): Settings => {
  const tz =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const now = Date.now();
  return {
    id: 'default',
    name: '',
    accentColor: '#7aa2ff',
    themeMode: 'system',
    timezone: tz,
    hourFormat: '24h',
    targetHours: 16,
    language: 'bg',
    onboarded: false,
    createdAt: now,
    updatedAt: now
  };
};

export async function ensureSettings(): Promise<Settings> {
  const existing = await db.settings.get('default');
  if (existing) {
    if (!existing.language) {
      const patched: Settings = { ...existing, language: 'bg' };
      await db.settings.put(patched);
      return patched;
    }
    return existing;
  }
  const fresh = defaultSettings();
  await db.settings.put(fresh);
  return fresh;
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  await db.settings.update('default', { ...patch, updatedAt: Date.now() });
}

export async function getKV<T>(key: string): Promise<T | undefined> {
  const entry = await db.kv.get(key);
  return entry?.value as T | undefined;
}

export async function setKV(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value });
}

export async function deleteKV(key: string): Promise<void> {
  await db.kv.delete(key);
}

export async function getActiveSession(): Promise<FastSession | undefined> {
  return db.sessions.filter((s) => s.endedAt === null).first();
}

export async function startSession(
  startedAt: number,
  targetHours: number
): Promise<number> {
  const id = await db.sessions.add({
    startedAt,
    endedAt: null,
    targetHours
  });
  return id as number;
}

export async function stopSession(
  id: number,
  endedAt: number
): Promise<void> {
  await db.sessions.update(id, { endedAt });
}

export async function updateSession(
  id: number,
  patch: Partial<FastSession>
): Promise<void> {
  await db.sessions.update(id, patch);
}

export async function deleteSession(id: number): Promise<void> {
  await db.sessions.delete(id);
}

export async function getLastCompletedSession(): Promise<FastSession | undefined> {
  const list = await db.sessions
    .where('endedAt')
    .above(0)
    .reverse()
    .sortBy('endedAt');
  return list[0];
}

export async function getAllSessions(): Promise<FastSession[]> {
  return db.sessions.orderBy('startedAt').reverse().toArray();
}

export async function isDatabaseEmpty(): Promise<boolean> {
  const [settingsCount, sessionCount] = await Promise.all([
    db.settings.count(),
    db.sessions.count()
  ]);
  return settingsCount === 0 && sessionCount === 0;
}

export async function restoreFromPayload(payload: ExportPayload): Promise<void> {
  await db.transaction('rw', db.settings, db.sessions, async () => {
    await db.sessions.clear();
    const settings: Settings = { ...payload.settings, id: 'default' };
    await db.settings.put(settings);
    for (const s of payload.sessions) {
      const { id: _id, ...rest } = s;
      void _id;
      await db.sessions.add(rest);
    }
  });
}
