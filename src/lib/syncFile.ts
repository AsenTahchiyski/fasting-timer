/**
 * Two-way sync of settings + fasts with a JSON file the user picks, so
 * several devices can share one data set (e.g. a file in a synced folder).
 * The file uses the same `ExportPayload` shape as manual export, so it can
 * also be imported by hand.
 *
 * Live sync uses the File System Access API (Chromium only); elsewhere the
 * Settings screen falls back to manual export / import.
 *
 * Sync is a three-way check against `SyncRecord.lastSynced`: whichever side
 * changed since then wins; if both did, the newer one wins (last write wins).
 * Fasts are matched across devices by `startedAt`, since local ids differ.
 */
import { liveQuery } from 'dexie';
import { db, deleteKV, getKV, setKV } from '../db/db';
import type { ExportPayload, FastSession, Settings } from '../db/types';
import { buildPayload, isValidPayload } from './backup';

const RECORD_KEY = 'syncFile';
// Where earlier versions kept the (write-only) backup file handle.
const LEGACY_HANDLE_KEY = 'backupFileHandle';

const FILE_TYPES = [
  { description: 'Fasting Timer data', accept: { 'application/json': ['.json'] } }
];
const SUGGESTED_NAME = 'fasting-timer.json';

// Device-local fields (id, onboarded, timestamps) stay out of sync.
const SYNCED_SETTINGS = [
  'name',
  'accentColor',
  'themeMode',
  'timezone',
  'hourFormat',
  'targetHours',
  'language'
] as const;

type SyncedSettings = Pick<Settings, (typeof SYNCED_SETTINGS)[number]>;
type SyncedSession = Omit<FastSession, 'id'>;

/** What gets synced; compared as a canonical JSON string. */
interface SyncContent {
  settings: SyncedSettings;
  sessions: SyncedSession[];
}

/**
 * The linked file (kept in the kv table). `lastSynced` is the canonical
 * content last known to match both the file and this device — the base for
 * the three-way "who changed?" check. Empty right after linking a file.
 */
interface SyncRecord {
  handle: FileSystemFileHandle;
  fileName: string;
  lastSynced: string;
  /** When this device's data last diverged from `lastSynced` (ms). */
  localChangedAt: number;
}

export type SyncState =
  | { kind: 'off' }
  | { kind: 'needs-permission'; fileName: string }
  | { kind: 'connected'; fileName: string; lastSyncAt?: number }
  | { kind: 'error'; fileName: string; message: string };

/** i18n keys for conflict notices. */
export type SyncNotice = 'sync.conflictFile' | 'sync.conflictLocal';

export const liveSyncSupported =
  typeof window !== 'undefined' &&
  !!window.showSaveFilePicker &&
  !!window.showOpenFilePicker;

// ---- State + subscription -------------------------------------------------

let state: SyncState = { kind: 'off' };
let notice: SyncNotice | null = null;
const listeners = new Set<() => void>();

function setState(next: SyncState): void {
  state = next;
  listeners.forEach((l) => l());
}

function setNotice(next: SyncNotice | null): void {
  notice = next;
  listeners.forEach((l) => l());
}

export const getSyncState = (): SyncState => state;
export const getSyncNotice = (): SyncNotice | null => notice;
export const clearSyncNotice = (): void => setNotice(null);

export function subscribeSync(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getRecord = () => getKV<SyncRecord>(RECORD_KEY);
const patchRecord = async (patch: Partial<SyncRecord>) => {
  const rec = await getRecord();
  if (rec) await setKV(RECORD_KEY, { ...rec, ...patch });
};

// ---- Canonical content ----------------------------------------------------

function toContent(settings: Settings, sessions: FastSession[]): SyncContent {
  const s = {} as Record<string, unknown>;
  for (const k of SYNCED_SETTINGS) s[k] = settings[k];
  return {
    settings: s as unknown as SyncedSettings,
    sessions: sessions
      .map((x) => ({
        startedAt: x.startedAt,
        endedAt: x.endedAt,
        targetHours: x.targetHours,
        note: x.note || undefined
      }))
      .sort((a, b) => a.startedAt - b.startedAt)
  };
}

async function localData() {
  const [settings, sessions] = await Promise.all([
    db.settings.get('default'),
    db.sessions.toArray()
  ]);
  return { settings, sessions };
}

async function localContent(): Promise<string> {
  const { settings, sessions } = await localData();
  return settings ? JSON.stringify(toContent(settings, sessions)) : '';
}

function parseFile(text: string): ExportPayload | null {
  if (!text.trim()) return null;
  let raw: Partial<ExportPayload>;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('sync.invalidFile');
  }
  if (!isValidPayload(raw)) throw new Error('sync.invalidFile');
  return raw;
}

// ---- Applying incoming content --------------------------------------------

/**
 * Write incoming content into the local DB. 'replace' mirrors the file
 * exactly (fasts missing from it are removed here too); 'merge' only adds
 * and updates, so linking a file never loses this device's fasts.
 */
async function applyContent(c: SyncContent, mode: 'replace' | 'merge'): Promise<void> {
  await db.transaction('rw', db.settings, db.sessions, async () => {
    await db.settings.update('default', { ...c.settings, updatedAt: Date.now() });

    const local = await db.sessions.toArray();
    const byStart = new Map(local.map((s) => [s.startedAt, s]));
    const incoming = new Set<number>();
    for (const s of c.sessions) {
      incoming.add(s.startedAt);
      const existing = byStart.get(s.startedAt);
      if (existing) {
        // `note: undefined` clears a note removed on the other device.
        await db.sessions.update(existing.id!, {
          endedAt: s.endedAt,
          targetHours: s.targetHours,
          note: s.note
        });
      } else {
        await db.sessions.add({ ...s });
      }
    }
    if (mode === 'replace') {
      for (const s of local) {
        if (!incoming.has(s.startedAt)) await db.sessions.delete(s.id!);
      }
    }
  });
}

// ---- Sync engine ----------------------------------------------------------

// Every sync step runs one at a time so a local edit can't race a pull.
let queue: Promise<void> = Promise.resolve();
function enqueue(step: () => Promise<void>): Promise<void> {
  queue = queue.then(step, step);
  return queue;
}

async function writeFile(handle: FileSystemFileHandle): Promise<void> {
  const { settings, sessions } = await localData();
  const w = await handle.createWritable();
  await w.write(JSON.stringify(buildPayload(settings!, sessions), null, 2));
  await w.close();
}

async function runSync(): Promise<void> {
  const rec = await getRecord();
  if (!rec) return;
  try {
    if ((await rec.handle.queryPermission?.({ mode: 'readwrite' })) !== 'granted') {
      setState({ kind: 'needs-permission', fileName: rec.fileName });
      return;
    }
    const file = parseFile(await (await rec.handle.getFile()).text());
    const fileContent = file
      ? JSON.stringify(toContent(file.settings, file.sessions))
      : null;
    const local = await localContent();

    let pull: boolean;
    if (fileContent === null || fileContent === local) {
      pull = false;
    } else if (rec.lastSynced === '') {
      pull = true; // freshly linked existing file: adopt it (merged)
    } else if (local === rec.lastSynced) {
      pull = true; // only the file changed
    } else if (fileContent === rec.lastSynced) {
      pull = false; // only this device changed
    } else {
      // Both changed: last write wins.
      pull = file!.exportedAt > rec.localChangedAt;
      setNotice(pull ? 'sync.conflictFile' : 'sync.conflictLocal');
    }

    if (pull) {
      await applyContent(
        JSON.parse(fileContent!) as SyncContent,
        rec.lastSynced === '' ? 'merge' : 'replace'
      );
    }
    const now = await localContent();
    if (now !== fileContent) await writeFile(rec.handle);

    await patchRecord({ lastSynced: now });
    setState({ kind: 'connected', fileName: rec.fileName, lastSyncAt: Date.now() });
  } catch (err) {
    setState({
      kind: 'error',
      fileName: rec.fileName,
      message: err instanceof Error ? err.message : String(err)
    });
  }
}

export const syncNow = (): Promise<void> => enqueue(runSync);

async function onLocalChange(content: string): Promise<void> {
  const rec = await getRecord();
  if (!rec || content === rec.lastSynced) return;
  await patchRecord({ localChangedAt: Date.now() });
  if (state.kind === 'connected') await runSync();
}

let started = false;

/** Call once at boot: restores the linked file and starts watching for edits. */
export async function initSync(): Promise<void> {
  if (started) return;
  started = true;

  // A file chosen as the one-way backup target becomes the sync file.
  const legacy = await getKV<FileSystemFileHandle>(LEGACY_HANDLE_KEY);
  if (legacy) {
    if (!(await getRecord())) {
      await setKV(RECORD_KEY, {
        handle: legacy,
        fileName: legacy.name,
        lastSynced: '',
        localChangedAt: Date.now()
      } satisfies SyncRecord);
    }
    await deleteKV(LEGACY_HANDLE_KEY);
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  let first = true;
  liveQuery(localContent).subscribe((content) => {
    // The initial emission is the state at boot, not an edit.
    if (first) {
      first = false;
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => enqueue(() => onLocalChange(content)), 400);
  });
  // Pick up edits made on other devices when the app comes back to the front.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.kind === 'connected') {
      void syncNow();
    }
  });

  if (await getRecord()) await syncNow();
}

async function link(handle: FileSystemFileHandle): Promise<void> {
  if ((await handle.requestPermission?.({ mode: 'readwrite' })) !== 'granted') return;
  await setKV(RECORD_KEY, {
    handle,
    fileName: handle.name,
    lastSynced: '',
    localChangedAt: Date.now()
  } satisfies SyncRecord);
  await syncNow();
}

const isAbort = (err: unknown): boolean =>
  err instanceof DOMException && err.name === 'AbortError';

/** Create (or overwrite) a file and fill it with this device's data. */
export async function createSyncFile(): Promise<void> {
  try {
    const handle = await window.showSaveFilePicker!({
      suggestedName: SUGGESTED_NAME,
      types: FILE_TYPES
    });
    // Empty it first so the sync pushes local data instead of adopting old content.
    const w = await handle.createWritable();
    await w.close();
    await link(handle);
  } catch (err) {
    if (!isAbort(err)) throw err;
  }
}

/** Link an existing file: its data is merged into this device's. */
export async function openSyncFile(): Promise<void> {
  try {
    const [handle] = await window.showOpenFilePicker!({ types: FILE_TYPES });
    await link(handle);
  } catch (err) {
    if (!isAbort(err)) throw err;
  }
}

/** Re-grant file access after a reload (must run from a user gesture). */
export async function reconnectSync(): Promise<void> {
  const rec = await getRecord();
  if (!rec) return;
  if ((await rec.handle.requestPermission?.({ mode: 'readwrite' })) === 'granted') {
    await syncNow();
  }
}

export async function disconnectSync(): Promise<void> {
  await enqueue(async () => {
    await deleteKV(RECORD_KEY);
    setState({ kind: 'off' });
    setNotice(null);
  });
}
