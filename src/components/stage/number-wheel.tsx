'use client';

import { CircleCheck, TriangleAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { usePlayerMotion } from '@/components/player/player-speed';
import { cn } from '@/lib/utils';

const C = 150;
const STEP = 360 / 16;
const RING = 100;

/** Point on the wheel: angle in degrees, clockwise from the top. */
const at = (deg: number, r: number) => {
  const t = (deg * Math.PI) / 180;
  return { x: C + r * Math.sin(t), y: C - r * Math.cos(t) };
};

/** Arc along the ring from one angle to another (clockwise when to > from). */
function arcPath(from: number, to: number, r: number): string {
  const a = at(from, r);
  const b = at(to, r);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  const sweep = to > from ? 1 : 0;
  return `M${a.x} ${a.y} A${r} ${r} 0 ${large} ${sweep} ${b.x} ${b.y}`;
}

export const minus = (s: string | number): string => String(s).replace('-', '−');

/**
 * 4-bit two's complement wheel (slide w03c pages 4-9): 16 slots clockwise from 0000, a red seam
 * between the largest and the smallest value, and a pin that walks b slots. Adding walks
 * clockwise, a negative b walks back. Crossing the seam is an overflow.
 */
export function NumberWheel({
  slots,
  max,
  from,
  to,
  walk,
  showPin,
  status,
  okLabel,
  overflowLabel,
  emphasizeRange = false,
  testId = 'wheel',
}: {
  /** Signed value and bits of each slot, slot k = bit pattern k. */
  slots: { value: number; bits: string }[];
  /** Largest value (the seam sits between it and the smallest). */
  max: number;
  /** Slot the pin starts at. */
  from: number;
  /** Slot of the result (from the model). */
  to: number;
  /** Slots walked so far (+ clockwise, − counter-clockwise). */
  walk: number;
  showPin: boolean;
  status: 'ok' | 'overflow' | null;
  okLabel: string;
  overflowLabel: string;
  /** Light up the two halves (0 … max and min … −1). */
  emphasizeRange?: boolean;
  testId?: string;
}) {
  const { d } = usePlayerMotion();
  const seamAfter = slots.findIndex((s) => s.value === max);
  const seam = (seamAfter + 0.5) * STEP;
  const end = to;
  const angle = from * STEP + walk * STEP;
  const overflow = status === 'overflow';
  const s0 = at(seam, RING - 22);
  const s1 = at(seam, RING + 14);
  const nonNeg = arcPath(-STEP / 2 + 2, seam - 2, RING);
  const neg = arcPath(seam + 2, 360 - STEP / 2 - 2, RING);

  return (
    <svg
      viewBox="0 0 300 300"
      className="mx-auto w-full max-w-[22rem] overflow-visible"
      role="img"
      aria-label={`${minus(slots[from].value)} → ${minus(slots[end].value)}`}
      data-testid={testId}
    >
      <motion.circle
        cx={C}
        cy={C}
        r={RING}
        fill="none"
        strokeWidth={14}
        className={overflow ? 'stroke-error/25' : 'stroke-ice-100'}
        initial={false}
        animate={{ opacity: overflow ? [1, 0.35, 1, 0.35, 1] : 1 }}
        transition={{ duration: d(1.1) }}
      />
      <path
        d={nonNeg}
        fill="none"
        strokeWidth={14}
        strokeLinecap="round"
        className={cn(
          'stroke-primary transition-opacity',
          emphasizeRange ? 'opacity-30' : 'opacity-0',
        )}
      />
      <path
        d={neg}
        fill="none"
        strokeWidth={14}
        strokeLinecap="round"
        className={cn(
          'stroke-bit-sign transition-opacity',
          emphasizeRange ? 'opacity-30' : 'opacity-0',
        )}
      />

      {/* walked path */}
      {showPin && walk !== 0 && (
        <motion.path
          key={`${from}/${walk}`}
          d={arcPath(from * STEP, angle, RING)}
          fill="none"
          strokeWidth={5}
          strokeLinecap="round"
          className={overflow ? 'stroke-error' : 'stroke-primary'}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: d(1.2), ease: 'easeInOut' }}
          data-testid={`${testId}-trail`}
        />
      )}

      {slots.map((s, k) => {
        const v = at(k * STEP, RING + 30);
        const b = at(k * STEP, RING - 34);
        const dot = at(k * STEP, RING);
        const isEnd = status !== null && k === end;
        return (
          <g key={s.bits}>
            <circle
              cx={dot.x}
              cy={dot.y}
              r={isEnd ? 6 : 3.5}
              className={isEnd ? (overflow ? 'fill-error' : 'fill-primary') : 'fill-ink/35'}
            />
            <text
              x={v.x}
              y={v.y + 5}
              textAnchor="middle"
              className={cn(
                'font-mono text-[15px]',
                isEnd ? (overflow ? 'fill-error font-bold' : 'fill-primary font-bold') : 'fill-ink',
              )}
            >
              {minus(s.value)}
            </text>
            <text
              x={b.x}
              y={b.y + 3.5}
              textAnchor="middle"
              className={cn('font-mono text-[10px]', isEnd ? 'fill-ink font-bold' : 'fill-muted')}
            >
              {s.bits}
            </text>
          </g>
        );
      })}

      {/* the seam between max and min */}
      <line
        x1={s0.x}
        y1={s0.y}
        x2={s1.x}
        y2={s1.y}
        strokeWidth={4}
        strokeLinecap="round"
        className="stroke-error"
        data-testid={`${testId}-seam`}
      />

      {/* pin: the invisible disc makes the group's box the whole wheel so it turns about the centre */}
      <motion.g
        initial={false}
        animate={{ rotate: angle, opacity: showPin ? 1 : 0 }}
        transition={{ duration: d(1.2), ease: 'easeInOut' }}
      >
        <circle cx={C} cy={C} r={C} fill="transparent" />
        <path
          d={`M${C - 9} ${C - RING + 22} L${C} ${C - RING + 7} L${C + 9} ${C - RING + 22} Z`}
          strokeLinejoin="round"
          strokeWidth={2}
          className={overflow ? 'fill-error stroke-error' : 'fill-ink stroke-ink'}
          data-testid={`${testId}-pin`}
        />
      </motion.g>

      {status && (
        <foreignObject x={C - 50} y={C - 24} width={100} height={48}>
          <div
            className={cn(
              'flex h-full flex-col items-center justify-center font-sans text-[12px] leading-tight font-semibold',
              overflow ? 'text-error' : 'text-primary',
            )}
            data-testid={`${testId}-status`}
            data-status={status}
          >
            <span className="flex items-center gap-1">
              {overflow ? (
                <TriangleAlert className="h-4 w-4" aria-hidden />
              ) : (
                <CircleCheck className="h-4 w-4" aria-hidden />
              )}
              {overflow ? overflowLabel : okLabel}
            </span>
            <span className="num font-mono text-ink" data-testid={`${testId}-result`}>
              {slots[end].bits} = {minus(slots[end].value)}
            </span>
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
