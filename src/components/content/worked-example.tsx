import { FIELD_STYLE } from '@/components/bits/field-style';
import { Register } from '@/components/bits/register';
import { Num, Pow } from '@/components/ui/num';
import { BitLine } from '@/components/viz/bit-line';
import { CLASS_TEXT, OP_SYMBOL, ROUND_TEXT } from '@/content/step-text';
import { findExample } from '@/content/examples';
import { bin8, fixedPoint } from '@/lib/display';
import {
  BINARY32,
  type StepOf,
  decodeWithSteps,
  encodeBits,
  encodeDecimal,
  exactDecimal,
  shortestDecimal,
  simulate,
  splitFields,
  toHex,
} from '@/lib/fp';
import { cn } from '@/lib/utils';

/**
 * Worked examples are always computed by the engine: content never types bits, hex or stored
 * values by hand (PLAN.md 2.6).
 */

const F = BINARY32;

function find<K extends string>(steps: { kind: string }[], kind: K) {
  return steps.find((s) => s.kind === kind) as never;
}

export function EncodeWorked({ input, title }: { input: string; title?: string }) {
  const r = encodeDecimal(F, input);
  if (!r.ok) return null;
  const ib = find(r.steps, 'int-binary') as StepOf<'int-binary'>;
  const fb = find(r.steps, 'frac-binary') as StepOf<'frac-binary'>;
  const pt = find(r.steps, 'point') as StepOf<'point'>;
  const ex = find(r.steps, 'exponent') as StepOf<'exponent'>;
  const rd = find(r.steps, 'round') as StepOf<'round'>;
  const f = splitFields(F, r.bits);
  const norm = fixedPoint(pt.normalized, F.fracBits + 3);
  return (
    <figure
      className="glass-solid space-y-3 rounded-xl p-4 ring-1 ring-foreground/10"
      data-testid={`worked-${input}`}
    >
      <figcaption className="font-display text-lg font-semibold">
        {title ?? `ตัวอย่าง: encode ${input}`}
      </figcaption>
      <ol className="list-decimal space-y-2 pl-5 text-[0.95rem]">
        <li>
          แปลงเป็นฐานสอง: {input.replace(/^-/, '')} = <BitLine int={ib.binary} frac={fb.binary} />
          <sub>2</sub>
        </li>
        <li>
          Normalize:{' '}
          <BitLine int={norm.int} frac={norm.frac.replace(/0+$/, '') || '0'} hiddenLead /> ×{' '}
          <Pow exp={pt.eUsed} /> (เลื่อนจุดไปทาง{pt.direction === 'left' ? 'ซ้าย' : 'ขวา'}{' '}
          {pt.amount} ตำแหน่ง)
        </li>
        <li>
          Sign: {r.input.negative ? 'ค่าลบ' : 'ค่าบวก'} →{' '}
          <b className={cn('num font-mono', FIELD_STYLE.sign.text)}>{f.sign}</b>
        </li>
        <li>
          Biased exponent: {ex.ea} + 127 = {ex.result} ={' '}
          <b className={cn('num font-mono', FIELD_STYLE.exp.text)}>{bin8(ex.result)}</b>
        </li>
        <li>
          Fraction (บิตหลังจุด เติม 0 จนครบ 23 บิต):{' '}
          <b className={cn('num font-mono break-all', FIELD_STYLE.frac.text)}>{f.frac}</b>
          {rd.decision !== 'exact' && <> · {ROUND_TEXT[rd.decision].short}</>}
        </li>
        <li>
          รวม:{' '}
          <span className="num font-mono break-all">
            <span className={FIELD_STYLE.sign.text}>{f.sign}</span>{' '}
            <span className={FIELD_STYLE.exp.text}>{f.exp}</span>{' '}
            <span className={FIELD_STYLE.frac.text}>{f.frac}</span>
          </span>{' '}
          = <b className="num font-mono">{toHex(r.bits, 32)}</b>
        </li>
      </ol>
      <Register bits={r.bits} label={input} name={`worked-${input}`} />
    </figure>
  );
}

export function DecodeWorked({ source }: { source: string }) {
  const bits = encodeBits(F, source)!;
  const d = decodeWithSteps(F, bits);
  const f = splitFields(F, bits);
  const ex = find(d.steps, 'exponent') as StepOf<'exponent'>;
  const sig = fixedPoint(d.significand, F.fracBits);
  return (
    <figure className="glass-solid space-y-3 rounded-xl p-4 ring-1 ring-foreground/10">
      <figcaption className="font-display text-lg font-semibold">
        ตัวอย่าง: decode <span className="num font-mono">{toHex(bits, 32)}</span>
      </figcaption>
      <Register bits={bits} showHex={false} name="worked-decode" />
      <ol className="list-decimal space-y-2 pl-5 text-[0.95rem]">
        <li>
          แยก field: Sign <b className={cn('num font-mono', FIELD_STYLE.sign.text)}>{f.sign}</b> ·
          Exponent <b className={cn('num font-mono', FIELD_STYLE.exp.text)}>{f.exp}</b> ={' '}
          {d.expField} · Fraction{' '}
          <b className={cn('num font-mono break-all', FIELD_STYLE.frac.text)}>{f.frac}</b>
        </li>
        <li>
          Exponent 1–254 จึงเป็นค่า {CLASS_TEXT[d.cls]} · Exponent จริง = {ex.ea} − 127 ={' '}
          {ex.result}
        </li>
        <li>
          Significand = hidden bit 1 + Fraction ={' '}
          <BitLine int={sig.int} frac={sig.frac.replace(/0+$/, '') || '0'} hiddenLead />
        </li>
        <li>
          ค่า = (−1)<sup>{f.sign}</sup> ×{' '}
          <BitLine int={sig.int} frac={sig.frac.replace(/0+$/, '') || '0'} /> ×{' '}
          <Pow exp={ex.result} /> ={' '}
          <b>
            <Num value={exactDecimal(F, bits)} />
          </b>
        </li>
      </ol>
    </figure>
  );
}

/** Compact summary of an arithmetic example (Chapters 4-5), all numbers from the engine. */
export function OpWorked({ id }: { id: string }) {
  const ex = findExample(id);
  if (!ex) return null;
  const s = simulate(F, ex.op, ex.a, ex.b);
  if (!s.ok) return null;
  return (
    <div
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-white/80 p-3 ring-1 ring-line"
      data-testid={`opworked-${id}`}
    >
      <span className="badge badge-sm badge-primary">{id}</span>
      <span className="num font-mono">
        {ex.a} {OP_SYMBOL[ex.op]} {ex.b}
      </span>
      <span>
        = <b className="num font-mono">{toHex(s.result.bits, 32)}</b> ={' '}
        <Num value={shortestDecimal(F, s.result.bits)} />
      </span>
      <span className="w-full text-sm text-muted">{ex.note}</span>
    </div>
  );
}

function trimCols(values: bigint[], fracBits: number): number {
  let need = 1;
  for (const v of values) {
    if (v === 0n) continue;
    const s = v.toString(2);
    need = Math.max(need, fracBits - (s.length - s.replace(/0+$/, '').length));
  }
  return Math.min(need, fracBits);
}

/** Every step of a multiplication or division example in one static card (M3, D3 in Chapter 5). */
export function OpDetail({ id }: { id: string }) {
  const ex = findExample(id);
  if (!ex) return null;
  const s = simulate(F, ex.op, ex.a, ex.b);
  if (!s.ok) return null;
  const st = s.result.steps;
  const decA = find(st, 'decode') as StepOf<'decode'>;
  const decB = st.filter((x) => x.kind === 'decode')[1] as StepOf<'decode'>;
  const sign = find(st, 'sign') as StepOf<'sign'>;
  const exp = find(st, 'exponent') as StepOf<'exponent'>;
  const norm = find(st, 'normalize') as StepOf<'normalize'>;
  const rd = find(st, 'round') as StepOf<'round'>;
  const mulStep = st.find((x) => x.kind === 'sig-mul') as StepOf<'sig-mul'> | undefined;
  const divStep = st.find((x) => x.kind === 'sig-div') as StepOf<'sig-div'> | undefined;
  const fa = splitFields(F, decA.bits);
  const fb = splitFields(F, decB.bits);
  const fr = splitFields(F, s.result.bits);
  const sig = (v: bigint, frac: number) => {
    const p = fixedPoint(v, frac);
    return <BitLine int={p.int} frac={p.frac.replace(/0+$/, '') || '0'} />;
  };
  const isMul = ex.op === '*';
  const fields = (f: { sign: string; exp: string; frac: string }) => (
    <span className="num font-mono break-all">
      <span className={FIELD_STYLE.sign.text}>{f.sign}</span>{' '}
      <span className={FIELD_STYLE.exp.text}>{f.exp}</span>{' '}
      <span className={FIELD_STYLE.frac.text}>{f.frac}</span>
    </span>
  );
  return (
    <figure
      className="glass-solid space-y-3 rounded-xl p-4 ring-1 ring-foreground/10"
      data-testid={`detail-${id}`}
    >
      <figcaption className="font-display text-lg font-semibold">
        ตัวอย่าง {id} แบบละเอียด: {ex.a} {OP_SYMBOL[ex.op]} {ex.b}
      </figcaption>
      <ol className="list-decimal space-y-2 pl-5 text-[0.95rem]">
        <li>
          {ex.a} = {fields(fa)} → Significand {sig(decA.significand, F.fracBits)}, Biased exponent{' '}
          {decA.exponent}
          <br />
          {ex.b} = {fields(fb)} → Significand {sig(decB.significand, F.fracBits)}, Biased exponent{' '}
          {decB.exponent}
        </li>
        <li>
          Sign: {sign.a} XOR {sign.b} = <b>{sign.result}</b>
        </li>
        <li>
          Exponent: {exp.ea} {isMul ? '+' : '−'} {exp.eb} {isMul ? '−' : '+'} {exp.bias} ={' '}
          <b>{exp.result}</b>
        </li>
        {mulStep && (
          <li>
            Significand: ตัวคูณ {sig(mulStep.multiplier, F.fracBits)} มีบิต 1 อยู่{' '}
            {mulStep.rows.length} ตัว จึงมี partial product {mulStep.rows.length} แถว
            <pre className="num mt-1 overflow-x-auto rounded-lg bg-ice-50 p-2 font-mono text-sm leading-relaxed">
              {(() => {
                const cols = trimCols(
                  [...mulStep.rows.map((r) => r.value), mulStep.product],
                  mulStep.fracBits,
                );
                const line = (v: bigint) => {
                  const p = fixedPoint(v, mulStep.fracBits);
                  return `${p.int.padStart(2, ' ')}.${p.frac.slice(0, cols)}`;
                };
                return [
                  ...mulStep.rows.map((r, i) => `${i === 0 ? '  ' : '+ '}${line(r.value)}`),
                  `= ${line(mulStep.product)}`,
                ].join('\n');
              })()}
            </pre>
          </li>
        )}
        {divStep && (
          <li>
            Significand: {sig(divStep.dividend, F.fracBits)} ÷ {sig(divStep.divisor, F.fracBits)}{' '}
            ด้วยการหารยาว {divStep.rows.length} รอบ ได้ผลหาร{' '}
            <span className="num font-mono break-all">
              {(() => {
                const q = divStep.quotient.toString(2).padStart(divStep.rows.length, '0');
                return `${q[0]}.${q.slice(1)}`;
              })()}
            </span>{' '}
            เศษสุดท้าย{divStep.remainder === 0n ? ' = 0' : ' ≠ 0 (ไม่มีวันเป็น 0)'}
          </li>
        )}
        <li>
          Normalize:{' '}
          {norm.direction === 'none'
            ? 'อยู่ในรูป 1.xxx แล้ว ไม่ต้องเลื่อน'
            : norm.direction === 'right'
              ? `ผล ≥ 2 เลื่อนขวา 1 บิต Exponent ${norm.expBefore} + 1 = ${norm.expAfter}`
              : `ผล < 1 เลื่อนซ้าย 1 บิต Exponent ${norm.expBefore} − 1 = ${norm.expAfter}`}
        </li>
        <li>
          ปัดเศษ: G = {rd.guard}, R = {rd.round}, S = {rd.sticky}
          {divStep && divStep.remainder !== 0n && ' (S มาจากเศษที่ไม่เป็นศูนย์)'} →{' '}
          {ROUND_TEXT[rd.decision].short}
        </li>
        <li>
          ผลลัพธ์: {fields(fr)} = <b className="num font-mono">{toHex(s.result.bits, 32)}</b> ={' '}
          <Num value={shortestDecimal(F, s.result.bits)} />
          {s.stored && s.typed && s.error && s.error.num !== 0n && (
            <span className="text-muted">
              {' '}
              (ค่าที่เก็บจริง <Num value={exactDecimal(F, s.result.bits)} />)
            </span>
          )}
        </li>
      </ol>
    </figure>
  );
}
