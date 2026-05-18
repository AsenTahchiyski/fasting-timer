import { AnimatePresence, motion } from 'framer-motion';
import type { FastingStage } from '../lib/stages';
import { useT, useTList } from '../lib/i18n';

interface Props {
  stage: FastingStage;
  next?: FastingStage;
  hours: number;
}

export function StageCard({ stage, next, hours }: Props) {
  const t = useT();
  const tList = useTList();
  const sinceStage = Math.max(0, hours - stage.rangeHours[0]);
  const stageSpan =
    stage.rangeHours[1] === Infinity
      ? null
      : stage.rangeHours[1] - stage.rangeHours[0];
  const stageProgress = stageSpan ? Math.min(1, sinceStage / stageSpan) : 1;

  const hourSuffix = t('common.hourSuffix');
  const stageName = t(`stage.${stage.id}.name`);
  const stageSummary = t(`stage.${stage.id}.summary`);
  const benefits = tList(`stage.${stage.id}.benefits`);

  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
            {t('stageCard.current')}
          </div>
          <AnimatePresence mode="wait">
            <motion.h2
              key={stage.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-xl font-semibold tracking-tight"
            >
              {stageName}
            </motion.h2>
          </AnimatePresence>
        </div>
        <div className="text-right text-xs text-ink-dim">
          <div>
            {stage.rangeHours[0]}
            {hourSuffix}
            {stage.rangeHours[1] === Infinity
              ? '+'
              : `–${stage.rangeHours[1]}${hourSuffix}`}
          </div>
          {next && stageSpan && (
            <div>
              {t('stageCard.next', { name: t(`stage.${next.id}.name`) })}
            </div>
          )}
        </div>
      </div>

      {stageSpan && (
        <div className="mt-3 h-1.5 rounded-full bg-line/80 overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={false}
            animate={{ width: `${stageProgress * 100}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 22 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.p
          key={stage.id + '-summary'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="mt-3 text-sm text-ink-dim leading-relaxed"
        >
          {stageSummary}
        </motion.p>
      </AnimatePresence>

      <ul className="mt-3 grid gap-1.5">
        {benefits.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-sm text-ink"
          >
            <span
              aria-hidden
              className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
