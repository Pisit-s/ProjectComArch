'use client';

import { useStageSpring } from '@/components/player/player-speed';
import { ArrowDown, ArrowUp, Check, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import type { RoundDecision } from '@/lib/fp';
import { cn } from '@/lib/utils';

const ICON: Record<RoundDecision, typeof ArrowDown> = {
  exact: Check,
  down: ArrowDown,
  up: ArrowUp,
  'tie-even-down': Scale,
  'tie-even-up': Scale,
};

/**
 * Magnifier frame around LSB, G, R, S with the rounding decision. It is a grid item: the parent
 * grid places it over the four columns, so it never needs to measure anything.
 */
export function GrsLens({
  decision,
  gridColumn,
  gridRow,
  className,
}: {
  decision: RoundDecision;
  gridColumn: string;
  gridRow: number | string;
  className?: string;
}) {
  const Icon = ICON[decision];
  const spring = useStageSpring(0.35);
  return (
    <motion.div
      style={{ gridColumn, gridRow }}
      initial={{ opacity: 0, scale: 1.25 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className={cn(
        'pointer-events-none relative -mx-0.5 -my-1 self-stretch rounded-lg bg-bit-grs/8 ring-2 ring-bit-grs',
        className,
      )}
      data-testid="grs-lens"
      data-decision={decision}
      aria-hidden
    >
      <span
        className={cn(
          'absolute -top-3 -right-3 grid h-6 w-6 place-items-center rounded-full text-white shadow',
          decision === 'exact' ? 'bg-success' : 'bg-bit-grs-ink',
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
    </motion.div>
  );
}
