'use client';

import { motion } from 'motion/react';
import type { RoundLine as RoundLineModel } from '@/lib/lesson/round-line';
import { cn } from '@/lib/utils';

const SPRING = { type: 'spring', stiffness: 260, damping: 30 } as const;

/** Exact position in [0, 1] as a Number, only for placing pixels. */
const toUnit = (pos: RoundLineModel['pos']): number =>
  Number((pos.num * 10_000n) / pos.den) / 10_000;

/**
 * Number line of scene 5.4: the two storable values around the exact result, the result as a dot,
 * then an arrow to the value that rounding picks. `stage` reveals the parts one at a time.
 */
export function RoundLine({
  line,
  stage = 3,
  downLabel,
  upLabel,
  className,
  testId = 'round-line',
}: {
  line: RoundLineModel;
  /** 0 ticks · 1 + exact dot · 2 + halfway mark · 3 + arrow to the chosen value */
  stage?: 0 | 1 | 2 | 3;
  downLabel: string;
  upLabel: string;
  className?: string;
  testId?: string;
}) {
  const L = 24;
  const R = 296;
  const x = L + (R - L) * toUnit(line.pos);
  const target = line.chosen === 'down' ? L : R;
  return (
    <svg
      viewBox="0 0 320 112"
      className={cn('w-full overflow-visible', className)}
      role="img"
      aria-label={`${downLabel} ${line.down} · ${upLabel} ${line.up}`}
      data-testid={testId}
      data-chosen={line.chosen}
    >
      <line x1={L} x2={R} y1={56} y2={56} className="stroke-line" strokeWidth={3} />
      {[L, R].map((tx, i) => (
        <g key={tx}>
          <line
            x1={tx}
            x2={tx}
            y1={42}
            y2={70}
            strokeWidth={3}
            className={cn(
              stage === 3 && (i === 0) === (line.chosen === 'down')
                ? 'stroke-primary'
                : 'stroke-ink',
            )}
          />
          <text
            x={tx}
            y={90}
            textAnchor="middle"
            className="fill-muted font-sans text-[11px] font-semibold"
          >
            {i === 0 ? downLabel : upLabel}
          </text>
        </g>
      ))}
      {stage >= 2 && (
        <motion.line
          x1={(L + R) / 2}
          x2={(L + R) / 2}
          y1={48}
          y2={64}
          strokeDasharray="3 3"
          strokeWidth={2}
          className="stroke-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      {stage >= 1 && (
        <motion.circle
          r={7}
          cy={56}
          initial={{ cx: (L + R) / 2, opacity: 0 }}
          animate={{ cx: x, opacity: 1 }}
          transition={SPRING}
          className="fill-bit-grs"
          data-testid={`${testId}-dot`}
        />
      )}
      {stage >= 3 && (
        <motion.path
          d={`M ${x} 40 Q ${(x + target) / 2} 8 ${target} 36`}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="stroke-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}
    </svg>
  );
}
