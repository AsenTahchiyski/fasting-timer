import { motion } from 'framer-motion';

interface Props {
  size?: number;
  thickness?: number;
  progress: number; // 0..1, can be > 1 (over-goal); we clamp visual to 1 and indicate via halo
  pulsing?: boolean;
  children?: React.ReactNode;
}

export function ProgressRing({
  size = 280,
  thickness = 14,
  progress,
  pulsing,
  children
}: Props) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const over = progress > 1;

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      aria-label="Fasting progress"
      role="img"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0.65" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--line))"
          strokeWidth={thickness}
          opacity={0.8}
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ type: 'spring', stiffness: 70, damping: 20 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter={over ? 'url(#glow)' : undefined}
        />

        {pulsing && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgb(var(--accent))"
            strokeWidth={thickness * 0.5}
            initial={{ opacity: 0.0 }}
            animate={{ opacity: [0.0, 0.35, 0.0], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
