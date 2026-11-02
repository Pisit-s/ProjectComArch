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
  const control = (label: string, value: 0 | 1, y: number, id: string) => (
    <g>
      <text x={0} y={y + 4} className="fill-carry-ink font-sans text-[11px] font-semibold">
        {label}
      </text>
      <motion.text
        key={value}
        x={56}
        y={y + 4}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('font-mono text-[13px] font-bold', value ? 'fill-carry-ink' : 'fill-muted')}
        data-testid={`${testId}-${id}`}
      >
        {value}
      </motion.text>
      {/* ends on the slanted left edge of the ALU */}
      <line
        x1={68}
        x2={90 + ((y - 14) * 18) / 66}
        y1={y}
        y2={y}
        className="stroke-carry"
        strokeWidth={2}
      />
    </g>
  );
  return (
    <svg
      viewBox="0 0 200 104"
      className={cn('w-44 overflow-visible', className)}
      role="img"
      aria-label={`ALU Binvert ${binvert} CarryIn ${carryIn}`}
      data-testid={testId}
    >
      <path
        d="M90 14 L196 14 L178 80 L152 80 L143 70 L134 80 L108 80 Z"
        strokeWidth={2.5}
        strokeLinejoin="round"
        className={cn(active ? 'fill-primary/10 stroke-primary' : 'fill-white stroke-ink')}
      />
      <text x={143} y={48} textAnchor="middle" className="fill-ink font-sans text-[15px] font-bold">
        ALU
      </text>
      <line x1={118} x2={118} y1={0} y2={14} className="stroke-ink" strokeWidth={2} />
      <line x1={168} x2={168} y1={0} y2={14} className="stroke-ink" strokeWidth={2} />
      <text x={112} y={9} textAnchor="end" className="fill-muted font-mono text-[11px]">
        A
      </text>
      <text x={174} y={9} className="fill-muted font-mono text-[11px]">
        B
      </text>
      {control('Binvert', binvert, 34, 'binvert')}
      {control('CarryIn', carryIn, 60, 'carryin')}
      <line x1={143} x2={143} y1={76} y2={102} className="stroke-ink" strokeWidth={2} />
    </svg>
  );
}
