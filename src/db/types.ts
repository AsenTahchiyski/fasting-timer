export type ThemeMode = 'light' | 'dark' | 'system';
export type HourFormat = '24h' | '12h';

export interface Settings {
  id: 'default';
  name: string;
  accentColor: string; // hex like "#7aa2ff"
  themeMode: ThemeMode;
  timezone: string; // IANA, e.g. "Europe/Sofia"
  hourFormat: HourFormat;
  targetHours: number; // fasting target in hours, e.g. 16
  onboarded: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FastSession {
  id?: number;
  startedAt: number; // epoch ms
  endedAt: number | null; // null while active
  targetHours: number; // snapshot of target at start, for historical accuracy
  note?: string;
}

export interface ExportPayload {
  version: 1;
  exportedAt: number;
  settings: Settings;
  sessions: FastSession[];
}
