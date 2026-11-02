'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Curved arrow from one column to the next one on the left: the carry moving over. */
export function CarryArc({
  active = true,
  className,
  testId,
}: {
  active?: boolean;
  className?: string;
  testId?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 16"
      className={cn('h-4 w-10 overflow-visible text-carry', className)}
      aria-hidden
      data-testid={testId}
    >
      <motion.path
        d="M34 14 C30 2, 10 2, 6 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
      <motion.path
        d="M3 10 L6 14 L10 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ delay: active ? 0.35 : 0, duration: 0.15 }}
      />
    </svg>
  );
}
