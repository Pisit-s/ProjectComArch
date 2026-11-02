'use client';

import { useStageSpring } from '@/components/player/player-speed';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { FIELD_STYLE } from '@/components/bits/field-style';

export type DigitRole = 'int' | 'hidden' | 'frac' | 'grs' | 'tail' | 'plain' | 'lsb';

const ROLE_CLASS: Record<DigitRole, string> = {
  int: 'text-ink',
  hidden: cn(
    FIELD_STYLE.hidden.text,
    'underline decoration-dashed decoration-1 underline-offset-4',
  ),
  frac: FIELD_STYLE.frac.text,
  grs: cn(FIELD_STYLE.grs.text, 'bg-bit-grs/14 rounded-sm font-bold'),
  tail: cn(FIELD_STYLE.grs.text, 'opacity-60'),
  plain: 'text-ink',
  lsb: cn(FIELD_STYLE.frac.text, 'bg-bit-frac/14 rounded-sm font-bold'),
};

export interface BitLineProps {
  /** Digits before the point. */
  int: string;
  /** Digits after the point. */
  frac: string;
  /** Number of fraction digits that belong to the kept significand; the next 3 are G/R/S. */
  kept?: number;
  /** Mark the digit right before the point as the hidden bit. */
  hiddenLead?: boolean;
  /** Highlight the last kept digit (LSB). */
  showLsb?: boolean;
  /** Pad the integer part on the left to this many characters (column alignment). */
  intWidth?: number;
  /** Pad the fraction part on the right with spaces to this many characters. */
  fracWidth?: number;
  className?: string;
  /** Unique layout id of the binary point (animates when it moves). */
  pointId?: string;
  testId?: string;
}

/**
 * A fixed-point binary number as one mono line. Digits are coloured by role (hidden bit, fraction,
 * G/R/S, sticky tail). The point is its own element so it can slide (BinaryPoint).
 */
export function BitLine({
  int,
  frac,
  kept,
  hiddenLead = false,
  showLsb = false,
  intWidth,
  fracWidth,
  className,
  pointId,
  testId,
}: BitLineProps) {
  const intPad = intWidth ? Math.max(0, intWidth - int.length) : 0;
  const role = (j: number): DigitRole => {
    if (kept === undefined) return 'plain';
    if (j < kept) return showLsb && j === kept - 1 ? 'lsb' : 'frac';
    if (j < kept + 3) return 'grs';
    return 'tail';
  };
  return (
    <span
      className={cn('num inline-flex font-mono leading-relaxed whitespace-pre', className)}
      data-testid={testId}
    >
      {intPad > 0 && <span aria-hidden>{' '.repeat(intPad)}</span>}
      {[...int].map((c, i) => (
        <span
          key={`i${i}`}
          className={hiddenLead && i === int.length - 1 ? ROLE_CLASS.hidden : ROLE_CLASS.int}
        >
          {c}
        </span>
      ))}
      {frac.length > 0 || fracWidth ? <BinaryPoint id={pointId} /> : null}
      {[...frac].map((c, j) => (
        <span key={`f${j}`} className={ROLE_CLASS[role(j)]}>
          {c}
        </span>
      ))}
      {fracWidth && fracWidth > frac.length && (
        <span aria-hidden>{' '.repeat(fracWidth - frac.length)}</span>
      )}
    </span>
  );
}

export function BinaryPoint({ id }: { id?: string }) {
  const spring = useStageSpring();
  return (
    <motion.span
      layout={id ? 'position' : undefined}
      layoutId={id}
      transition={spring}
      className="font-bold text-primary"
    >
      .
    </motion.span>
  );
}

/** Digits with a point at `pointAt` (number of digits before it). Used to show the point moving. */
export function MovingPoint({
  digits,
  pointAt,
  id,
  className,
  hiddenAt,
}: {
  digits: string;
  pointAt: number;
  id: string;
  className?: string;
  /** Index of the digit drawn as the hidden bit. */
  hiddenAt?: number;
}) {
  return (
    <span className={cn('num inline-flex font-mono whitespace-pre', className)}>
      {[...digits].map((c, i) => (
        <span key={i} className="inline-flex">
          {i === pointAt && <BinaryPoint id={id} />}
          <span
            className={cn(
              i === hiddenAt
                ? ROLE_CLASS.hidden
                : i >= pointAt
                  ? FIELD_STYLE.frac.text
                  : 'text-ink',
            )}
          >
            {c}
          </span>
        </span>
      ))}
      {pointAt >= digits.length && <BinaryPoint id={id} />}
    </span>
  );
}
