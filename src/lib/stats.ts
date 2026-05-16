import type { FastSession } from '../db/types';
import { DAY_MS, HOUR_MS, startOfDayInTz } from './time';

export interface SessionStats {
  total: number;
  totalCompleted: number;
  averageHours: number;
  longestHours: number;
  currentStreakDays: number;
  bestStreakDays: number;
  goalsHit: number;
}

export function computeStats(sessions: FastSession[], timezone: string): SessionStats {
  const completed = sessions.filter((s) => s.endedAt !== null);
  const durations = completed.map((s) => (s.endedAt! - s.startedAt) / HOUR_MS);
  const total = sessions.length;
  const averageHours =
    durations.length === 0
      ? 0
      : durations.reduce((a, b) => a + b, 0) / durations.length;
  const longestHours = durations.length === 0 ? 0 : Math.max(...durations);
  const goalsHit = completed.filter(
    (s) => (s.endedAt! - s.startedAt) / HOUR_MS >= s.targetHours
  ).length;

  // Streak: distinct local days that contained at least one fast that hit its target.
  const goalDays = new Set<number>();
  for (const s of completed) {
    const hrs = (s.endedAt! - s.startedAt) / HOUR_MS;
    if (hrs < s.targetHours) continue;
    goalDays.add(startOfDayInTz(s.startedAt, timezone));
  }
  const sortedDays = [...goalDays].sort((a, b) => b - a);

  // Best streak (anywhere in history).
  let bestStreak = 0;
  let run = 0;
  const ascending = [...goalDays].sort((a, b) => a - b);
  for (let i = 0; i < ascending.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = ascending[i - 1];
      const diff = Math.round((ascending[i] - prev) / DAY_MS);
      run = diff === 1 ? run + 1 : 1;
    }
    if (run > bestStreak) bestStreak = run;
  }

  // Current streak: consecutive days back from today (or yesterday if today not hit yet).
  let currentStreak = 0;
  const today = startOfDayInTz(Date.now(), timezone);
  let cursor = today;
  if (!goalDays.has(cursor)) cursor = cursor - DAY_MS; // allow grace for today.
  for (const day of sortedDays) {
    if (day === cursor) {
      currentStreak += 1;
      cursor = cursor - DAY_MS;
    } else if (day < cursor) {
      break;
    }
  }

  return {
    total,
    totalCompleted: completed.length,
    averageHours,
    longestHours,
    currentStreakDays: currentStreak,
    bestStreakDays: bestStreak,
    goalsHit
  };
}

export interface ChartPoint {
  label: string;
  startedAt: number;
  hours: number;
  target: number;
  hitGoal: boolean;
}

export function recentChartData(
  sessions: FastSession[],
  count: number
): ChartPoint[] {
  const completed = sessions
    .filter((s) => s.endedAt !== null)
    .slice(0, count)
    .reverse();
  return completed.map((s) => {
    const hrs = (s.endedAt! - s.startedAt) / HOUR_MS;
    return {
      label: new Date(s.startedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      }),
      startedAt: s.startedAt,
      hours: Number(hrs.toFixed(2)),
      target: s.targetHours,
      hitGoal: hrs >= s.targetHours
    };
  });
}
