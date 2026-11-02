'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';
import { BINARY32 } from '@/lib/fp';
import { type HeroRow, buildHeroTeaser } from '@/lib/lesson/sci-frames';
import { HERO } from '@/content/lesson/copy';
import { MAIN } from '@/content/lesson/examples';
import { FIELD_STYLE } from '@/components/bits/field-style';
import { StepPlayer } from '@/components/player/step-player';
import { cn } from '@/lib/utils';

// Owner: addsub-ch12 (docs/PARALLEL.md).

const STEPS = [
  { id: 'decimal', title: 'decimal', caption: HERO.steps.decimal },
  { id: 'operands', title: 'operands', caption: HERO.steps.operands },
  { id: 'sum', title: 'sum', caption: HERO.steps.sum },
];

const fieldOf = (i: number) =>
  i === 0 ? FIELD_STYLE.sign : i <= BINARY32.expBits ? FIELD_STYLE.exp : FIELD_STYLE.frac;

/** 32 thin cells coloured by field, with the hex under them. */
function Strip({ row, k }: { row: HeroRow; k: number }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="flex gap-px" aria-hidden>
        {[...row.bits].map((b, i) => (
          <span
            key={i}
            className={cn(
              'grid h-5 min-w-0 flex-1 place-items-center rounded-[2px] font-mono text-[0.55rem] leading-none sm:text-[0.65rem]',
              fieldOf(i).on,
              fieldOf(i).text,
              (i === 1 || i === 1 + BINARY32.expBits) && 'ml-0.5',
            )}
          >
            {b}
          </span>
        ))}
      </span>
      <span className="num font-mono text-sm font-semibold text-ink" data-testid={`hero-hex-${k}`}>
        {row.hex}
      </span>
    </span>
  );
}

function TeaserStage({ rows, index }: { rows: HeroRow[]; index: number }) {
  // operands turn into bits at step 1, the sum at step 2
  const asBits = (k: number) => index >= (k < 2 ? 1 : 2);
  return (
    <div className="flex flex-col gap-2" data-testid="hero-stage" style={{ perspective: 600 }}>
      {rows.map((r, k) => (
        <div key={k} className="flex h-11 items-center gap-2">
          <span className="w-4 shrink-0 text-center font-mono text-xl text-muted">
            {k === 1 ? '+' : k === 2 ? '=' : ''}
          </span>
          {/* flip by rotation only: no half-faded text, and the first step shows at once */}
          <motion.div
            key={asBits(k) ? 'bits' : 'dec'}
            initial={index === 0 ? false : { rotateX: -90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.45, delay: asBits(k) ? 0.12 * k : 0 }}
            className="flex min-w-0 flex-1 items-center"
          >
            {asBits(k) ? (
              <Strip row={r} k={k} />
            ) : (
              <span
                className={cn(
                  'num font-mono text-[clamp(1.5rem,6vw,2rem)] leading-tight font-semibold',
                  k === 2 && 'text-primary',
                )}
                data-testid={`hero-dec-${k}`}
              >
                {r.text}
              </span>
            )}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/**
 * Hero teaser (PLAN.md 3.1): 6.5 + 3.75 = 10.25 flips into three 32-bit words. Plays once by
 * itself after load; with reduced motion it shows the last step at once and does not play.
 */
export function HeroTeaser() {
  const reduced = useReducedMotion() ?? false;
  const rows = useMemo(() => buildHeroTeaser(BINARY32, MAIN.a, MAIN.b), []);
  return (
    <StepPlayer
      key={reduced ? 'still' : 'play'}
      steps={STEPS}
      label={HERO.teaser}
      autoPlay={!reduced}
      initialStep={reduced ? STEPS.length - 1 : 0}
      poster={false}
      testId="hero-teaser"
      minHeight="10.25rem"
      render={(i) => <TeaserStage rows={rows} index={i} />}
    />
  );
}
