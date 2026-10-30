'use client';

import { ArrowDown, ArrowUp, Lightbulb, Equal } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { BitCell } from '@/components/bits/bit-cell';
import { FIELD_STYLE } from '@/components/bits/field-style';
import { usePlayerMotion } from '@/components/player/player-speed';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Pow } from '@/components/ui/num';
import { FLAG_TEXT, RANGE_TEXT, ROUND_TEXT, SPECIAL_TEXT } from '@/content/step-text';
import { fixedPoint } from '@/lib/display';
import type { Flags, FloatFormat, StepOf } from '@/lib/fp';
import { cn } from '@/lib/utils';
import { BitLine } from './bit-line';

export function Explain({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex gap-2 rounded-lg bg-ice-100/80 p-3 text-sm leading-relaxed', className)}
    >
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 space-y-1">{children}</div>
    </div>
  );
}

export function Box({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('glass-solid scroll-x rounded-xl p-3 ring-1 ring-foreground/10', className)}>
      {children}
    </div>
  );
}

/** Significand (hidden bit + fraction) of a decoded operand, e.g. 1.101 0000… */
export function SigLine({
  sig,
  fracBits,
  hidden = true,
  trim = false,
  className,
}: {
  sig: bigint;
  fracBits: number;
  hidden?: boolean;
  trim?: boolean;
  className?: string;
}) {
  const { int, frac } = fixedPoint(sig, fracBits);
  const f = trim ? frac.replace(/0+$/, '') || '0' : frac;
  return <BitLine int={int} frac={f} kept={f.length} hiddenLead={hidden} className={className} />;
}

export function bin8(n: number, bits = 8): string | null {
  return n >= 0 && n < 2 ** bits ? n.toString(2).padStart(bits, '0') : null;
}

/** Exponent arithmetic in decimal and 8-bit binary (Chapter 5 requirement 7.4). */
export function ExponentCalc({ step, fmt }: { step: StepOf<'exponent'>; fmt: FloatFormat }) {
  const { d } = usePlayerMotion();
  const w = fmt.expBits;
  const mul = step.mode === 'add-bias';
  const mid = mul ? step.ea + step.eb : step.ea - step.eb;
  const rows: { label: string; op: string; value: number; note?: string; strong?: boolean }[] = [
    { label: 'EA', op: '', value: step.ea },
    { label: 'EB', op: mul ? '+' : '−', value: step.eb },
    {
      label: mul ? 'EA + EB' : 'EA − EB',
      op: '=',
      value: mid,
      note: mul ? 'มี Bias ซ้ำ 2 ครั้ง' : 'Bias หายไปหมด',
    },
    { label: 'Bias', op: mul ? '−' : '+', value: step.bias },
    { label: 'E', op: '=', value: step.result, strong: true },
  ];
  return (
    <Box>
      <table className="num w-full font-mono text-sm" data-testid="exponent-calc">
        <thead className="sr-only">
          <tr>
            <th>ชื่อ</th>
            <th>ฐานสิบ</th>
            <th>ฐานสอง {w} บิต</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const b = bin8(r.value, w);
            return (
              <motion.tr
                key={r.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(0.15 * i), duration: d(0.25) }}
                className={cn(r.op === '=' && 'border-t border-line', r.strong && 'font-bold')}
              >
                <td className="w-6 py-1 text-muted">{r.op}</td>
                <td className="py-1 pr-3 font-sans text-muted">{r.label}</td>
                <td className="py-1 pr-3 text-right">{r.value < 0 ? `−${-r.value}` : r.value}</td>
                <td className={cn('py-1', FIELD_STYLE.exp.text)}>
                  {b ?? <span className="font-sans text-xs text-muted">(เกินช่วง {w} บิต)</span>}
                </td>
                <td className="py-1 pl-2 font-sans text-xs text-muted">{r.note}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
}

export function SignXor({ step }: { step: StepOf<'sign'> }) {
  return (
    <Box className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted">Sign A</span>
      <BitCell bit={step.a} field="sign" size="sm" />
      <span className="font-mono font-bold">XOR</span>
      <span className="text-sm text-muted">Sign B</span>
      <BitCell bit={step.b ?? 0} field="sign" size="sm" />
      <Equal className="h-4 w-4" aria-hidden />
      <BitCell bit={step.result} field="sign" size="sm" changed />
      <span className="text-sm">({step.result ? 'ผลเป็นลบ' : 'ผลเป็นบวก'})</span>
      <table className="num ml-auto font-mono text-xs text-muted">
        <caption className="sr-only">ตาราง XOR</caption>
        <tbody>
          {[
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
          ].map(([x, y]) => (
            <tr
              key={`${x}${y}`}
              className={cn(x === step.a && y === step.b && 'font-bold text-ink')}
            >
              <td className="px-1">{x}</td>
              <td className="px-1">⊕</td>
              <td className="px-1">{y}</td>
              <td className="px-1">=</td>
              <td className="px-1">{x ^ y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

export function RangeGauge({ step }: { step: StepOf<'range'> }) {
  const { d } = usePlayerMotion();
  const lo = step.minExp;
  const hi = step.maxExp;
  // gauge spans from lo - 40 to hi + 40 so out-of-range values stay visible
  const min = lo - 40;
  const max = hi + 40;
  const pos = (v: number) => ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * 100;
  const bad = step.outcome !== 'ok';
  return (
    <Box className="space-y-3" data-testid="range-gauge">
      <div className="relative h-10">
        <div className="absolute inset-x-0 top-4 flex h-2 overflow-hidden rounded-full">
          <div className="bg-bit-grs/40" style={{ width: `${pos(lo)}%` }} />
          <div className="bg-bit-exp/40" style={{ width: `${pos(hi) - pos(lo)}%` }} />
          <div className="flex-1 bg-error/30" />
        </div>
        <motion.div
          className="absolute top-0 -ml-px h-10 w-0.5 bg-ink"
          initial={{ left: '50%' }}
          animate={{ left: `${pos(step.exponent)}%` }}
          transition={{ duration: d(0.6), ease: 'easeOut' }}
        >
          <span className="num absolute -top-1 left-1 font-mono text-xs font-bold whitespace-nowrap">
            {step.exponent}
          </span>
        </motion.div>
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>&lt; {lo}: Underflow</span>
        <span>
          {lo}–{hi}: ปกติ
        </span>
        <span>&gt; {hi}: Overflow</span>
      </div>
      <p className={cn('text-sm', bad && 'font-semibold')}>
        Biased exponent = <span className="num font-mono">{step.exponent}</span> ·{' '}
        {RANGE_TEXT[step.outcome]}
        {step.denormShift > 0 && (
          <>
            {' '}
            (เลื่อนขวาเพิ่ม <span className="num font-mono">{step.denormShift}</span> บิต)
          </>
        )}
      </p>
    </Box>
  );
}

export function RoundGRS({ step, fmt }: { step: StepOf<'round'>; fmt: FloatFormat }) {
  const { d } = usePlayerMotion();
  const F = fmt.fracBits;
  const kept = fixedPoint(step.kept, F);
  const res = fixedPoint(step.result, F);
  const t = ROUND_TEXT[step.decision];
  const up = step.decision === 'up' || step.decision === 'tie-even-up';
  return (
    <div className="space-y-3">
      <Box>
        <div className="flex flex-wrap items-end gap-x-1 gap-y-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted">
              เก็บได้ {step.subnormal ? `(Subnormal: ${F} บิต หลังจุด)` : `${F + 1} บิต`}
            </span>
            <BitLine
              int={kept.int}
              frac={kept.frac}
              kept={F}
              hiddenLead={!step.subnormal}
              showLsb
              testId="round-kept"
            />
          </div>
          <div className="flex items-end gap-1" data-testid="grs">
            {(
              [
                ['G', step.guard],
                ['R', step.round],
                ['S', step.sticky],
              ] as const
            ).map(([n, v], i) => (
              <motion.span
                key={n}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(0.2 + 0.15 * i), duration: d(0.25) }}
              >
                <span className="text-xs font-semibold text-bit-grs-ink">{n}</span>
                <BitCell
                  bit={v}
                  field="grs"
                  size="sm"
                  aria-label={`${n} = ${v}`}
                  data-testid={`grs-${n}`}
                />
              </motion.span>
            ))}
          </div>
        </div>
      </Box>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(0.7), duration: d(0.3) }}
        className={cn(
          'flex items-start gap-2 rounded-lg p-3 text-sm',
          up ? 'bg-bit-grs/10' : 'bg-ice-100',
        )}
        data-testid="round-decision"
        data-decision={step.decision}
      >
        {up ? (
          <ArrowUp className="mt-0.5 h-4 w-4 shrink-0 text-bit-grs-ink" aria-hidden />
        ) : (
          <ArrowDown className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
        )}
        <div>
          <p className="font-semibold">
            G={step.guard} R={step.round} S={step.sticky} → {t.short}
          </p>
          <p>{t.why}</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: d(1), duration: d(0.3) }}
      >
        <Box>
          <span className="text-xs text-muted">หลังปัด</span>
          <div>
            <BitLine
              int={res.int}
              frac={res.frac}
              kept={F}
              hiddenLead={res.int === '1'}
              testId="round-result"
            />
          </div>
          {step.carryOut && (
            <p className="mt-2 text-sm">
              ปัดขึ้นแล้วเกิดตัวทดจนได้ 10.000… จึง Normalize อีกครั้ง: เลื่อนขวา 1 บิต และ Exponent
              + 1 (เป็น <span className="num font-mono">{step.expAfter}</span>)
            </p>
          )}
          {step.overflowAfterRound && (
            <p className="mt-2 text-sm font-semibold">
              ตัวทดทำให้ Exponent เกิน 254 → Overflow เป็น ∞
            </p>
          )}
        </Box>
      </motion.div>
    </div>
  );
}

export function FlagBadges({ flags }: { flags: Flags }) {
  const on = (Object.keys(FLAG_TEXT) as (keyof Flags)[]).filter((k) => flags[k]);
  if (on.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="IEEE 754 exception">
      {on.map((k) => (
        <li
          key={k}
          className={cn(
            'badge badge-sm',
            k === 'inexact' ? 'badge-ghost' : k === 'underflow' ? 'badge-info' : 'badge-warning',
          )}
        >
          {FLAG_TEXT[k]}
        </li>
      ))}
    </ul>
  );
}

export function SpecialCase({ step }: { step: StepOf<'special'> }) {
  const t = SPECIAL_TEXT[step.rule];
  return (
    <div className="space-y-2" data-testid="special-case" data-rule={step.rule}>
      <div className="rounded-xl bg-bit-sign/8 p-4 ring-1 ring-bit-sign/30">
        <p className="font-display text-lg font-semibold">{t.rule}</p>
        <p className="mt-1 text-sm">{t.why}</p>
      </div>
      <FlagBadges flags={step.flags} />
      <p className="text-sm text-muted">ไม่ต้องไล่ขั้นตอนปกติ ผลลัพธ์ได้จากกฎนี้ทันที</p>
    </div>
  );
}

export function ExpPow({ biased, bias }: { biased: number; bias: number }) {
  return <Pow exp={`${biased}−${bias}`} />;
}

export { AnimatedNumber };
