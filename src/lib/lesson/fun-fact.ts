import {
  BINARY64,
  R,
  addSub,
  bias,
  decode,
  encodeBits,
  formatRational,
  shortestDecimal,
} from '@/lib/fp';

/**
 * Scene 5.5 (slide w03c_mult pages 21-22) in double precision, computed by the engine:
 * x = 1e17, y = x + 20, y - x, (-x + x) + 20 and -x + (x + 20), plus the spacing (ulp) near x.
 */
export interface FunFact {
  yMinusX: string;
  leftFirst: string;
  rightFirst: string;
  ulp: string;
  /** Doubles near x: x, x + ulp, x + 2 ulp (for the tick marks). */
  ticks: string[];
  /** The same ticks as offsets from x: 0, ulp, 2 ulp. */
  offsets: string[];
}

export function buildFunFact(xText = '1e17', add = '20'): FunFact {
  const F = BINARY64;
  const x = encodeBits(F, xText)!;
  const negX = encodeBits(F, `-${xText}`)!;
  const t = encodeBits(F, add)!;
  const plus = (a: bigint, b: bigint) => addSub(F, a, b, '+').bits;
  const y = plus(x, t);
  const yMinusX = addSub(F, y, x, '-').bits;
  const leftFirst = plus(plus(negX, x), t);
  const rightFirst = plus(negX, plus(x, t));
  const d = decode(F, x);
  const ulp = R.pow2(d.expField - bias(F) - F.fracBits);
  const xv = d.value!;
  const steps = [0, 1, 2].map((k) => R.mul(R.fromBigInt(BigInt(k)), ulp));
  const ticks = steps.map((o) => formatRational(R.add(xv, o), { scientific: false }));
  const offsets = steps.map((o) => formatRational(o));
  return {
    yMinusX: shortestDecimal(F, yMinusX),
    leftFirst: shortestDecimal(F, leftFirst),
    rightFirst: shortestDecimal(F, rightFirst),
    ulp: formatRational(ulp),
    ticks,
    offsets,
  };
}
