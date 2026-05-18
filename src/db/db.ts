import Dexie, { type Table } from 'dexie';
import type { FastSession, Settings } from './types';

class FastingDB extends Dexie {
  settings!: Table<Settings, 'default'>;
  sessions!: Table<FastSession, number>;

  constructor() {
    super('fasting-timer');
    this.version(1).stores({
      settings: 'id',
      sessions: '++id, startedAt, endedAt'
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
