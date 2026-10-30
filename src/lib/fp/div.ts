import { decode, decodeStep, encodeStep, unpackNormalized } from './decode';
import { type Bit, type FloatFormat, bias, fieldsOf, precision } from './format';
import { div as divR } from './rational';
import { rangeStep, roundPack, roundStep } from './round';
import { specialDiv } from './special';
import type { DivRow, FpResult, Step } from './steps';

export function div(fmt: FloatFormat, a: bigint, b: bigint): FpResult {
  const F = fmt.fracBits;
  const p = precision(fmt);
  const b0 = bias(fmt);
  const steps: Step[] = [decodeStep(fmt, 'A', a, true), decodeStep(fmt, 'B', b, true)];

  const va = decode(fmt, a).value;
  const vb = decode(fmt, b).value;
  const exact = va && vb && vb.num !== 0n ? divR(va, vb) : null;

  const special = specialDiv(fmt, a, b);
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

  const sa = fieldsOf(fmt, a).sign;
  const sb = fieldsOf(fmt, b).sign;
  const sign = (sa ^ sb) as Bit;
  steps.push({ id: 'sign', flow: 'sign', kind: 'sign', a: sa, b: sb, result: sign, rule: 'xor' });

  const ua = unpackNormalized(fmt, a);
  const ub = unpackNormalized(fmt, b);
  const ea = ua.e + b0;
  const eb = ub.e + b0;
  const expDiff = ea - eb + b0;
  steps.push({
    id: 'exponent',
    flow: 'exponent',
    kind: 'exponent',
    mode: 'sub-bias',
    ea,
    eb,
    bias: b0,
    result: expDiff,
    diff: 0,
    swapped: false,
  });

  // Restoring division, one quotient bit per round: p bits + guard + round + 1 spare.
  const rounds = p + 2 + 1;
  const rows: DivRow[] = [];
  let r = ua.sig;
  let Q = 0n;
  for (let i = 0; i < rounds; i++) {
    const subtracted = r >= ub.sig;
    const after = subtracted ? r - ub.sig : r;
    const qBit: Bit = subtracted ? 1 : 0;
    rows.push({ remainder: r, subtracted, qBit, after });
    Q = (Q << 1n) | BigInt(qBit);
    r = after << 1n;
  }
  const remainder = r >> 1n;
  steps.push({
    id: 'sig-div',
    flow: 'significand',
    kind: 'sig-div',
    dividend: ua.sig,
    divisor: ub.sig,
    rows,
    quotient: Q,
    remainder,
    operandFracBits: F,
    fracBits: p + 2,
  });

  const belowOne = Q >> BigInt(p + 2) === 0n;
  steps.push({
    id: 'normalize',
    flow: 'normalize',
    kind: 'normalize',
    direction: belowOne ? 'left' : 'none',
    amount: belowOne ? 1 : 0,
    before: Q,
    beforeFracBits: p + 2,
    after: Q,
    afterFracBits: belowOne ? p + 1 : p + 2,
    expBefore: expDiff,
    expAfter: belowOne ? expDiff - 1 : expDiff,
  });

  const rp = roundPack(fmt, sign, Q, p + 2, ua.e - ub.e, remainder !== 0n ? 1 : 0);
  steps.push(rangeStep(fmt, rp.info), roundStep(rp.info), encodeStep(fmt, rp.bits));
  return { bits: rp.bits, steps, flags: rp.flags, exact };
}
