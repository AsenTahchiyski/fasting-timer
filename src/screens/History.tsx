import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { StatCard } from '../components/StatCard';
import { TimeEditModal } from '../components/TimeEditModal';
import { deleteSession, updateSession } from '../db/db';
import type { FastSession, Settings } from '../db/types';
import { computeStats, recentChartData } from '../lib/stats';
import {
  formatDateTime,
  formatDurationShort,
  HOUR_MS
} from '../lib/time';

interface Props {
  sessions: FastSession[];
  settings: Settings;
}

export function HistoryScreen({ sessions, settings }: Props) {
  const stats = useMemo(
    () => computeStats(sessions, settings.timezone),
    [sessions, settings.timezone]
  );
  const chartData = useMemo(() => recentChartData(sessions, 14), [sessions]);

  const [editing, setEditing] = useState<{
    session: FastSession;
    field: 'start' | 'end';
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FastSession | null>(null);

  const completed = sessions.filter((s) => s.endedAt !== null);

  return (
    <div className="app-shell">
      <div className="max-w-md mx-auto p-5 pt-6 grid gap-5">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="text-sm text-ink-dim mt-1">
            {stats.totalCompleted} completed · {stats.goalsHit} goals hit
          </p>
        </header>

        <section className="grid grid-cols-2 gap-2">
          <StatCard
            label="Avg duration"
            value={
              stats.averageHours > 0
                ? `${stats.averageHours.toFixed(1)}h`
                : '—'
            }
            hint="over completed fasts"
          />
          <StatCard
            label="Longest"
            value={
              stats.longestHours > 0
                ? `${stats.longestHours.toFixed(1)}h`
                : '—'
            }
            hint="personal best"
          />
          <StatCard
            label="Current streak"
            value={`${stats.currentStreakDays}`}
            hint="days hitting goal"
            accent={stats.currentStreakDays > 0}
          />
          <StatCard
            label="Best streak"
            value={`${stats.bestStreakDays}`}
            hint="days hitting goal"
          />
        </section>

        <section className="rounded-2xl border border-line bg-surface-2 p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold tracking-tight">
              Last {chartData.length || 0} fasts
            </h2>
            <span className="text-xs text-ink-dim">hours</span>
          </div>
          <div className="h-56 mt-2">
            {chartData.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-ink-dim">
                No data yet — your fasts will show up here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 4, left: -16, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgb(var(--line))"
                  />
                  <XAxis
                    dataKey="label"
                    stroke="rgb(var(--ink-dim))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgb(var(--ink-dim))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgb(var(--line) / 0.4)' }}
                    contentStyle={{
                      background: 'rgb(var(--surface-2))',
                      border: '1px solid rgb(var(--line))',
                      borderRadius: 12,
                      fontSize: 12,
                      color: 'rgb(var(--ink))'
                    }}
                    formatter={(v: number) => [`${v}h`, 'Fast']}
                  />
                  <ReferenceLine
                    y={settings.targetHours}
                    stroke="rgb(var(--accent))"
                    strokeDasharray="4 4"
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => (
                      <Cell
                        key={i}
                        fill={
                          d.hitGoal
                            ? 'rgb(var(--accent))'
                            : 'rgb(var(--accent) / 0.45)'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="grid gap-2">
          <h2 className="text-sm font-semibold tracking-tight px-1">
            All fasts
          </h2>
          {completed.length === 0 && (
            <div className="rounded-2xl border border-line bg-surface-2 p-5 text-sm text-ink-dim">
              Nothing logged yet. Start a fast from the timer screen.
            </div>
          )}
          {completed.map((s) => {
            const ms = s.endedAt! - s.startedAt;
            const hours = ms / HOUR_MS;
            const hit = hours >= s.targetHours;
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-line bg-surface-2 p-4 grid gap-2"
              >
                <div className="flex items-baseline justify-between">
                  <div className="text-base font-semibold">
                    {formatDurationShort(ms)}
                    <span className="text-xs text-ink-dim ml-2 font-normal">
                      {hours.toFixed(1)}h
                    </span>
                  </div>
                  <div
                    className={
                      'text-xs font-medium ' +
                      (hit ? 'text-accent' : 'text-ink-dim')
                    }
                  >
                    {hit ? '✓ Goal hit' : `Goal ${s.targetHours}h`}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setEditing({ session: s, field: 'start' })}
                    className="text-left rounded-lg border border-line bg-surface px-2 py-1.5 hover:border-accent/50"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-ink-dim">
                      Start
                    </div>
                    <div className="text-ink">
                      {formatDateTime(
                        s.startedAt,
                        settings.timezone,
                        settings.hourFormat
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setEditing({ session: s, field: 'end' })}
                    className="text-left rounded-lg border border-line bg-surface px-2 py-1.5 hover:border-accent/50"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-ink-dim">
                      End
                    </div>
                    <div className="text-ink">
                      {formatDateTime(
                        s.endedAt!,
                        settings.timezone,
                        settings.hourFormat
                      )}
                    </div>
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setConfirmDelete(s)}
                    className="text-xs text-ink-dim hover:text-[rgb(255,107,107)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {editing && (
        <TimeEditModal
          open={!!editing}
          onClose={() => setEditing(null)}
          onSave={async (ms) => {
            if (editing.field === 'start') {
              await updateSession(editing.session.id!, { startedAt: ms });
            } else {
              await updateSession(editing.session.id!, { endedAt: ms });
            }
          }}
          title={
            editing.field === 'start' ? 'Edit start time' : 'Edit end time'
          }
          initial={
            editing.field === 'start'
              ? editing.session.startedAt
              : editing.session.endedAt!
          }
          timezone={settings.timezone}
          min={
            editing.field === 'end' ? editing.session.startedAt + 1 : undefined
          }
          max={
            editing.field === 'start'
              ? editing.session.endedAt ?? Date.now()
              : Date.now()
          }
        />
      )}

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete this fast?"
      >
        <div className="grid gap-3">
          <p className="text-sm text-ink-dim">
            This will remove the entry permanently. This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (confirmDelete?.id) await deleteSession(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
