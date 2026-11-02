'use client';

import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { FIELD_STYLE } from '@/components/bits/field-style';
import { usePlayerMotion } from '@/components/player/player-speed';
import { UI_CH34 } from '@/content/lesson/ui-ch34';
import { cn } from '@/lib/utils';

export type WordField = 'sign' | 'exp' | 'sig';

export interface WordFill {
  sign: string | null;
  exp: string | null;
  sig: string | null;
}

const KIND = { sign: 'sign', exp: 'exp', sig: 'frac' } as const;
/** Bit numbers of the first and last cell of each field. */
const ENDS: Record<WordField, [number, number]> = { sign: [31, 31], exp: [30, 23], sig: [22, 0] };
const LEN: Record<WordField, number> = { sign: 1, exp: 8, sig: 23 };

/**
 * A 32-bit float word for chapters 3-4. Every field can be grey (not explained yet), coloured,
 * or empty (bits not filled yet). Phones show Sign + Exponent on the first row and the
 * Significand on the second row; wide screens show one row.
 */
export function Word32({
  fill,
  colored = { sign: true, exp: true, sig: true },
  focus,
  hiddenBit = false,
  indices = true,
  testId = 'word',
  className,
}: {
  fill: WordFill;
  colored?: Record<WordField, boolean>;
  focus?: WordField | null;
  /** Show the "1." that is not stored, dashed, in front of the significand. */
  hiddenBit?: boolean;
  indices?: boolean;
  testId?: string;
  className?: string;
}) {
  const { d } = usePlayerMotion();
  const group = (field: WordField) => {
    const on = colored[field];
    const s = FIELD_STYLE[on ? KIND[field] : 'plain'];
    const value = fill[field];
    const n = LEN[field];
    return (
      <div
        className={cn('flex min-w-0 flex-col gap-0.5', field === 'sig' && 'w-full lg:w-auto')}
        data-testid={`${testId}-${field}`}
        data-colored={on ? '1' : '0'}
      >
        <span
          className={cn(
            'h-4 text-xs font-semibold whitespace-nowrap transition-opacity',
            FIELD_STYLE[KIND[field]].text,
            on ? 'opacity-100' : 'opacity-0',
          )}
        >
          {field === 'sign' ? 'S' : FIELD_STYLE[KIND[field]].label}
          <span className="ml-1 font-normal text-muted">
            {n} {UI_CH34.bits}
          </span>
        </span>
        <div className="flex items-start gap-0.5">
          {field === 'sig' && hiddenBit && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: d(0.4) }}
              className="num mr-0.5 grid h-7 shrink-0 place-items-center rounded-md border border-dashed border-bit-frac px-1 font-mono text-xs font-bold text-bit-frac-ink opacity-70"
              data-testid={`${testId}-hidden`}
              title={UI_CH34.hiddenBit}
            >
              1.
            </motion.span>
          )}
          <div
            className={cn(
              'flex min-w-0 flex-col gap-0.5',
              field === 'sig' && 'flex-1 lg:flex-none',
            )}
          >
            <div
              className={cn(
                'grid gap-px sm:gap-0.5',
                field === 'sig'
                  ? 'grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:grid-cols-[repeat(var(--n),1.5rem)]'
                  : 'grid-cols-[repeat(var(--n),1.35rem)] sm:grid-cols-[repeat(var(--n),1.5rem)]',
              )}
              style={{ '--n': n } as CSSProperties}
            >
              {Array.from({ length: n }, (_, k) => {
                const c = value?.[k];
                return (
                  <span
                    key={k}
                    className={cn(
                      'relative grid h-7 min-w-0 place-items-center rounded-md border-b-2 font-mono text-[0.7rem] leading-none transition-colors duration-500 sm:text-xs',
                      s.border,
                      s.text,
                      c === '1' ? cn(s.on, 'font-bold') : s.off,
                      focus === field && 'ring-2 ring-sky-400',
                    )}
                  >
                    {c !== undefined && (
                      <motion.span
                        key={`${field}-${k}-${c}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: d(0.3), delay: d(Math.min(k, 23) * 0.015) }}
                      >
                        {c}
                      </motion.span>
                    )}
                  </span>
                );
              })}
            </div>
            {indices && (
              <span className="num flex justify-between px-0.5 font-mono text-[0.65rem] text-muted">
                <span>{ENDS[field][0]}</span>
                {n > 1 && <span>{ENDS[field][1]}</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div
      className={cn('flex flex-wrap gap-x-2 gap-y-1 lg:flex-nowrap', className)}
      data-testid={testId}
    >
      <div className="flex gap-2">
        {group('sign')}
        {group('exp')}
      </div>
      {group('sig')}
    </div>
  );
}
