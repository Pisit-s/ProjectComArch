'use client';

import { motion } from 'motion/react';
import { buildDec4Frames } from '@/lib/lesson/sci-frames';
import { caption } from '@/content/lesson/captions';
import { UI } from '@/content/lesson/copy';
import { DEC4 } from '@/content/lesson/examples';
import { StepPlayer } from '@/components/player/step-player';
import { ExponentTag } from '@/components/stage/exponent-tag';
import { cn } from '@/lib/utils';

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;
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
  focus?: boolean;
}

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

function DigitRow({ row, index }: { row: DigitRowSpec; index: number }) {
  const digits = places(row.text);
  const gridRow = index + 2;
  return (
    <>
      {row.focus && (
        <motion.span
          layoutId="dec4-focus"
          transition={SPRING}
          style={{ gridRow, gridColumn: `1 / ${POWERS.length + 3}` }}
          className="-mx-1 h-full rounded-md bg-primary/8"
          aria-hidden
        />
      )}
      {POWERS.map((p, i) => {
        const c = digits.get(p);
        const col = i + 1 + (p < 0 ? 1 : 0);
        if (c === undefined) return null;
        const tone: Tone =
          p < -3 ? (row.tail ?? 'normal') : p === 1 ? (row.head ?? 'normal') : 'normal';
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
      <span style={{ gridRow, gridColumn: 3 }} className="text-center font-bold text-primary">
        .
      </span>
      <span style={{ gridRow, gridColumn: POWERS.length + 2 }} className="pl-2">
        <ExponentTag exp={row.exp} base={10} />
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
        text: r.normalize.after,
        exp: r.normalize.exp,
        shift: r.normalize.hops,
        tail: 'extra',
        focus: true,
      },
    ],
    [{ id: 'R', text: r.round.after, exp: r.round.exp, shift: r.normalize.hops, focus: true }],
  ];
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
        <div
          className="num mx-auto grid w-max items-center gap-y-2 font-mono text-[clamp(1.2rem,5.5vw,1.9rem)]"
          style={{ gridTemplateColumns: `repeat(2, 1.4em) 0.6em repeat(5, 1.4em) auto` }}
          data-testid="dec4-digits"
          data-frame={frames[i].id}
        >
          {/* the four storage boxes */}
          {POWERS.filter((p) => STORED.has(p)).map((p) => {
            const col = POWERS.indexOf(p) + 1 + (p < 0 ? 1 : 0);
            return (
              <span
                key={`box${p}`}
                style={{ gridRow: `2 / ${rows[i].length + 2}`, gridColumn: col }}
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
          {rows[i].map((row, k) => (
            <DigitRow key={row.id} row={row} index={k} />
          ))}
        </div>
      )}
    />
  );
}
