import {
  type Bit,
  type FloatFormat,
  R,
  type Rational,
  type RoundDecision,
  type StepOf,
  bias,
  emin,
  formatRational,
  roundRational,
  zeroBits,
} from '@/lib/fp';

/**
 * The number line of scene 5.4: the two values the format can store around the exact result,
 * and where the exact result sits between them (pos = 0 at the lower value, 1 at the upper).
 * Everything is exact; convert pos to a Number only when drawing pixels.
 */
export interface RoundLine {
  downBits: bigint;
  upBits: bigint;
  down: string;
  up: string;
  exact: string;
  ulp: string;
  pos: Rational;
  chosen: 'down' | 'up';
  tie: boolean;
  decision: RoundDecision;
}

export function buildRoundLine(
  fmt: FloatFormat,
  round: StepOf<'round'>,
  exact: Rational,
  sign: Bit,
): RoundLine {
  const F = fmt.fracBits;
  const e = round.subnormal ? emin(fmt) : round.expBefore - bias(fmt);
  const ulp = R.pow2(e - F);
  const down = R.mul(R.fromBigInt(round.kept), ulp);
  const up = R.add(down, ulp);
  const mag = R.absR(exact);
  const pos = R.div(R.sub(mag, down), ulp);
  const bitsOf = (v: Rational) =>
    v.num === 0n ? zeroBits(fmt, sign) : roundRational(fmt, sign, v).bits;
  const tie = round.decision === 'tie-even-down' || round.decision === 'tie-even-up';
  return {
    downBits: bitsOf(down),
    upBits: bitsOf(up),
    down: formatRational(down),
    up: formatRational(up),
    exact: formatRational(mag),
    ulp: formatRational(ulp),
    pos,
    chosen: round.rounded ? 'up' : 'down',
    tie,
    decision: round.decision,
  };
}
