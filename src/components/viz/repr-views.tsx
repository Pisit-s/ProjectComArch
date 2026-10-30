'use client';

import { CheckCircle2, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { BitCell } from '@/components/bits/bit-cell';
import { FIELD_STYLE } from '@/components/bits/field-style';
import { Register } from '@/components/bits/register';
import { usePlayerMotion } from '@/components/player/player-speed';
import { Num, Pow } from '@/components/ui/num';
import { CLASS_TEXT } from '@/content/step-text';
import { bin8, fixedPoint, fmt as fmtR } from '@/lib/display';
import {
  type FloatFormat,
  type StepOf,
  emin,
  exactDecimal,
  groupNibbles,
  shortestDecimal,
  toBinaryString,
  width,
} from '@/lib/fp';
import { cn } from '@/lib/utils';
import { BitLine, MovingPoint } from './bit-line';
import { Box, Explain } from './step-parts';

const FIRST_ROWS = 10;

function useShowAll() {
  return useState(false);
}

export function IntBinaryView({ step }: { step: StepOf<'int-binary'> }) {
  const { d } = usePlayerMotion();
  const [all, setAll] = useShowAll();
  if (step.intPart === 0n) {
    return (
      <Explain>
        <p>ส่วนจำนวนเต็มเป็น 0 จึงได้ 0 ในฐานสองเลย ไปทำส่วนเศษต่อ</p>
      </Explain>
    );
  }
  const rows = all ? step.rows : step.rows.slice(0, FIRST_ROWS);
  return (
    <div className="space-y-3">
      <Box>
        <table className="table w-auto table-sm">
          <thead>
            <tr className="text-xs">
              <th>หารด้วย 2</th>
              <th>ได้</th>
              <th>เศษ (บิต)</th>
            </tr>
          </thead>
          <tbody className="num font-mono text-sm">
            {rows.map((r, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: d(all ? 0 : 0.12 * i), duration: d(0.2) }}
              >
                <td className="break-all">{r.value.toString()} ÷ 2</td>
                <td className="break-all">{r.quotient.toString()}</td>
                <td className="font-bold text-primary">{r.bit}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {step.rows.length > FIRST_ROWS && (
          <button
            type="button"
            className="btn h-11 min-h-11 btn-ghost btn-sm"
            onClick={() => setAll(!all)}
          >
            {all ? 'ย่อ' : `ดูทุกแถว (${step.rows.length})`}
          </button>
        )}
        <p className="mt-2 text-sm">
          อ่านเศษจากล่างขึ้นบน:{' '}
          <BitLine int={step.binary} frac="" className="break-all whitespace-normal" />
          <sub>2</sub>
        </p>
      </Box>
      <Explain>
        <p>หารด้วย 2 ไปเรื่อย ๆ จนได้ 0 เศษของแต่ละรอบคือบิต เริ่มจากบิตขวาสุด (น้ำหนัก 2⁰)</p>
        {step.rowsTruncated && <p>ค่านี้ใหญ่มาก แสดงเฉพาะแถวแรก ๆ</p>}
      </Explain>
    </div>
  );
}

export function FracBinaryView({ step }: { step: StepOf<'frac-binary'> }) {
  const { d } = usePlayerMotion();
  const [all, setAll] = useShowAll();
  if (step.fracPart.num === 0n) {
    return (
      <Explain>
        <p>ไม่มีส่วนเศษ (เป็นจำนวนเต็มพอดี) ส่วนเศษในฐานสองจึงเป็น 0</p>
      </Explain>
    );
  }
  const rows = all ? step.rows : step.rows.slice(0, FIRST_ROWS);
  return (
    <div className="space-y-3">
      <Box>
        <table className="table w-auto table-sm" data-testid="frac-rows">
          <thead>
            <tr className="text-xs">
              <th>#</th>
              <th>เศษ × 2</th>
              <th>บิต</th>
            </tr>
          </thead>
          <tbody className="num font-mono text-sm">
            {rows.map((r, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(all ? 0 : 0.12 * i), duration: d(0.2) }}
              >
                <td className="text-muted">{i + 1}</td>
                <td>
                  <Num value={fmtR(r.value, 30)} /> × 2 = <Num value={fmtR(r.doubled, 30)} />
                </td>
                <td className="font-bold text-primary">{r.bit}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {step.rows.length > FIRST_ROWS && (
          <button
            type="button"
            className="btn h-11 min-h-11 btn-ghost btn-sm"
            onClick={() => setAll(!all)}
          >
            {all ? 'ย่อ' : `ดูทุกแถว (${step.rows.length})`}
          </button>
        )}
        <p className="mt-2 text-sm break-all">
          อ่านบิตจากบนลงล่าง: 0.
          <span className="num font-mono text-bit-frac-ink">{step.binary}</span>
          {!step.terminated && '…'}
          <sub>2</sub>
        </p>
      </Box>
      <Explain>
        <p>
          คูณส่วนเศษด้วย 2 ทุกรอบ ส่วนจำนวนเต็มที่ได้ (0 หรือ 1) คือบิตถัดไปหลังจุด
          แล้วใช้แค่ส่วนเศษไปคูณต่อ
        </p>
        <p>
          {step.terminated
            ? 'เศษกลายเป็น 0 แล้ว แปลงได้พอดี'
            : 'เศษยังไม่เป็น 0 (ค่านี้ในฐานสองไม่จบ) หยุดเมื่อได้บิตพอสำหรับ Fraction 23 บิต + Guard, Round, Sticky'}
        </p>
      </Explain>
    </div>
  );
}

/** Normalize by moving the point; the learner can move it with the buttons until it reads 1.xxx. */
export function PointView({ step, fmt }: { step: StepOf<'point'>; fmt: FloatFormat }) {
  const intLen = step.intBinary.length;
  const digits = step.intBinary + step.fracBinary;
  const target = intLen - step.eUsed;
  const [pos, setPos] = useState(intLen);
  const e = intLen - pos;
  const done = pos === target;
  const F = fmt.fracBits;
  const n = fixedPoint(step.normalized, F + 3);
  const shown = n.frac.replace(/0+$/, '');
  const firstOne = digits.indexOf('1');
  return (
    <div className="space-y-3">
      <Box className="space-y-2">
        <div className="scroll-x text-lg" data-testid="point-digits">
          <MovingPoint
            digits={digits.padEnd(pos + 1, '0')}
            pointAt={pos}
            id={`enc-point-${step.e}`}
            hiddenAt={done && !step.subnormal ? firstOne : undefined}
          />
          <span className="ml-2 text-sm text-muted">
            × <Pow exp={e} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn h-11 min-h-11 bg-white/80 btn-ghost ring-1 ring-line btn-sm"
            onClick={() => setPos((p) => Math.max(1, p - 1))}
            aria-label="เลื่อนจุดไปทางซ้าย"
            data-testid="point-left"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> จุดไปซ้าย
          </button>
          <button
            type="button"
            className="btn h-11 min-h-11 bg-white/80 btn-ghost ring-1 ring-line btn-sm"
            onClick={() => setPos((p) => Math.min(digits.length, p + 1))}
            aria-label="เลื่อนจุดไปทางขวา"
            data-testid="point-right"
          >
            จุดไปขวา <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className="btn h-11 min-h-11 btn-ghost btn-sm"
            onClick={() => setPos(target)}
          >
            <SkipForward className="h-4 w-4" aria-hidden /> ทำให้เลย
          </button>
          {done && (
            <span
              className="flex items-center gap-1 text-sm font-semibold text-success"
              data-testid="point-done"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {step.subnormal ? 'ได้แล้ว (ใช้ Exponent ต่ำสุด −126)' : 'ได้รูป 1.xxx แล้ว'}
            </span>
          )}
        </div>
        <p className="text-sm">
          ผล:{' '}
          <BitLine
            int={n.int}
            frac={shown || '0'}
            hiddenLead={!step.subnormal}
            className="whitespace-normal"
          />{' '}
          × <Pow exp={step.eUsed} />
        </p>
      </Box>
      <Explain>
        {step.subnormal ? (
          <p>
            ค่านี้เล็กกว่า <Pow exp={emin(fmt)} /> ถ้าเลื่อนจนได้ 1.xxx Exponent จะต่ำกว่า{' '}
            {emin(fmt)} ซึ่งเก็บไม่ได้ จึงหยุดที่ <Pow exp={emin(fmt)} /> แล้วเก็บแบบ Subnormal
            (หน้าจุดเป็น 0)
          </p>
        ) : (
          <p>
            เลื่อนจุดไปทาง
            {step.direction === 'left' ? 'ซ้าย' : step.direction === 'right' ? 'ขวา' : '—'}{' '}
            {step.amount} ตำแหน่งจนหน้าจุดเหลือเลข 1 ตัวเดียว ได้ Exponent = {step.eUsed} · เลข 1
            หน้าจุดคือ hidden bit ไม่ต้องเก็บ
          </p>
        )}
        <p>
          ลองกดปุ่มเลื่อนจุดเองดูก่อน: เลื่อนจุดไปซ้าย 1 ตำแหน่ง Exponent เพิ่ม 1 · ไปขวา 1 ตำแหน่ง
          Exponent ลด 1
        </p>
      </Explain>
    </div>
  );
}

export function SignInputView({ step }: { step: StepOf<'sign'> }) {
  return (
    <div className="space-y-3">
      <Box className="flex items-center gap-3">
        <span className={cn('text-sm font-semibold', FIELD_STYLE.sign.text)}>Sign</span>
        <BitCell bit={step.result} field="sign" size="md" changed />
        <span>{step.result ? 'ค่าลบ → 1' : 'ค่าบวก → 0'}</span>
      </Box>
    </div>
  );
}

export function BiasView({ step, fmt }: { step: StepOf<'exponent'>; fmt: FloatFormat }) {
  const w = fmt.expBits;
  if (step.mode === 'encode-bias') {
    const sub = step.result === 0;
    return (
      <div className="space-y-3">
        <Box>
          <p className="num font-mono text-lg">
            {step.ea} + {step.bias} = <b>{sub ? step.ea + step.bias : step.result}</b>
          </p>
          <p className="mt-1 text-sm">
            ฐานสอง {w} บิต:{' '}
            <span
              className={cn('num font-mono font-bold', FIELD_STYLE.exp.text)}
              data-testid="biased-exp"
            >
              {bin8(step.result, w)}
            </span>
          </p>
        </Box>
        <Explain>
          <p>
            Exponent เก็บแบบบวก Bias {step.bias} เพื่อไม่ต้องเก็บเลขติดลบ
            และเทียบขนาดได้เหมือนจำนวนเต็มธรรมดา
          </p>
          {sub && (
            <p>
              เป็น Subnormal จึงเก็บ Exponent field เป็น 0 ทั้งหมด (หมายถึง Exponent −126 และไม่มี
              hidden bit)
            </p>
          )}
        </Explain>
      </div>
    );
  }
  // decode-bias
  return (
    <div className="space-y-3">
      <Box>
        <p className="num font-mono text-lg">
          {step.ea} − {step.bias} = <b>{step.result}</b>
        </p>
      </Box>
      <Explain>
        <p>
          Exponent จริง = ค่าใน field Exponent − 127
          {step.ea === 1 && step.result === emin(fmt) ? ' (Subnormal ใช้ 1 − 127 = −126 เสมอ)' : ''}
        </p>
      </Explain>
    </div>
  );
}

export function FinalEncodeView({ step, fmt }: { step: StepOf<'encode'>; fmt: FloatFormat }) {
  const bin = toBinaryString(step.bits, width(fmt));
  return (
    <div className="space-y-3">
      <Register
        bits={step.bits}
        fmt={fmt}
        label="ผลลัพธ์"
        highlight={{ sign: true, exp: true, frac: true }}
        name="result"
      />
      <Box className="space-y-1 text-sm">
        <p>
          จัดเป็นกลุ่มละ 4 บิต: <span className="num font-mono">{groupNibbles(bin)}</span>
        </p>
        <p>
          Hex:{' '}
          <b className="num font-mono" data-testid="final-hex">
            {step.hex}
          </b>
        </p>
        <p>
          ค่า ({CLASS_TEXT[step.cls]}):{' '}
          <Num value={shortestDecimal(fmt, step.bits)} className="font-bold" />
        </p>
        {(step.cls === 'normal' || step.cls === 'subnormal') && (
          <p className="text-muted">
            ค่าที่เก็บจริงทุกหลัก: <Num value={exactDecimal(fmt, step.bits)} />
          </p>
        )}
      </Box>
    </div>
  );
}

export function FieldsView({ step, fmt }: { step: StepOf<'fields'>; fmt: FloatFormat }) {
  const f = step.fields;
  return (
    <div className="space-y-3">
      <Register
        bits={step.bits}
        fmt={fmt}
        label={`รูปแบบบิต ${step.hex}`}
        showHex={false}
        name="decode"
      />
      <Box className="grid gap-1 text-sm sm:grid-cols-3">
        <p className={FIELD_STYLE.sign.text}>
          Sign = <b className="num font-mono">{f.sign}</b>
        </p>
        <p className={FIELD_STYLE.exp.text}>
          Exponent = <b className="num font-mono">{bin8(f.exp, fmt.expBits)}</b> = {f.exp}
        </p>
        <p className={cn(FIELD_STYLE.frac.text, 'break-all')}>
          Fraction ={' '}
          <b className="num font-mono">{f.frac.toString(2).padStart(fmt.fracBits, '0')}</b>
        </p>
      </Box>
    </div>
  );
}

export function ClassifyView({ step }: { step: StepOf<'classify'> }) {
  const rows = [
    { cls: 'zero', exp: '0', frac: '= 0', meaning: '±0' },
    { cls: 'subnormal', exp: '0', frac: '≠ 0', meaning: 'Subnormal: 0.Fraction × 2⁻¹²⁶' },
    {
      cls: 'normal',
      exp: `1–${step.expMax - 1}`,
      frac: 'อะไรก็ได้',
      meaning: 'Normal: 1.Fraction × 2^(E−127)',
    },
    { cls: 'infinity', exp: String(step.expMax), frac: '= 0', meaning: '±∞' },
    { cls: 'nan', exp: String(step.expMax), frac: '≠ 0', meaning: 'NaN' },
  ] as const;
  return (
    <Box>
      <table className="table table-sm" data-testid="classify-table">
        <thead>
          <tr className="text-xs">
            <th>Exponent</th>
            <th>Fraction</th>
            <th>ความหมาย</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {rows.map((r) => (
            <tr key={r.cls} className={cn(r.cls === step.cls && 'bg-primary/10 font-semibold')}>
              <td className="num font-mono">{r.exp}</td>
              <td>{r.frac}</td>
              <td>
                {r.meaning}
                {r.cls === step.cls && (
                  <span className="ml-2 badge badge-sm badge-primary">ค่านี้</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-sm">
        Exponent = {step.expField}, Fraction {step.fracZero ? '= 0' : '≠ 0'} →{' '}
        <b>{CLASS_TEXT[step.cls]}</b>
      </p>
    </Box>
  );
}

export function SignificandView({ step }: { step: StepOf<'significand'> }) {
  const { int, frac } = fixedPoint(step.significand, step.fracBits);
  return (
    <div className="space-y-3">
      <Box>
        <p className="text-lg">
          <BitLine
            int={int}
            frac={frac.replace(/0+$/, '') || '0'}
            kept={99}
            hiddenLead={step.hidden === 1}
          />
        </p>
      </Box>
      <Explain>
        {step.hidden ? (
          <p>
            ค่า normal มี hidden bit = 1 หน้าจุดเสมอ จึงเติม 1 ไว้หน้า Fraction (ตัดเลข 0
            ท้ายออกเพื่อให้อ่านง่าย)
          </p>
        ) : (
          <p>Subnormal ไม่มี hidden bit หน้าจุดจึงเป็น 0</p>
        )}
      </Explain>
    </div>
  );
}

export function ValueView({
  step,
  fmt,
  bits,
}: {
  step: StepOf<'value'>;
  fmt: FloatFormat;
  bits: bigint;
}) {
  const { int, frac } = fixedPoint(step.significand, step.fracBits);
  const finite = step.cls === 'normal' || step.cls === 'subnormal';
  return (
    <Box className="space-y-2" data-testid="decode-value">
      {finite ? (
        <p className="text-lg">
          (−1)<sup>{step.sign}</sup> × <BitLine int={int} frac={frac.replace(/0+$/, '') || '0'} /> ×{' '}
          <Pow exp={step.exponent} />
        </p>
      ) : (
        <p>ค่านี้เป็น {CLASS_TEXT[step.cls]} ไม่ต้องคำนวณจากสูตร</p>
      )}
      <p className="text-xl font-semibold" data-testid="decoded-value">
        = <Num value={exactDecimal(fmt, bits)} />
      </p>
      {finite && (
        <p className="text-sm text-muted">
          เขียนสั้นที่สุด: <Num value={shortestDecimal(fmt, bits)} />
        </p>
      )}
    </Box>
  );
}
