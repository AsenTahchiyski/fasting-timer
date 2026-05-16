import { motion } from 'framer-motion';
import { cx } from '../lib/cx';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<Option<T>>;
  ariaLabel?: string;
  id?: string;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  id
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      id={id}
      className="relative flex p-1 rounded-xl bg-surface border border-line"
    >
      {options.map((o) => {
        const isActive = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(o.value)}
            className={cx(
              'relative flex-1 h-9 text-sm font-medium rounded-lg transition-colors',
              isActive ? 'text-accent-contrast' : 'text-ink-dim'
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`seg-${id ?? ariaLabel ?? 'group'}`}
                className="absolute inset-0 rounded-lg bg-accent"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
