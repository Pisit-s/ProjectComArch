import { decode, decodeStep, encodeStep, unpackRaw } from './decode';
import {
  type Bit,
  type FloatFormat,
  bias,
  emin,
  fieldsOf,
  precision,
  signMask,
  zeroBits,
} from './format';
import { add as addR } from './rational';
import { rangeStep, roundPack, roundStep } from './round';
import { specialAdd } from './special';
import { type FpResult, NO_FLAGS, type Step } from './steps';

/** Extra low bits kept during alignment: guard, round, sticky. */
const GRS = 3;

/**
 * Textbook floating-point addition / subtraction (Patterson & Hennessy style G/R/S).
 * Subtraction flips the sign of B first, then everything is an addition.
 */
export function addSub(fmt: FloatFormat, a: bigint, b: bigint, op: '+' | '-'): FpResult {
  const F = fmt.fracBits;
  const p = precision(fmt);
  const steps: Step[] = [decodeStep(fmt, 'A', a, false), decodeStep(fmt, 'B', b, false)];

  const bEff = op === '-' ? b ^ signMask(fmt) : b;
  if (op === '-')
    steps.push({ id: 'negate', flow: 'decode', kind: 'negate', before: b, after: bEff });

  const va = decode(fmt, a).value;
  const vb = decode(fmt, bEff).value;
  const exact = va && vb ? addR(va, vb) : null;

  const special = specialAdd(fmt, a, bEff);
  if (special) {
    steps.push(
      {
        id: 'special',
        flow: 'special',
        kind: 'special',
        rule: special.rule,
        resultBits: special.bits,
        flags: special.flags,
      },
      encodeStep(fmt, special.bits),
    );
    return { bits: special.bits, steps, flags: special.flags, exact };
  }

  let x = { ...unpackRaw(fmt, a), s: fieldsOf(fmt, a).sign };
  let y = { ...unpackRaw(fmt, bEff), s: fieldsOf(fmt, bEff).sign };
  const swapped = y.e > x.e || (y.e === x.e && y.sig > x.sig);
  if (swapped) [x, y] = [y, x];
  const d = x.e - y.e;
  const b0 = bias(fmt);

  steps.push({
    id: 'compare',
    flow: 'compare',
    kind: 'exponent',
    mode: 'compare',
    ea: unpackRaw(fmt, a).e + b0,
    eb: unpackRaw(fmt, bEff).e + b0,
    bias: b0,
    result: x.e + b0,
    diff: d,
    swapped,
  });

  const larger = x.sig << BigInt(GRS);
  const before = y.sig << BigInt(GRS);
  let after = before;
  let sticky: Bit = 0;
  if (d > 0) {
    sticky = (before & ((1n << BigInt(d)) - 1n)) !== 0n ? 1 : 0;
    after = (before >> BigInt(d)) | BigInt(sticky);
  }
  const stages: { shift: number; value: bigint; sticky: Bit }[] = [];
  const shown = Math.min(d, F + GRS + 1);
  for (let k = 0; k <= shown; k++) {
    const lost: Bit = (before & ((1n << BigInt(k)) - 1n)) !== 0n ? 1 : 0;
    stages.push({ shift: k, value: (before >> BigInt(k)) | BigInt(lost), sticky: lost });
  }
  if (shown < d) stages.push({ shift: d, value: after, sticky });
  steps.push({
    id: 'align',
    flow: 'align',
    kind: 'align',
    shift: d,
    before,
    after,
    sticky,
    stages,
    larger,
    fracBits: F + GRS,
    exponent: x.e + b0,
  });

  const sameSign = x.s === y.s;
  const t = sameSign ? larger + after : larger - after;
  const sign: Bit = x.s;
  steps.push({
    id: 'sig-add',
    flow: 'significand',
    kind: 'sig-add',
    a: larger,
    b: after,
    op: sameSign ? '+' : '-',
    result: t,
    fracBits: F + GRS,
    sign,
  });

  if (t === 0n) {
    // exact cancellation: +0 under round to nearest
    const bits = zeroBits(fmt, 0);
    steps.push(encodeStep(fmt, bits));
    return { bits, steps, flags: { ...NO_FLAGS }, exact };
  }

  let e = x.e;
  let tn = t;
  let direction: 'left' | 'right' | 'none' = 'none';
  let amount = 0;
  if (tn >= 1n << BigInt(p + GRS)) {
    tn = (tn >> 1n) | (tn & 1n);
    e += 1;
    direction = 'right';
    amount = 1;
  } else {
    const minE = emin(fmt);
    while (tn < 1n << BigInt(p + GRS - 1) && e > minE) {
      tn <<= 1n;
      e -= 1;
      amount += 1;
    }
    if (amount > 0) direction = 'left';
  }
  steps.push({
    id: 'normalize',
    flow: 'normalize',
    kind: 'normalize',
    direction,
    amount,
    before: t,
    beforeFracBits: F + GRS,
    after: tn,
    afterFracBits: F + GRS,
    expBefore: x.e + b0,
    expAfter: e + b0,
  });

  const rp = roundPack(fmt, sign, tn, F + GRS, e, 0);
  if (rp.info.range !== 'ok') steps.push(rangeStep(fmt, rp.info));
  steps.push(roundStep(rp.info), encodeStep(fmt, rp.bits));
  return { bits: rp.bits, steps, flags: rp.flags, exact };
}
