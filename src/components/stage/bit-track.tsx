'use client';

import { useStageDuration, useStageSpring } from '@/components/player/player-speed';
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties } from 'react';
import type { RoundDecision } from '@/lib/fp';
import type { BitWindow } from '@/lib/lesson/bit-window';
import { GRS, type TrackRow } from '@/lib/lesson/fp-frames';
import { UI } from '@/content/lesson/copy';
import { cn } from '@/lib/utils';
import { ExponentTag } from './exponent-tag';
import { GrsLens } from './grs-lens';
import { StickyBucket } from './sticky-bucket';

type Slot = number | 'gap' | 'point';

export interface BitTrackProps {
  rows: TrackRow[];
  /** Bits after the point in the significand (row values carry GRS more). */
  fracBits: number;
  window: BitWindow;
  /** Draw the magnifier over LSB, G, R, S of this row index. */
  lens?: { row: number; decision: RoundDecision };
  /** Show the sticky bucket under S for the row that is being aligned. */
  bucket?: boolean;
  /** Highlight the row at this index (the one that moves in this frame). */
  focusRow?: number;
  /** Carries of an addition (bit i = carry into column i), drawn above the first row. */
  carries?: bigint;
  /** Highlight the "× 2^e" tags (comparing exponents). */
  expFocus?: boolean;
  className?: string;
  testId?: string;
}

/** Row ids stay the same across frames: A, B, R, then R2 for a second result row. */
function rowIds(rows: TrackRow[]): string[] {
  const seen: Record<string, number> = {};
  return rows.map((r) => {
    seen[r.key] = (seen[r.key] ?? 0) + 1;
    return seen[r.key] === 1 ? r.key : `${r.key}${seen[r.key]}`;
  });
}

/**
 * Rows of binary numbers lined up at the binary point (carry 2^1, hidden bit 2^0, significand,
 * then G R S). Each bit keeps its identity (row + where it started), so when a frame shifts a
 * row the bits slide to their new columns with a layout animation.
 */
export function BitTrack({
  rows,
  fracBits,
  window: win,
  lens,
  bucket = false,
  focusRow,
  carries,
  expFocus = false,
  className,
  testId = 'bit-track',
}: BitTrackProps) {
  const SPRING = useStageSpring();
  const stagger = useStageDuration(0.07);
  const carryAt = (c: number) => carries !== undefined && ((carries >> BigInt(c)) & 1n) === 1n;
  const slots: Slot[] = [];
  for (const c of win.columns) {
    slots.push(c);
    if (c === fracBits) slots.push('point');
  }
  const line = new Map<Slot, number>(slots.map((s, i) => [s, i + 2]));
  const ids = rowIds(rows);
  const expCol = slots.length + 2;
  const style = {
    gridTemplateColumns: `1.5rem repeat(${slots.length}, var(--cell)) auto`,
  } as CSSProperties;

  const roleClass = (c: number, bit: 0 | 1): string => {
    if (c === fracBits + 1) return 'text-carry-ink';
    if (c === fracBits) return 'text-bit-frac-ink underline decoration-dashed underline-offset-4';
    if (c < GRS) return cn('text-bit-grs-ink', bit && 'font-bold');
    return 'text-bit-frac-ink';
  };

  const bucketRow = rows.findIndex((r) => r.shifted > 0 && r.key !== 'R');
  const sCol = line.get(0) ?? expCol - 1;

  return (
    <div
      className={cn(
        'bit-track num grid items-center gap-y-2 font-mono text-[length:var(--bit-size)] [--bit-size:clamp(0.85rem,3.6vw,1.35rem)] [--cell:clamp(0.95rem,3.95vw,1.9rem)]',
        className,
      )}
      style={style}
      data-testid={testId}
      data-mode={win.mode}
    >
      {/* column hints: hidden bit, G R S */}
      {slots.map((s) =>
        s === 'point' || s === 'gap' || carryAt(s) ? null : s < GRS || s === fracBits ? (
          <span
            key={`h${s}`}
            style={{ gridColumn: line.get(s), gridRow: 1 }}
            className={cn(
              'text-center font-sans text-[0.6rem] font-semibold',
              s < GRS ? 'text-bit-grs-ink' : 'text-muted',
            )}
            aria-hidden
          >
            {s === fracBits ? '2⁰' : ['S', 'R', 'G'][s]}
          </span>
        ) : null,
      )}

      {/* carries run from right to left, like the adder in Chapter 1 */}
      {carries !== undefined &&
        slots
          .filter((s): s is number => typeof s === 'number' && carryAt(s))
          .sort((x, y) => x - y)
          .map((c, k) => (
            <motion.span
              key={`carry${c}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: k * stagger }}
              style={{ gridColumn: line.get(c), gridRow: 1 }}
              className="text-center font-sans text-[0.7em] font-bold text-carry-ink"
              data-testid={`${testId}-carry`}
            >
              1
            </motion.span>
          ))}

      {rows.map((row, i) => {
        const id = ids[i];
        const gridRow = i + 2;
        return (
          <div key={id} className="contents" data-testid={`${testId}-row-${id}`}>
            <span
              style={{ gridRow, gridColumn: 1 }}
              className={cn(
                'font-sans text-sm font-semibold',
                focusRow === i ? 'text-primary' : 'text-muted',
              )}
            >
              {row.key}
              <span className="ml-0.5 text-bit-sign-ink">{row.sign ? '−' : '+'}</span>
            </span>
            {focusRow === i && (
              <motion.span
                layoutId={`${testId}-focus`}
                transition={SPRING}
                style={{ gridRow, gridColumn: `2 / ${expCol}` }}
                className="-mx-1 h-full rounded-md bg-primary/8"
                aria-hidden
              />
            )}
            <AnimatePresence initial={false}>
              {slots.map((s) => {
                if (s === 'point') {
                  return (
                    <span
                      key={`${id}-pt`}
                      style={{ gridRow, gridColumn: line.get(s) }}
                      className="text-center font-bold text-primary"
                    >
                      .
                    </span>
                  );
                }
                if (s === 'gap') {
                  return (
                    <span
                      key={`${id}-gap`}
                      style={{ gridRow, gridColumn: line.get(s) }}
                      className="text-center text-muted"
                      aria-hidden
                    >
                      …
                    </span>
                  );
                }
                const bit = ((row.value >> BigInt(s)) & 1n) === 1n ? 1 : 0;
                if (s === fracBits + 1 && bit === 0) return null;
                return (
                  <motion.span
                    key={`${id}-${s + row.shifted}`}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={SPRING}
                    style={{ gridRow, gridColumn: line.get(s) }}
                    className={cn('text-center', roleClass(s, bit))}
                  >
                    {bit}
                  </motion.span>
                );
              })}
            </AnimatePresence>
            <span style={{ gridRow, gridColumn: expCol }} className="pl-1 text-[0.9em] sm:pl-2">
              <ExponentTag
                exp={row.exp}
                testId={`${testId}-exp-${id}`}
                className={cn(
                  'rounded-md px-1 transition-colors',
                  expFocus && 'bg-bit-exp/15 ring-1 ring-bit-exp',
                )}
              />
            </span>
          </div>
        );
      })}

      {lens && line.has(GRS) && line.has(0) && (
        <GrsLens
          decision={lens.decision}
          gridRow={lens.row + 2}
          gridColumn={`${line.get(GRS)} / ${line.get(0)! + 1}`}
        />
      )}

      {win.mode === 'compact' && win.hidden > 0 && (
        <span
          style={{ gridRow: rows.length + (bucket ? 3 : 2), gridColumn: `2 / ${expCol}` }}
          className="justify-self-end rounded-full bg-ice-100 px-2 py-0.5 font-sans text-xs text-muted"
          data-testid={`${testId}-more`}
        >
          + 0 {UI.moreZeros} {win.hidden}
        </span>
      )}

      {bucket && bucketRow >= 0 && (
        <span style={{ gridRow: rows.length + 2, gridColumn: sCol }}>
          <StickyBucket sticky={rows[bucketRow].sticky} testId={`${testId}-sticky`} />
        </span>
      )}
    </div>
  );
}
