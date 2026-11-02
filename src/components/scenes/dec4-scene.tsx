'use client';

import { useStageDuration, useStageSpring } from '@/components/player/player-speed';
import { motion } from 'motion/react';
import { buildDec4Frames } from '@/lib/lesson/sci-frames';
import { caption } from '@/content/lesson/captions';
import { UI } from '@/content/lesson/copy';
import { DEC4 } from '@/content/lesson/examples';
import { StepPlayer } from '@/components/player/step-player';
import { CarryHop } from '@/components/stage/carry-arc';
import { ExponentTag } from '@/components/stage/exponent-tag';
import { cn } from '@/lib/utils';

/** Digit places shown: 10^1 down to 10^-5. */
const POWERS = [1, 0, -1, -2, -3, -4, -5];
/** Places that fit in the 4-digit store of a normalized number (x.xxx). */
const STORED = new Set([0, -1, -2, -3]);

type Tone = 'normal' | 'lost' | 'extra' | 'carry';

interface DigitRowSpec {
  id: string;
  text: string;
  exp: number;
  /** Places this row has moved right since it first appeared (keeps digit identity). */
  shift: number;
  /** Tone of digits below 10^-3 (dropped while aligning, or one digit too many). */
  tail?: Tone;
  /** Tone of the 10^1 digit (the carry of the addition). */
  head?: Tone;
  /** Digits below this power get the `tail` tone (default: below 10^-3, past the 4 boxes). */
  tailBelow?: number;
  /** Power of the digit just left of the point (normalize: the point jumps, digits stay). */
  pointAfter?: number;
  focus?: boolean;
}

/** Grid column of a digit place (column 3 is the point). */
const colOf = (p: number) => POWERS.indexOf(p) + 1 + (p < 0 ? 1 : 0);

/** Digits of "10.015" by place value: { 1: '1', 0: '0', -1: '0', ... }. */
function places(text: string): Map<number, string> {
  const [int, frac = ''] = text.split('.');
  const m = new Map<number, string>();
  [...int].forEach((c, i) => m.set(int.length - 1 - i, c));
  [...frac].forEach((c, i) => m.set(-1 - i, c));
  return m;
}

const TONE: Record<Tone, string> = {
  normal: 'text-ink',
  lost: 'text-muted line-through opacity-60',
  extra: 'text-bit-grs-ink',
  carry: 'text-carry-ink',
};

function DigitRow({
  row,
  index,
  expFocus,
}: {
  row: DigitRowSpec;
  index: number;
  expFocus: boolean;
}) {
  const SPRING = useStageSpring();
  const digits = places(row.text);
  const gridRow = index + 3;
  const tailBelow = row.tailBelow ?? -3;
  const jumped = row.pointAfter !== undefined && row.pointAfter !== 0;
  return (
    <>
      {row.focus && (
        <motion.span
          layoutId="dec4-focus"
          transition={SPRING}
          style={{ gridRow, gridColumn: `1 / ${POWERS.length + 3}` }}
          className="-mx-1 h-full rounded-md bg-sky-400/10 shadow-[0_0_14px_rgba(56,182,255,0.45)] ring-2 ring-sky-400"
          aria-hidden
        />
      )}
      {POWERS.map((p, i) => {
        const c = digits.get(p);
        const col = i + 1 + (p < 0 ? 1 : 0);
        if (c === undefined) return null;
        const tone: Tone =
          p < tailBelow ? (row.tail ?? 'normal') : p === 1 ? (row.head ?? 'normal') : 'normal';
        return (
          <motion.span
            key={`${row.id}-${p + row.shift}`}
            layout="position"
            transition={SPRING}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: tone === 'lost' ? 6 : 0 }}
            style={{ gridRow, gridColumn: col }}
            className={cn('text-center', TONE[tone])}
          >
            {c}
          </motion.span>
        );
      })}
      {/* same layoutId in every frame: when normalize moves it, the point jumps */}
      <motion.span
        layoutId={`dec4-pt-${row.id}`}
        transition={SPRING}
        style={{ gridRow, gridColumn: jumped ? colOf(row.pointAfter!) : 3 }}
        className={cn(
          'font-bold text-primary',
          jumped ? 'translate-x-1/2 justify-self-end' : 'text-center',
        )}
      >
        .
      </motion.span>
      <span style={{ gridRow, gridColumn: POWERS.length + 2 }} className="pl-2">
        <ExponentTag
          exp={row.exp}
          base={10}
          className={cn(
            'rounded-md px-1 transition-colors',
            expFocus && 'bg-bit-exp/15 ring-1 ring-bit-exp',
          )}
        />
      </span>
    </>
  );
}

/** Scene 5.1: 9.999 × 10¹ + 1.610 × 10⁻¹ when only 4 digits fit (P&H 3.5). */
export function Dec4Scene() {
  const { add: r, frames } = buildDec4Frames(DEC4.a, DEC4.b, DEC4.p);
  const A = r.big === 'a' ? r.a : r.b;
  const B = r.big === 'a' ? r.b : r.a;
  const rows: DigitRowSpec[][] = [
    [
      { id: 'A', text: A.text, exp: A.exp, shift: 0 },
      { id: 'B', text: B.text, exp: B.exp, shift: 0 },
    ],
    [
      { id: 'A', text: A.text, exp: A.exp, shift: 0 },
      { id: 'B', text: B.text, exp: B.exp, shift: 0, focus: true },
    ],
    [
      { id: 'A', text: A.text, exp: A.exp, shift: 0 },
      {
        id: 'B',
        text: r.align.after + r.align.lost,
        exp: r.align.exp,
        shift: r.d,
        tail: 'lost',
        focus: true,
      },
    ],
    [
      { id: 'A', text: r.add.big, exp: r.add.exp, shift: 0 },
      { id: 'B', text: r.add.small, exp: r.add.exp, shift: r.d },
      { id: 'R', text: r.add.sum, exp: r.add.exp, shift: 0, head: 'carry', focus: true },
    ],
    [
      {
        id: 'R',
        text: r.add.sum,
        exp: r.normalize.exp,
        shift: 0,
        pointAfter: r.normalize.hops,
        // one digit more than the 4 that fit: it is the one rounding removes
        tail: 'extra',
        tailBelow: -3 + r.normalize.hops,
        focus: true,
      },
    ],
    [{ id: 'R', text: r.round.after, exp: r.round.exp, shift: r.normalize.hops, focus: true }],
  ];
  const stagger = useStageDuration(0.12);
  const steps = frames.map((f) => ({
    id: f.id,
    title: f.id,
    caption: caption(f.captionKey, f.params),
    bigStep: f.bigStep,
  }));
  return (
    <StepPlayer
      steps={steps}
      label={UI.digits4}
      stepBar
      testId="dec4"
      minHeight="12rem"
      render={(i) => (
        <div className="space-y-2">
          {frames[i].id === 'compare' && (
            <span className="inline-flex items-baseline gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm ring-1 ring-line">
              <span className="text-muted">d</span>
              <b className="num font-mono text-bit-exp-ink">{frames[i].params.d}</b>
            </span>
          )}
          <div
            className="num mx-auto grid w-max items-center gap-y-2 font-mono text-[clamp(1.2rem,5.5vw,1.9rem)]"
            style={{
              // the point column closes when the point has jumped (normalize), so no gap is left
              gridTemplateColumns: `repeat(2, 1.4em) ${frames[i].id === 'normalize' ? '0em' : '0.6em'} repeat(5, 1.4em) auto`,
            }}
            data-testid="dec4-digits"
            data-frame={frames[i].id}
          >
            {/* the four storage boxes follow the point: x.xxx after it jumps */}
            {[...STORED].map((p, k) => {
              const col = colOf(p + (frames[i].id === 'normalize' ? r.normalize.hops : 0));
              return (
                <motion.span
                  key={`box${k}`}
                  layout="position"
                  style={{ gridRow: `3 / ${rows[i].length + 3}`, gridColumn: col }}
                  className="-mx-px h-full rounded-md bg-ice-100 ring-1 ring-sky-200"
                  aria-hidden
                />
              );
            })}
            <span
              style={{ gridRow: 1, gridColumn: '2 / 7' }}
              className="text-center font-sans text-xs font-semibold text-muted"
            >
              {UI.digits4}
            </span>
            {/* carries of the addition, right to left */}
            {[...(frames[i].carries ?? [])]
              .sort((x, y) => x - y)
              .map((p, k) => (
                <span key={`c${p}`} className="contents">
                  <CarryHop
                    gridColumn={`${colOf(p)} / ${colOf(p - 1) + 1}`}
                    gridRow={2}
                    delay={k * stagger}
                    duration={stagger * 2}
                  />
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: k * stagger + stagger, duration: stagger * 2 }}
                    style={{ gridRow: 2, gridColumn: colOf(p) }}
                    className="-translate-x-1 self-start text-center font-sans text-[0.5em] leading-none font-bold text-carry-ink"
                    data-testid="dec4-carry"
                  >
                    1
                  </motion.span>
                </span>
              ))}
            {rows[i].map((row, k) => (
              <DigitRow key={row.id} row={row} index={k} expFocus={frames[i].id === 'compare'} />
            ))}
          </div>
        </div>
      )}
    />
  );
}
