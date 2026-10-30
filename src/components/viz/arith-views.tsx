'use client';

import { ChevronsRight, RotateCcw, SkipForward } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { usePlayerMotion } from '@/components/player/player-speed';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Pow } from '@/components/ui/num';
import { fixedPoint } from '@/lib/display';
import { type FloatFormat, type StepOf, bias, precision } from '@/lib/fp';
import { cn } from '@/lib/utils';
import { BitLine, MovingPoint } from './bit-line';
import { Box, Explain } from './step-parts';

const GRS = 3;

/** Exponent alignment: the smaller significand slides right; bits that fall off end up in Sticky. */
export function AlignView({ step, fmt }: { step: StepOf<'align'>; fmt: FloatFormat }) {
  const F = fmt.fracBits;
  const last = step.stages.length - 1;
  const [k, setK] = useState(last);
  const stage = step.stages[Math.min(k, last)];
  const big = fixedPoint(step.larger, F + GRS);
  const cur = fixedPoint(stage.value, F + GRS);
  const orig = fixedPoint(step.before, F + GRS);
  return (
    <div className="space-y-3" data-testid="align-view">
      <Box className="space-y-1">
        <Row label="ตัวใหญ่">
          <BitLine int={big.int} frac={big.frac} kept={F} hiddenLead intWidth={2} />
          <Pow exp={`${step.exponent}−${bias(fmt)}`} className="ml-2 text-sm text-muted" />
        </Row>
        <Row label="ตัวเล็ก (เดิม)">
          <BitLine int={orig.int} frac={orig.frac} kept={F} intWidth={2} className="opacity-60" />
        </Row>
        <Row label={`เลื่อนขวา ${stage.shift} บิต`}>
          <motion.span
            key={stage.shift}
            initial={{ x: 6, opacity: 0.4 }}
            animate={{ x: 0, opacity: 1 }}
            className="inline-flex"
          >
            <BitLine int={cur.int} frac={cur.frac} kept={F} intWidth={2} testId="align-current" />
          </motion.span>
          <Pow exp={`${step.exponent}−${bias(fmt)}`} className="ml-2 text-sm text-muted" />
        </Row>
      </Box>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn h-11 min-h-11 bg-white/80 btn-ghost ring-1 ring-line btn-sm"
          onClick={() => setK((x) => Math.min(last, x + 1))}
          disabled={k >= last}
          data-testid="align-shift-one"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden />
          เลื่อนทีละบิต
        </button>
        <button
          type="button"
          className="btn h-11 min-h-11 btn-ghost btn-sm"
          onClick={() => setK(0)}
          disabled={k === 0}
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          กลับไปก่อนเลื่อน
        </button>
        <button
          type="button"
          className="btn h-11 min-h-11 btn-ghost btn-sm"
          onClick={() => setK(last)}
          disabled={k >= last}
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          เลื่อนจนครบ
        </button>
        <span className="text-sm text-muted">
          Sticky ตอนนี้ = <b className="num font-mono text-bit-grs-ink">{stage.sticky}</b>
        </span>
      </div>
      <Explain>
        <p>
          Exponent ต่างกัน <b className="num font-mono">{step.shift}</b> จึงเลื่อน Significand
          ของตัวที่เล็กกว่าไปทางขวา {step.shift} ตำแหน่งให้ Exponent เท่ากัน
        </p>
        <p>
          เก็บบิตเพิ่ม 3 ช่อง (สีชมพู: Guard, Round, Sticky) ไว้ใช้ปัดเศษ บิตที่หลุดเกินช่อง Sticky
          ไม่ทิ้งเฉย ๆ แต่นำมา OR รวมไว้ใน Sticky
          {step.sticky ? ' ครั้งนี้มีบิต 1 หลุดออกไป Sticky จึงเป็น 1' : ''}
        </p>
      </Explain>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
      <span className="shrink-0 text-xs text-muted sm:w-28">{label}</span>
      <span className="inline-flex flex-wrap items-baseline text-[0.8rem] min-[400px]:text-sm sm:text-base">
        {children}
      </span>
    </div>
  );
}

export function SigAddView({ step, fmt }: { step: StepOf<'sig-add'>; fmt: FloatFormat }) {
  const { d } = usePlayerMotion();
  const F = fmt.fracBits;
  const a = fixedPoint(step.a, F + GRS);
  const b = fixedPoint(step.b, F + GRS);
  const r = fixedPoint(step.result, F + GRS, 2);
  return (
    <div className="space-y-3">
      <Box>
        <div className="num inline-grid grid-cols-[1.5rem_auto] gap-x-1 font-mono text-[0.8rem] min-[400px]:text-sm sm:text-base">
          <span />
          <BitLine int={a.int} frac={a.frac} kept={F} intWidth={2} />
          <span className="font-bold">{step.op === '+' ? '+' : '−'}</span>
          <BitLine int={b.int} frac={b.frac} kept={F} intWidth={2} />
          <span className="col-span-2 border-t border-ink/40" />
          <span />
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d(0.4), duration: d(0.3) }}
          >
            <BitLine int={r.int} frac={r.frac} kept={F} intWidth={2} testId="sig-add-result" />
          </motion.span>
        </div>
      </Box>
      <Explain>
        {step.op === '+' ? (
          <p>
            Sign เหมือนกัน จึงบวก Significand ตรง ๆ ถ้าได้ ≥ 2 จะ Normalize
            ด้วยการเลื่อนขวาในขั้นถัดไป
          </p>
        ) : (
          <p>
            Sign ต่างกัน จึงเอาตัวที่มีขนาดใหญ่กว่าลบตัวเล็ก ผลมี Sign ของตัวที่ใหญ่กว่า (
            {step.sign ? 'ลบ' : 'บวก'}) ถ้าบิตหน้าหายไปหลายบิตจะต้อง Normalize ซ้าย
          </p>
        )}
        {step.result === 0n && (
          <p className="font-semibold">ผลเป็น 0 พอดี (หักล้างกันหมด) ได้ +0</p>
        )}
      </Explain>
    </div>
  );
}

/** Trim common trailing zeros so short examples stay readable (all rows keep the same columns). */
function columns(values: bigint[], fracBits: number): number {
  let need = 1;
  for (const v of values) {
    if (v === 0n) continue;
    const s = v.toString(2);
    const tz = s.length - s.replace(/0+$/, '').length;
    need = Math.max(need, fracBits - tz);
  }
  return Math.min(need, fracBits);
}

const cut = (v: bigint, fracBits: number, cols: number, minInt = 1) => {
  const p = fixedPoint(v, fracBits, minInt);
  return { int: p.int, frac: p.frac.slice(0, cols) };
};

export function PartialProductsView({ step }: { step: StepOf<'sig-mul'> }) {
  const { d } = usePlayerMotion();
  const F = step.operandFracBits;
  const cols = columns([...step.rows.map((r) => r.value), step.product], step.fracBits);
  const opCols = columns([step.multiplicand, step.multiplier], F);
  const mc = cut(step.multiplicand, F, opCols);
  const mp = cut(step.multiplier, F, opCols);
  const stagger = Math.min(0.35, 3 / Math.max(1, step.rows.length));
  return (
    <div className="space-y-3">
      <Box className="space-y-2">
        <p className="num font-mono text-sm">
          <BitLine int={mc.int} frac={mc.frac} hiddenLead /> <span className="mx-1">×</span>
          <BitLine int={mp.int} frac={mp.frac} hiddenLead />
          <span className="ml-2 font-sans text-xs text-muted">
            (ตัวคูณมีบิต 1 อยู่ {step.rows.length} ตัว → partial product {step.rows.length} แถว)
          </span>
        </p>
        <ol className="num font-mono text-sm" data-testid="partial-products">
          {step.rows.map((row, i) => {
            const v = cut(row.value, step.fracBits, cols);
            const shift = F - row.bitIndex;
            return (
              <motion.li
                key={row.bitIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: d(0.2 + stagger * i), duration: d(0.25) }}
                className="flex items-baseline gap-2"
                data-testid="pp-row"
              >
                <span className="w-4 text-muted">{i === 0 ? '' : '+'}</span>
                <BitLine int={v.int} frac={v.frac} intWidth={2} />
                <span className="font-sans text-xs whitespace-nowrap text-muted">
                  ตัวตั้ง × <Pow exp={shift === 0 ? 0 : -shift} />
                </span>
              </motion.li>
            );
          })}
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: d(0.3 + stagger * step.rows.length), duration: d(0.3) }}
            className="mt-1 flex items-baseline gap-2 border-t border-ink/40 pt-1 font-bold"
          >
            <span className="w-4">=</span>
            {(() => {
              const p = cut(step.product, step.fracBits, cols);
              return <BitLine int={p.int} frac={p.frac} intWidth={2} testId="product" />;
            })()}
          </motion.li>
        </ol>
      </Box>
      <Explain>
        <p>
          คูณแบบ shift-and-add: ทุกบิต 1 ของตัวคูณให้ partial product หนึ่งแถว
          คือตัวตั้งที่เลื่อนไปตามตำแหน่งของบิตนั้น แล้วบวกทุกแถวรวมกัน
        </p>
        {step.swapped && (
          <p>สลับให้ตัวที่มีบิต 1 น้อยกว่าเป็นตัวคูณ แถวจะได้น้อยลง (การคูณสลับที่ได้)</p>
        )}
        <p>
          Significand ทั้งสองอยู่ในช่วง [1, 2) ผลคูณจึงอยู่ในช่วง [1, 4) และยาวได้ถึง {2 * F + 2}{' '}
          บิต
        </p>
      </Explain>
    </div>
  );
}

export function LongDivisionView({ step, fmt }: { step: StepOf<'sig-div'>; fmt: FloatFormat }) {
  const { d } = usePlayerMotion();
  const F = step.operandFracBits;
  const [showAll, setShowAll] = useState(false);
  const FIRST = 8;
  const rows = showAll ? step.rows : step.rows.slice(0, FIRST);
  const cols = columns(
    [step.dividend, step.divisor, ...step.rows.flatMap((r) => [r.remainder, r.after])],
    F,
  );
  const dv = cut(step.divisor, F, cols);
  const q = step.quotient.toString(2).padStart(step.rows.length, '0');
  return (
    <div className="space-y-3">
      <Box>
        <p className="mb-2 text-sm">
          ตัวหาร (Divisor) = <BitLine int={dv.int} frac={dv.frac} hiddenLead />
        </p>
        <table className="table w-auto table-sm" data-testid="long-division">
          <thead>
            <tr className="text-xs">
              <th>รอบ</th>
              <th>เศษก่อนเทียบ</th>
              <th>≥ ตัวหาร?</th>
              <th>บิตผลหาร</th>
            </tr>
          </thead>
          <tbody className="num font-mono text-sm">
            {rows.map((r, i) => {
              const rem = cut(r.remainder, F, cols);
              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: d(showAll ? 0 : 0.15 + 0.25 * i), duration: d(0.2) }}
                  data-testid="div-row"
                >
                  <td className="text-muted">{i}</td>
                  <td>
                    <BitLine int={rem.int} frac={rem.frac} intWidth={2} />
                  </td>
                  <td className="font-sans whitespace-nowrap">
                    {r.subtracted ? 'ใช่ ลบ' : 'ไม่ลบ'}
                  </td>
                  <td className={cn('font-bold', r.qBit ? 'text-primary' : 'text-muted')}>
                    {r.qBit}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {step.rows.length > FIRST && (
          <button
            type="button"
            className="btn mt-1 h-11 min-h-11 btn-ghost btn-sm"
            onClick={() => setShowAll((s) => !s)}
            data-testid="div-show-all"
          >
            <SkipForward className="h-4 w-4" aria-hidden />
            {showAll ? `ย่อเหลือ ${FIRST} แถวแรก` : `ดูทุกแถว (${step.rows.length} รอบ)`}
          </button>
        )}
        <div className="mt-2 space-y-1 text-sm">
          <p>
            ผลหาร (Quotient) = <BitLine int={q[0]} frac={q.slice(1)} testId="quotient" />
          </p>
          <p>
            เศษสุดท้าย (Remainder){' '}
            {step.remainder === 0n ? (
              <b>= 0 → Sticky ได้ 0</b>
            ) : (
              <b className="text-bit-grs-ink">≠ 0 → นำไป OR เป็น Sticky = 1</b>
            )}
          </p>
        </div>
      </Box>
      <Explain>
        <p>
          หารยาวฐานสอง ทีละ 1 บิต: ถ้าเศษ ≥ ตัวหาร ให้ลบแล้วได้บิตผลหาร 1 ไม่งั้นได้ 0
          แล้วเลื่อนเศษไปทางซ้าย 1 บิตเพื่อทำรอบต่อไป
        </p>
        <p>
          ทำ {step.rows.length} รอบ ได้ {precision(fmt)} บิตของ Significand + บิตสำรองสำหรับ
          Normalize + Guard + Round ส่วนเศษที่เหลือบอก Sticky ผลหารของ Significand อยู่ในช่วง (0.5,
          2)
        </p>
      </Explain>
    </div>
  );
}

/** The binary point slides to its new place and the exponent counts along. */
export function NormalizeView({
  step,
  op,
  fmt,
}: {
  step: StepOf<'normalize'>;
  op: 'add' | 'mul' | 'div';
  fmt: FloatFormat;
}) {
  const { d, reduced } = usePlayerMotion();
  const [moved, setMoved] = useState(reduced || step.direction === 'none');
  const delayMs = d(0.7) * 1000;
  useEffect(() => {
    if (moved) return;
    const t = setTimeout(() => setMoved(true), delayMs);
    return () => clearTimeout(t);
  }, [moved, delayMs]);

  const raw = step.before.toString(2).padStart(step.beforeFracBits + 1, '0');
  const pointBefore = raw.length - step.beforeFracBits;
  const pointAfter =
    step.direction === 'right'
      ? pointBefore - step.amount
      : step.direction === 'left'
        ? pointBefore + step.amount
        : pointBefore;
  // trim trailing zeros but keep both point positions and a few digits after them
  const lastOne = raw.lastIndexOf('1');
  const keep = Math.max(lastOne + 1, pointAfter + 1, pointBefore + 1);
  const digits = raw.slice(0, Math.min(raw.length, keep));
  const lead = raw.indexOf('1');
  const pointAt = moved ? pointAfter : pointBefore;
  return (
    <div className="space-y-3">
      <Box>
        <div className="flex flex-wrap items-baseline gap-2" data-testid="normalize-view">
          <span className="text-lg">
            <MovingPoint
              digits={digits}
              pointAt={pointAt}
              id={`point-${step.before}`}
              hiddenAt={moved ? lead : undefined}
              className="text-lg"
            />
          </span>
          <span className="text-sm text-muted">× 2</span>
          <span className="num font-mono text-sm">
            <sup>
              <AnimatedNumber value={moved ? step.expAfter : step.expBefore} duration={d(0.4)} />−
              {bias(fmt)}
            </sup>
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Biased exponent: <span className="num font-mono">{step.expBefore}</span> →{' '}
          <b className="num font-mono text-ink" data-testid="normalize-exp-after">
            {step.expAfter}
          </b>
        </p>
      </Box>
      <Explain>
        {step.direction === 'none' && <p>ผลอยู่ในรูป 1.xxx อยู่แล้ว ไม่ต้อง Normalize</p>}
        {step.direction === 'right' && (
          <p>
            ผล ≥ 2 จึงเลื่อนจุดไปทางซ้าย 1 ตำแหน่ง (Significand เลื่อนขวา 1 บิต) และบวก Exponent
            เพิ่ม 1
            {op === 'mul' && ' · การคูณ Normalize ไปทางขวาไม่เกิน 1 บิตเสมอ เพราะผลคูณน้อยกว่า 4'}
          </p>
        )}
        {step.direction === 'left' && (
          <p>
            บิตหน้าเป็น 0 จึงเลื่อนจุดไปทางขวา {step.amount} ตำแหน่ง (Significand เลื่อนซ้าย) และลด
            Exponent ลง {step.amount}
            {op === 'div' && ' · การหาร Normalize ไปทางซ้ายไม่เกิน 1 บิตเสมอ เพราะผลหารมากกว่า 0.5'}
            {op === 'add' &&
              step.amount > 1 &&
              ' · เกิดจากการลบค่าที่ใกล้กัน บิตหน้าจึงหายไปหลายบิต'}
          </p>
        )}
      </Explain>
    </div>
  );
}

export function AnimatedList({ children }: { children: React.ReactNode }) {
  return <AnimatePresence initial={false}>{children}</AnimatePresence>;
}
