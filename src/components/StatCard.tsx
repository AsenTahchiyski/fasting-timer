import { motion } from 'framer-motion';

interface Props {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

export function StatCard({ label, value, hint, accent }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-line bg-surface-2 p-4"
    >
      <div className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
        {label}
      </div>
      <div
        className={
          'mt-1 text-2xl font-semibold tracking-tight ' +
          (accent ? 'text-accent' : 'text-ink')
        }
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-ink-dim">{hint}</div>}
    </motion.div>
  );
}
