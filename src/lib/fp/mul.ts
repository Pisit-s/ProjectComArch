import { decode, decodeStep, encodeStep, unpackNormalized } from './decode';
import { type Bit, type FloatFormat, bias, fieldsOf } from './format';
import { mul as mulR } from './rational';
import { rangeStep, roundPack, roundStep } from './round';
import { specialMul } from './special';
import type { FpResult, MulRow, Step } from './steps';

export function popcount(n: bigint): number {
  let c = 0;
  for (; n > 0n; n >>= 1n) if (n & 1n) c++;
  return c;
}

export function mul(fmt: FloatFormat, a: bigint, b: bigint): FpResult {
  const F = fmt.fracBits;
  const b0 = bias(fmt);
  const steps: Step[] = [decodeStep(fmt, 'A', a, true), decodeStep(fmt, 'B', b, true)];

  const va = decode(fmt, a).value;
  const vb = decode(fmt, b).value;
  const exact = va && vb ? mulR(va, vb) : null;

  const special = specialMul(fmt, a, b);
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
  const expSum = ea + eb - b0;
  steps.push({
    id: 'exponent',
    flow: 'exponent',
    kind: 'exponent',
    mode: 'add-bias',
    ea,
    eb,
    bias: b0,
    result: expSum,
    diff: 0,
    swapped: false,
  });

  // Fewer 1 bits in the multiplier means fewer partial products (multiplication commutes).
  const swapped = popcount(ua.sig) < popcount(ub.sig);
  const multiplicand = swapped ? ub.sig : ua.sig;
  const multiplier = swapped ? ua.sig : ub.sig;
  const rows: MulRow[] = [];
  for (let i = F; i >= 0; i--) {
    if ((multiplier >> BigInt(i)) & 1n)
      rows.push({ bitIndex: i, value: multiplicand << BigInt(i) });
  }
  const P = ua.sig * ub.sig;
  steps.push({
    id: 'sig-mul',
    flow: 'significand',
    kind: 'sig-mul',
    multiplicand,
    multiplier,
    swapped,
    rows,
    product: P,
    operandFracBits: F,
    fracBits: 2 * F,
  });

  const twoOrMore = P >= 1n << BigInt(2 * F + 1);
  steps.push({
    id: 'normalize',
    flow: 'normalize',
    kind: 'normalize',
    direction: twoOrMore ? 'right' : 'none',
    amount: twoOrMore ? 1 : 0,
    before: P,
    beforeFracBits: 2 * F,
    after: P,
    afterFracBits: twoOrMore ? 2 * F + 1 : 2 * F,
    expBefore: expSum,
    expAfter: twoOrMore ? expSum + 1 : expSum,
  });

  const rp = roundPack(fmt, sign, P, 2 * F, ua.e + ub.e, 0);
  steps.push(rangeStep(fmt, rp.info), roundStep(rp.info), encodeStep(fmt, rp.bits));
  return { bits: rp.bits, steps, flags: rp.flags, exact };
}
