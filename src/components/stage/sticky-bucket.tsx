'use client';

import { useStageSpring } from '@/components/player/player-speed';
import { motion } from 'motion/react';
import type { Bit } from '@/lib/fp';
import { cn } from '@/lib/utils';

/** Small bucket under the S column: becomes 1 once any 1 bit has fallen past it. */
export function StickyBucket({
  sticky,
  className,
  testId,
}: {
  sticky: Bit;
  className?: string;
  testId?: string;
}) {
  const spring = useStageSpring(0.3);
  return (
    <span
      className={cn('relative inline-flex h-7 w-full items-end justify-center', className)}
      data-testid={testId}
      data-sticky={sticky}
    >
      <svg viewBox="0 0 24 20" className="absolute inset-x-0 bottom-0 mx-auto h-6 w-6" aria-hidden>
        <path
          d="M3 3 L6 18 H18 L21 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          className="text-bit-grs"
        />
      </svg>
      <motion.span
        key={sticky}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="num relative mb-0.5 font-mono text-xs font-bold text-bit-grs-ink"
      >
        {sticky}
      </motion.span>
    </span>
  );
}
