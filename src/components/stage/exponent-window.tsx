'use client';

import { motion, useReducedMotion } from 'motion/react';
import { type ExponentWindow as Model, WINDOW_SIDE } from '@/lib/lesson/window';
import { UI_CH34 } from '@/content/lesson/ui-ch34';
import { cn } from '@/lib/utils';

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;
const SEGMENTS = 2 * WINDOW_SIDE + 1;
const W = 100 / SEGMENTS;

/**
 * Exponent window of scene 3.2: a log number line cut into ranges [2^k, 2^(k+1)), each the same
 * width. The exponent picks the lit range (changing it slides the line by whole ranges, × 2 or
 * ÷ 2) and the significand moves the pin inside it. Labels come from the window model.
 */
export function ExponentWindow({ win, testId = 'exp-window' }: { win: Model; testId?: string }) {
  const reduced = useReducedMotion() ?? false;
  const t = reduced ? { duration: 0 } : SPRING;
  // pixel placement only: where the significand puts the pin inside the lit range
  const at = Number(win.pos.num) / Number(win.pos.den);
  const ks = Array.from(
    { length: SEGMENTS + 2 * WINDOW_SIDE },
    (_, i) => win.e - 2 * WINDOW_SIDE + i,
  );
  const label = new Map(win.ticks.map((tk) => [tk.k, tk.label]));
  return (
    <div className="space-y-1" data-testid={testId} data-e={win.e}>
      <div className="relative h-16 overflow-hidden rounded-xl bg-white/70 ring-1 ring-line">
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ x: `${(WINDOW_SIDE - win.e) * W}%` }}
          transition={t}
        >
          {ks.map((k) => {
            const lit = k === win.e;
            return (
              <div
                key={k}
                className={cn(
                  'absolute inset-y-2 border-l-2 transition-colors duration-300',
                  lit ? 'rounded-md border-bit-exp bg-bit-exp/15' : 'border-line',
                )}
                style={{ left: `${k * W}%`, width: `${W}%` }}
              >
                <span
                  className={cn(
                    'num absolute bottom-0.5 left-1 font-mono text-[0.7rem] whitespace-nowrap',
                    lit ? 'font-semibold text-bit-exp-ink' : 'text-muted',
                  )}
                >
                  {label.get(k) ?? ''}
                </span>
              </div>
            );
          })}
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-0 w-full"
          initial={false}
          animate={{ x: `${(WINDOW_SIDE + at) * W}%` }}
          transition={t}
          aria-hidden
        >
          <span className="absolute top-1 -ml-2 h-0 w-0 border-x-8 border-t-[10px] border-x-transparent border-t-bit-frac" />
          <span className="absolute top-2 bottom-5 -ml-px w-0.5 bg-bit-frac" />
        </motion.div>
      </div>
      <p className="flex justify-between text-xs text-muted">
        <span className="text-bit-exp-ink">
          {UI_CH34.range} [{win.lo}, {win.hi})
        </span>
        <span className="text-bit-frac-ink">{UI_CH34.pin}</span>
      </p>
    </div>
  );
}
