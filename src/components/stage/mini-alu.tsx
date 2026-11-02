'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * ALU as a black box with the two control inputs used for subtraction: Binvert (flip B) and
 * CarryIn (+1). Subtracting sets both to 1: A + not B + 1 = A − B.
 */
export function MiniAlu({
  binvert,
  carryIn,
  active = false,
  className,
  testId = 'mini-alu',
}: {
  binvert: 0 | 1;
  carryIn: 0 | 1;
  active?: boolean;
  className?: string;
  testId?: string;
}) {
  const on = (v: 0 | 1) => (v ? 'fill-carry-ink' : 'fill-muted');
  return (
    <svg
      viewBox="0 0 160 120"
      className={cn('w-40 overflow-visible', className)}
      role="img"
      aria-label={`ALU Binvert ${binvert} CarryIn ${carryIn}`}
      data-testid={testId}
    >
      <motion.path
        d="M20 20 L140 20 L120 92 L90 92 L80 80 L70 92 L40 92 Z"
        strokeWidth={2.5}
        strokeLinejoin="round"
        initial={false}
        animate={{ opacity: active ? 1 : 0.85 }}
        className={cn(active ? 'fill-primary/10 stroke-primary' : 'fill-white stroke-ink')}
      />
      <text x={80} y={52} textAnchor="middle" className="fill-ink font-sans text-[15px] font-bold">
        ALU
      </text>
      {/* A and B inputs */}
      <line x1={50} x2={50} y1={2} y2={20} className="stroke-ink" strokeWidth={2} />
      <line x1={110} x2={110} y1={2} y2={20} className="stroke-ink" strokeWidth={2} />
      <text x={42} y={12} textAnchor="end" className="fill-muted font-mono text-[11px]">
        A
      </text>
      <text x={118} y={12} className="fill-muted font-mono text-[11px]">
        B
      </text>
      {/* control inputs from the left */}
      <line x1={0} x2={28} y1={38} y2={38} className="stroke-carry" strokeWidth={2} />
      <line x1={0} x2={34} y1={64} y2={64} className="stroke-carry" strokeWidth={2} />
      <text x={0} y={33} className="fill-carry-ink font-sans text-[10px] font-semibold">
        Binvert
      </text>
      <text x={0} y={59} className="fill-carry-ink font-sans text-[10px] font-semibold">
        CarryIn
      </text>
      <motion.text
        key={`bi${binvert}`}
        x={36}
        y={42}
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 42 }}
        className={cn('font-mono text-[12px] font-bold', on(binvert))}
        data-testid={`${testId}-binvert`}
      >
        {binvert}
      </motion.text>
      <motion.text
        key={`ci${carryIn}`}
        x={42}
        y={68}
        initial={{ opacity: 0, y: 62 }}
        animate={{ opacity: 1, y: 68 }}
        className={cn('font-mono text-[12px] font-bold', on(carryIn))}
        data-testid={`${testId}-carryin`}
      >
        {carryIn}
      </motion.text>
      {/* output */}
      <line x1={80} x2={80} y1={92} y2={116} className="stroke-ink" strokeWidth={2} />
    </svg>
  );
}
