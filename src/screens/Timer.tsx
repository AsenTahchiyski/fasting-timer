import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ProgressRing } from '../components/ProgressRing';
import { StageCard } from '../components/StageCard';
import { TimeEditModal } from '../components/TimeEditModal';
import {
  startSession,
  stopSession,
  updateSession
} from '../db/db';
import type { FastSession, Settings } from '../db/types';
import { useNow } from '../hooks/useNow';
import {
  formatDateTime,
  formatDuration,
  formatDurationShort,
  HOUR_MS
} from '../lib/time';
import { nextStage, stageForHours } from '../lib/stages';

interface Props {
  settings: Settings;
  active: FastSession | undefined;
  last: FastSession | undefined;
}

export function TimerScreen({ settings, active, last }: Props) {
  const now = useNow(1000);
  const [editStartOpen, setEditStartOpen] = useState(false);
  const [editLastEndOpen, setEditLastEndOpen] = useState(false);
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);
  const [summary, setSummary] = useState<{
    started: number;
    ended: number;
    target: number;
  } | null>(null);

  const isFasting = !!active;
  const elapsedMs = active ? now - active.startedAt : 0;
  const elapsedHours = elapsedMs / HOUR_MS;
  const target = active?.targetHours ?? settings.targetHours;
  const progress = elapsedMs / (target * HOUR_MS);
  const goalReached = progress >= 1;
  const stage = useMemo(() => stageForHours(elapsedHours), [elapsedHours]);
  const next = useMemo(() => nextStage(stage), [stage]);
  const targetEnd = active ? active.startedAt + target * HOUR_MS : 0;
  const lastCompleted =
    last && last.endedAt !== null
      ? (last as FastSession & { endedAt: number })
      : null;
  const idleSinceMs = lastCompleted ? now - lastCompleted.endedAt : 0;

  const handleStart = async () => {
    await startSession(Date.now(), settings.targetHours);
  };

  const handleStop = async () => {
    if (!active?.id) return;
    const ended = Date.now();
    await stopSession(active.id, ended);
    setSummary({
      started: active.startedAt,
      ended,
      target: active.targetHours
    });
    setConfirmStopOpen(false);
  };

  const handleEditStart = async (ms: number) => {
    if (!active?.id) return;
    await updateSession(active.id, { startedAt: ms });
  };

  const handleEditLastEnd = async (ms: number) => {
    if (!last?.id) return;
    await updateSession(last.id, { endedAt: ms });
  };

  return (
    <div className="app-shell accent-ambient">
      <div className="max-w-md mx-auto p-5 pt-8 grid gap-5">
        <header className="grid gap-1">
          <div className="text-xs uppercase tracking-[0.2em] text-ink-dim">
            {isFasting ? 'Currently fasting' : 'Not fasting'}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {settings.name || 'friend'}
          </h1>
        </header>

        <div className="flex justify-center">
          <ProgressRing
            progress={progress}
            pulsing={isFasting && !goalReached}
          >
            <div className="text-center">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-dim">
                {isFasting
                  ? goalReached
                    ? 'Goal reached'
                    : 'Elapsed'
                  : 'Since last fast'}
              </div>
              <motion.div
                className="font-mono text-4xl font-semibold tabular-nums tracking-tight mt-1"
                key={active ? 'fasting' : 'idle'}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {active
                  ? formatDuration(elapsedMs)
                  : lastCompleted
                    ? formatDurationShort(idleSinceMs)
                    : '—'}
              </motion.div>
              {active && (
                <div className="text-xs text-ink-dim mt-1">
                  Goal {target}h ·{' '}
                  <span className="text-accent">
                    {(Math.min(progress, 1) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </ProgressRing>
        </div>

        {active ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <button
                onClick={() => setEditStartOpen(true)}
                className="rounded-2xl border border-line bg-surface-2 p-3 text-left hover:border-accent/50 transition-colors"
              >
                <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                  Started
                </div>
                <div className="font-medium">
                  {formatDateTime(
                    active.startedAt,
                    settings.timezone,
                    settings.hourFormat
                  )}
                </div>
                <div className="text-xs text-accent mt-0.5">Tap to edit</div>
              </button>
              <div className="rounded-2xl border border-line bg-surface-2 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                  Goal at
                </div>
                <div className="font-medium">
                  {formatDateTime(
                    targetEnd,
                    settings.timezone,
                    settings.hourFormat
                  )}
                </div>
                <div className="text-xs text-ink-dim mt-0.5">
                  in {formatDurationShort(Math.max(0, targetEnd - now))}
                </div>
              </div>
            </div>

            <StageCard stage={stage} next={next} hours={elapsedHours} />

            <Button
              size="lg"
              variant="danger"
              full
              onClick={() => setConfirmStopOpen(true)}
            >
              End fast
            </Button>
          </>
        ) : (
          <>
            {lastCompleted && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl border border-line bg-surface-2 p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                    Last fast
                  </div>
                  <div className="font-medium">
                    {formatDurationShort(lastCompleted.endedAt - lastCompleted.startedAt)}
                  </div>
                  <div className="text-xs text-ink-dim mt-0.5">
                    {((lastCompleted.endedAt - lastCompleted.startedAt) / HOUR_MS).toFixed(1)}h ·
                    goal {lastCompleted.targetHours}h
                  </div>
                </div>
                <button
                  onClick={() => setEditLastEndOpen(true)}
                  className="rounded-2xl border border-line bg-surface-2 p-3 text-left hover:border-accent/50 transition-colors"
                >
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                    Ended
                  </div>
                  <div className="font-medium">
                    {formatDateTime(
                      lastCompleted.endedAt,
                      settings.timezone,
                      settings.hourFormat
                    )}
                  </div>
                  <div className="text-xs text-accent mt-0.5">Tap to edit</div>
                </button>
              </div>
            )}

            <Button size="lg" full onClick={handleStart}>
              Start fasting
            </Button>

            <div className="rounded-2xl border border-line bg-surface-2 p-5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                Your target
              </div>
              <div className="mt-1 text-lg font-semibold tracking-tight">
                {settings.targetHours} hours
              </div>
              <p className="mt-1 text-sm text-ink-dim">
                Tap start when your last meal is finished. You can adjust the
                start time after the fact.
              </p>
            </div>
          </>
        )}
      </div>

      {active && (
        <TimeEditModal
          open={editStartOpen}
          onClose={() => setEditStartOpen(false)}
          onSave={handleEditStart}
          title="Edit fast start"
          initial={active.startedAt}
          timezone={settings.timezone}
          max={Date.now()}
        />
      )}

      {lastCompleted && (
        <TimeEditModal
          open={editLastEndOpen}
          onClose={() => setEditLastEndOpen(false)}
          onSave={handleEditLastEnd}
          title="Edit last fast end"
          initial={lastCompleted.endedAt}
          timezone={settings.timezone}
          min={lastCompleted.startedAt + 1}
          max={Date.now()}
        />
      )}

      <ConfirmStopModal
        open={confirmStopOpen}
        onClose={() => setConfirmStopOpen(false)}
        onConfirm={handleStop}
        elapsedMs={elapsedMs}
        targetHours={target}
      />

      <SummaryModal
        summary={summary}
        settings={settings}
        onClose={() => setSummary(null)}
      />
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function ConfirmStopModal({
  open,
  onClose,
  onConfirm,
  elapsedMs,
  targetHours
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  elapsedMs: number;
  targetHours: number;
}) {
  const hours = elapsedMs / HOUR_MS;
  const reached = hours >= targetHours;
  return (
    <Modal open={open} onClose={onClose} title="End fast?">
      <div className="grid gap-3">
        <p className="text-sm text-ink-dim">
          You’ve fasted for{' '}
          <span className="text-ink font-medium">
            {formatDurationShort(elapsedMs)}
          </span>
          {reached
            ? ' and hit your goal. Nice work.'
            : `, ${formatDurationShort(targetHours * HOUR_MS - elapsedMs)} short of your ${targetHours}h goal.`}
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Keep fasting
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            End fast
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function SummaryModal({
  summary,
  settings,
  onClose
}: {
  summary: { started: number; ended: number; target: number } | null;
  settings: Settings;
  onClose: () => void;
}) {
  if (!summary) return null;
  const ms = summary.ended - summary.started;
  const hours = ms / HOUR_MS;
  const reached = hours >= summary.target;
  const stage = stageForHours(hours);
  return (
    <Modal open={!!summary} onClose={onClose} title="Fast complete">
      <div className="grid gap-4">
        <div className="text-center py-3">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-dim">
            Total
          </div>
          <div className="font-mono text-4xl font-semibold tracking-tight mt-1">
            {formatDuration(ms)}
          </div>
          <div className="text-sm text-accent mt-1">
            {hours.toFixed(1)}h · goal {summary.target}h{' '}
            {reached ? '✓' : ''}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-line p-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
              Started
            </div>
            <div className="font-medium">
              {formatDateTime(
                summary.started,
                settings.timezone,
                settings.hourFormat
              )}
            </div>
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
              Ended
            </div>
            <div className="font-medium">
              {formatDateTime(
                summary.ended,
                settings.timezone,
                settings.hourFormat
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line p-3">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
            Stage reached
          </div>
          <div className="font-semibold">{stage.name}</div>
          <p className="text-sm text-ink-dim mt-1">{stage.summary}</p>
        </div>

        <Button onClick={onClose} full>
          Done
        </Button>
      </div>
    </Modal>
  );
}
