import { motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = [
  '#FFD166',
  '#06D6A0',
  '#EF476F',
  '#118AB2',
  '#FF6B6B',
  '#FFE66D',
  '#A78BFA'
];

interface Props {
  count?: number;
  duration?: number;
}

export function Confetti({ count = 70, duration = 2.6 }: Props) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const shape = i % 3;
        const size = 6 + Math.random() * 6;
        return {
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.4,
          dur: duration + Math.random() * 0.9,
          color: COLORS[i % COLORS.length],
          rotateStart: Math.random() * 360,
          rotateEnd: Math.random() * 720 - 360,
          drift: (Math.random() - 0.5) * 120,
          width: size,
          height: shape === 1 ? size * 1.6 : shape === 2 ? size * 0.7 : size,
          borderRadius: shape === 2 ? '50%' : '2px'
        };
      }),
    [count, duration]
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: '-10vh', x: 0, rotate: p.rotateStart, opacity: 1 }}
          animate={{
            y: '110vh',
            x: p.drift,
            rotate: p.rotateEnd,
            opacity: [1, 1, 0]
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
            display: 'block'
          }}
        />
      ))}
    </div>
  );
}
