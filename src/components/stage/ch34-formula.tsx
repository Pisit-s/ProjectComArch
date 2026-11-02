'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { usePlayerMotion } from '@/components/player/player-speed';
import { cn } from '@/lib/utils';

/** One piece of the formula: its symbol, and the value plugged in once that frame comes. */
export function Piece({
  tone,
  plugged,
  symbol,
  value,
  testId,
}: {
  tone: string;
  plugged: boolean;
  symbol: ReactNode;
  value: ReactNode;
  testId: string;
}) {
  const { d } = usePlayerMotion();
  return (
    <div
      className={cn(
        'flex max-w-full min-w-0 flex-col items-center gap-1 rounded-xl bg-white/80 px-3 py-2 ring-2 transition-shadow',
        tone,
        plugged ? 'shadow-md' : 'ring-1',
      )}
      data-testid={testId}
      data-plugged={plugged ? '1' : '0'}
    >
      <span className="num font-mono text-sm whitespace-nowrap">{symbol}</span>
      <AnimatePresence initial={false}>
        {plugged && (
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: d(0.35) }}
            className="num max-w-full text-center font-mono text-base font-semibold break-all"
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export const Times = () => (
  <span className="self-center font-mono text-lg text-muted" aria-hidden>
    ×
  </span>
);
