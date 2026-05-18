import type { HourFormat } from '../db/types';

export const HOUR_MS = 3600_000;
export const MIN_MS = 60_000;
export const DAY_MS = 86_400_000;

export function clampMin(ms: number): number {
  return Math.max(0, ms);
}

export interface DurationParts {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function durationParts(ms: number): DurationParts {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, totalSeconds };
}

export function formatDuration(ms: number): string {
  const { hours, minutes, seconds } = durationParts(ms);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDurationShort(ms: number): string {
  const { hours, minutes } = durationParts(ms);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatHoursDecimal(ms: number): string {
  const h = ms / HOUR_MS;
  return h.toFixed(1);
}

export function formatDateTime(
  ms: number,
  timezone: string,
  hourFormat: HourFormat,
  locale?: string
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: hourFormat === '12h'
  }).format(new Date(ms));
}

export function formatTime(
  ms: number,
  timezone: string,
  hourFormat: HourFormat,
  locale?: string
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: hourFormat === '12h'
  }).format(new Date(ms));
}

export function formatDay(ms: number, timezone: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    month: 'short',
    day: 'numeric'
  }).format(new Date(ms));
}

/** Convert an epoch ms to the `value` accepted by <input type="datetime-local">
 *  in the given IANA timezone. */
export function epochToLocalInput(ms: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date(ms));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  // some locales render "24" for midnight; normalize to "00".
  let hour = get('hour');
  if (hour === '24') hour = '00';
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`;
}

/** Convert a `<input type="datetime-local">` value back to epoch ms, treating it
 *  as a wall-clock time in the given IANA timezone. */
export function localInputToEpoch(value: string, timezone: string): number {
  // value is "YYYY-MM-DDTHH:mm"
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return NaN;
  const [, y, mo, d, h, mi] = m;
  // Build a UTC guess then adjust by the offset of the target tz.
  const utcGuess = Date.UTC(+y, +mo - 1, +d, +h, +mi);
  const tzAtGuess = tzOffsetMs(utcGuess, timezone);
  // The wall clock at (utcGuess - tzAtGuess) UTC equals the desired wall clock.
  let result = utcGuess - tzAtGuess;
  // One refinement for DST transitions.
  const tzAtResult = tzOffsetMs(result, timezone);
  if (tzAtResult !== tzAtGuess) {
    result = utcGuess - tzAtResult;
  }
  return result;
}

/** Offset (in ms) of the given IANA timezone at a particular instant.
 *  Positive east of UTC (e.g. +7200000 for CEST). */
export function tzOffsetMs(utcMs: number, timezone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  let hour = get('hour');
  if (hour === 24) hour = 0;
  const asUTC = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    hour,
    get('minute'),
    get('second')
  );
  return asUTC - utcMs;
}

export function startOfDayInTz(ms: number, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(ms));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const value = `${get('year')}-${String(get('month')).padStart(2, '0')}-${String(get('day')).padStart(2, '0')}T00:00`;
  return localInputToEpoch(value, timezone);
}

export function listTimezones(): string[] {
  type WithSupported = typeof Intl & {
    supportedValuesOf?: (k: 'timeZone') => string[];
  };
  const intl = Intl as WithSupported;
  if (typeof intl.supportedValuesOf === 'function') {
    return intl.supportedValuesOf('timeZone');
  }
  // Minimal fallback if the runtime is old.
  return [
    'UTC',
    'Europe/London',
    'Europe/Berlin',
    'Europe/Sofia',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];
}

export function cityFromTimezone(tz: string): string {
  const parts = tz.split('/');
  const last = parts[parts.length - 1] ?? tz;
  return last.replaceAll('_', ' ');
}
