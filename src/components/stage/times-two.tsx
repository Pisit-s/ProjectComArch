'use client';

import { ArrowRight, Repeat } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { usePlayerMotion } from '@/components/player/player-speed';
import type { FracRowView } from '@/lib/lesson/encode-frames';
import { UI_CH34 } from '@/content/lesson/ui-ch34';
import { minus } from '@/components/ui/num';
import { cn } from '@/lib/utils';

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

/**
 * "Times two machine" of scene 4.1: each fraction goes in, is doubled, and the digit in front of
 * the point drops into the bit strip on top. With `loop`, rows start..start+length-1 are the part
 * that repeats forever and get an overline in the strip.
 */
export function TimesTwo({
  intBin,
  rows,
  loop,
  testId = 'times-two',
}: {
  intBin: string;
  rows: FracRowView[];
  /** 1-based first repeating row and the period. */
  loop?: { start: number; length: number };
  testId?: string;
}) {
  const { d } = usePlayerMotion();
  const inLoop = (k: number) => !!loop && k + 1 >= loop.start && k + 1 < loop.start + loop.length;
  const last = rows.length - 1;
  return (
    <div className="space-y-3" data-testid={testId}>
      {/* bit strip: integer part, the point, then one bit per row */}
      <div
        className="num flex flex-wrap items-end justify-center gap-y-1 font-mono text-[clamp(1.25rem,6vw,1.9rem)]"
        data-testid={`${testId}-strip`}
      >
        <span className="text-ink">{intBin}</span>
        <span className="font-bold text-primary">.</span>
        {rows.map((r, k) => (
          <motion.span
            key={k}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: d(0.35) }}
            className={cn(
              'min-w-[0.7em] text-center',
              r.bit === 1 ? 'font-bold text-bit-frac-ink' : 'text-ink/70',
              inLoop(k) && 'border-t-2 border-bit-grs',
            )}
          >
            {r.bit}
          </motion.span>
        ))}
        <span className="whitespace-nowrap">
          {loop && <span className="text-muted">…</span>}
          <sub className="ml-0.5 text-[0.5em] text-muted">2</sub>
        </span>
      </div>

      <ol className="mx-auto w-max max-w-full space-y-1">
        <AnimatePresence initial={false}>
          {rows.map((r, k) => {
            const now = k === last && !loop;
            return (
              <motion.li
                key={k}
                layout="position"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: k === last || loop ? 1 : 0.6, x: 0 }}
                transition={SPRING}
                className={cn(
                  'num grid grid-cols-[3.6rem_auto_3.2rem_auto_1.6rem] items-center gap-x-1.5 rounded-lg px-2 py-0.5 font-mono text-sm sm:text-base',
                  now && 'bg-white ring-2 ring-sky-400',
                  inLoop(k) && 'bg-bit-grs/10',
                  loop && k + 1 === loop.start + loop.length && 'ring-2 ring-bit-grs',
                )}
                data-testid={`${testId}-row`}
              >
                <span className="text-right">{minus(r.f)}</span>
                <span className="text-muted">× 2 =</span>
                <span>{minus(r.d)}</span>
                <ArrowRight className="h-4 w-4 text-muted" aria-hidden />
                <b
                  className={cn(
                    'grid h-6 w-6 place-items-center rounded-md',
                    r.bit === 1 ? 'bg-bit-frac/15 text-bit-frac-ink' : 'bg-ice-100 text-ink/70',
                  )}
                >
                  {r.bit}
                </b>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      {loop && (
        <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-bit-grs-ink">
          <Repeat className="h-4 w-4" aria-hidden />
          {UI_CH34.repeat}
        </p>
      )}
    </div>
  );
}
