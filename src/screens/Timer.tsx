import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { Modal } from '../components/Modal';
import { ProgressRing } from '../components/ProgressRing';
import { StageCard } from '../components/StageCard';
import { TimeEditModal } from '../components/TimeEditModal';
import {
  deleteSession,
  startSession,
  stopSession,
  updateSession
} from '../db/db';
import type { FastSession, Settings } from '../db/types';
import { useNow } from '../hooks/useNow';
import { LOCALE, useLang, useT } from '../lib/i18n';
import {
  formatDateTime,
  formatDuration,
  formatDurationShort,
  HOUR_MS
} from '../lib/time';
import { nextStage, stageForHours } from '../lib/stages';
import { computeStats } from '../lib/stats';

interface Props {
  settings: Settings;
  active: FastSession | undefined;
  last: FastSession | undefined;
  sessions: FastSession[];
}

export function TimerScreen({ settings, active, last, sessions }: Props) {
  const t = useT();
  const lang = useLang();
  const locale = LOCALE[lang];
  const now = useNow(1000);
  const [editStartOpen, setEditStartOpen] = useState(false);
  const [editLastEndOpen, setEditLastEndOpen] = useState(false);
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [summary, setSummary] = useState<{
    started: number;
    ended: number;
    target: number;
    streak: number;
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
    const completed: FastSession = { ...active, endedAt: ended };
    const merged = sessions.some((s) => s.id === active.id)
      ? sessions.map((s) => (s.id === active.id ? completed : s))
      : [completed, ...sessions];
    const stats = computeStats(merged, settings.timezone);
    setSummary({
      started: active.startedAt,
      ended,
      target: active.targetHours,
      streak: stats.currentStreakDays
    });
    setConfirmStopOpen(false);
  };

  const handleDiscard = async () => {
    if (!active?.id) return;
    await deleteSession(active.id);
    setConfirmDiscardOpen(false);
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
            {isFasting ? t('timer.fasting') : t('timer.notFasting')}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting(t)}, {settings.name || t('timer.greeting.friend')}
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
                    ? t('timer.goalReached')
                    : t('timer.elapsed')
                  : t('timer.sinceLast')}
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
                  {t('timer.goalProgress', { hours: target })} ·{' '}
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
                  {t('timer.started')}
                </div>
                <div className="font-medium">
                  {formatDateTime(
                    active.startedAt,
                    settings.timezone,
                    settings.hourFormat,
                    locale
                  )}
                </div>
                <div className="text-xs text-accent mt-0.5">
                  {t('timer.tapToEdit')}
                </div>
              </button>
              <div className="rounded-2xl border border-line bg-surface-2 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                  {t('timer.goalAt')}
                </div>
                <div className="font-medium">
                  {formatDateTime(
                    targetEnd,
                    settings.timezone,
                    settings.hourFormat,
                    locale
                  )}
                </div>
                <div className="text-xs text-ink-dim mt-0.5">
                  {t('timer.in', {
                    duration: formatDurationShort(Math.max(0, targetEnd - now))
                  })}
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
              {t('timer.endFast')}
            </Button>
            <button
              onClick={() => setConfirmDiscardOpen(true)}
              className="-mt-2 text-sm text-ink-dim hover:text-[rgb(255,107,107)] transition-colors underline-offset-4 hover:underline"
            >
              {t('timer.discardFast')}
            </button>
          </>
        ) : (
          <>
            {lastCompleted && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl border border-line bg-surface-2 p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                    {t('timer.lastFast')}
                  </div>
                  <div className="font-medium">
                    {formatDurationShort(lastCompleted.endedAt - lastCompleted.startedAt)}
                  </div>
                  <div className="text-xs text-ink-dim mt-0.5">
                    {t('timer.lastGoal', {
                      hours: (
                        (lastCompleted.endedAt - lastCompleted.startedAt) /
                        HOUR_MS
                      ).toFixed(1),
                      target: lastCompleted.targetHours
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setEditLastEndOpen(true)}
                  className="rounded-2xl border border-line bg-surface-2 p-3 text-left hover:border-accent/50 transition-colors"
                >
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                    {t('timer.ended')}
                  </div>
                  <div className="font-medium">
                    {formatDateTime(
                      lastCompleted.endedAt,
                      settings.timezone,
                      settings.hourFormat,
                      locale
                    )}
                  </div>
                  <div className="text-xs text-accent mt-0.5">
                    {t('timer.tapToEdit')}
                  </div>
                </button>
              </div>
            )}

            <Button size="lg" full onClick={handleStart}>
              {t('timer.startFast')}
            </Button>

            <div className="rounded-2xl border border-line bg-surface-2 p-5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                {t('timer.yourTarget')}
              </div>
              <div className="mt-1 text-lg font-semibold tracking-tight">
                {t('timer.targetHours', { hours: settings.targetHours })}
              </div>
              <p className="mt-1 text-sm text-ink-dim">
                {t('timer.targetHint')}
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
          title={t('timer.editStart')}
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
          title={t('timer.editLastEnd')}
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

      <Modal
        open={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        title={t('timer.confirmDiscard.title')}
      >
        <div className="grid gap-3">
          <p className="text-sm text-ink-dim">
            {t('timer.confirmDiscard.sub')}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDiscardOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDiscard}>
              {t('timer.confirmDiscard.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      <SummaryModal
        summary={summary}
        settings={settings}
        onClose={() => setSummary(null)}
      />
    </div>
  );
}

function greeting(t: (key: string) => string): string {
  const h = new Date().getHours();
  if (h < 5) return t('timer.greeting.night');
  if (h < 12) return t('timer.greeting.morning');
  if (h < 18) return t('timer.greeting.afternoon');
  return t('timer.greeting.evening');
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
  const t = useT();
  const hours = elapsedMs / HOUR_MS;
  const reached = hours >= targetHours;
  const elapsed = formatDurationShort(elapsedMs);
  return (
    <Modal open={open} onClose={onClose} title={t('timer.confirmEnd.title')}>
      <div className="grid gap-3">
        <p className="text-sm text-ink-dim">
          {reached
            ? t('timer.confirmEnd.reached', { elapsed })
            : t('timer.confirmEnd.short', {
                elapsed,
                remaining: formatDurationShort(targetHours * HOUR_MS - elapsedMs),
                target: targetHours
              })}
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            {t('timer.confirmEnd.keep')}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t('timer.endFast')}
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
  summary: {
    started: number;
    ended: number;
    target: number;
    streak: number;
  } | null;
  settings: Settings;
  onClose: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const locale = LOCALE[lang];
  if (!summary) return null;
  const ms = summary.ended - summary.started;
  const hours = ms / HOUR_MS;
  const reached = hours >= summary.target;
  const stage = stageForHours(hours);
  const streakLine =
    summary.streak <= 1
      ? t('timer.summary.streakOne')
      : t('timer.summary.streakMany', { streak: summary.streak });
  return (
    <>
      {reached && <Confetti />}
      <Modal open={!!summary} onClose={onClose} title={t('timer.summary.title')}>
      <div className="grid gap-4">
        <div className="text-center py-3">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-dim">
            {t('timer.summary.total')}
          </div>
          <div className="font-mono text-4xl font-semibold tracking-tight mt-1">
            {formatDuration(ms)}
          </div>
          <div className="text-sm text-accent mt-1">
            {t('timer.summary.goalLine', {
              hours: hours.toFixed(1),
              target: summary.target
            })}{' '}
            {reached ? '✓' : ''}
          </div>
          {reached && summary.streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="mt-3 rounded-2xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm"
            >
              <div className="font-medium">{t('timer.summary.celebrate')}</div>
              <div className="text-ink-dim mt-0.5">{streakLine}</div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-line p-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
              {t('timer.started')}
            </div>
            <div className="font-medium">
              {formatDateTime(
                summary.started,
                settings.timezone,
                settings.hourFormat,
                locale
              )}
            </div>
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
              {t('timer.ended')}
            </div>
            <div className="font-medium">
              {formatDateTime(
                summary.ended,
                settings.timezone,
                settings.hourFormat,
                locale
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line p-3">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
            {t('timer.summary.stageReached')}
          </div>
          <div className="font-semibold">{t(`stage.${stage.id}.name`)}</div>
          <p className="text-sm text-ink-dim mt-1">
            {t(`stage.${stage.id}.summary`)}
          </p>
        </div>

        <Button onClick={onClose} full>
          {t('common.done')}
        </Button>
      </div>
      </Modal>
    </>
  );
}
