import { motion } from 'framer-motion';
import { cx } from '../lib/cx';
import { useT } from '../lib/i18n';

export type TabId = 'timer' | 'history' | 'settings';

interface TabDef {
  id: TabId;
  labelKey: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  {
    id: 'timer',
    labelKey: 'tab.timer',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2" />
        <path d="M9 2h6" />
      </svg>
    )
  },
  {
    id: 'history',
    labelKey: 'tab.history',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
        <path d="M12 8v5l3 2" />
      </svg>
    )
  },
  {
    id: 'settings',
    labelKey: 'tab.settings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4 16.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.1l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    )
  }
];

interface Props {
  active: TabId;
  onSelect: (id: TabId) => void;
}

export function TabBar({ active, onSelect }: Props) {
  const t = useT();
  return (
    <nav
      aria-label="Primary"
      className="tab-bar fixed bottom-0 inset-x-0 z-30"
    >
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="glass border border-line rounded-2xl shadow-[0_-2px_30px_-10px_rgb(0_0_0/0.2)] flex">
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelect(tab.id)}
                className={cx(
                  'relative flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs font-medium',
                  isActive ? 'text-accent' : 'text-ink-dim'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-1 rounded-xl bg-[rgb(var(--accent)/0.12)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative">{tab.icon}</span>
                <span className="relative">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
