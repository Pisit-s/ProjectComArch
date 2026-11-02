import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  BINARY16,
  BINARY64,
  OPS,
  type Op,
  encodeBits,
  isNaNBits,
  operate,
  shortestDecimal,
} from '@/lib/fp';

/**
 * The Lab also offers binary16 and binary64. Oracles: binary64 is the native JS double;
 * binary16 uses Math.f16round on the double result (53 >= 2 * 11 + 2, so rounding twice is safe).
 */
const view = new DataView(new ArrayBuffer(8));
const f64 = (b: bigint) => (view.setBigUint64(0, b), view.getFloat64(0));
const bits64 = (x: number) => (view.setFloat64(0, x), view.getBigUint64(0));
const f16 = (b: bigint) => (view.setUint16(0, Number(b)), view.getFloat16(0));
const bits16 = (x: number) => (view.setFloat16(0, x), BigInt(view.getUint16(0)));

const js = (op: Op, x: number, y: number) =>
  op === '+' ? x + y : x - y;

const RUNS = 20_000;

describe('binary64 oracle (native double)', () => {
  const anyBits = fc.bigInt(0n, (1n << 64n) - 1n);
  const near = fc
    .tuple(fc.bigInt(0n, 1n), fc.bigInt(1013n, 1033n), fc.bigInt(0n, (1n << 52n) - 1n))
    .map(([s, e, f]) => (s << 63n) | (e << 52n) | f);
  const sub = fc
    .tuple(fc.bigInt(0n, 1n), fc.bigInt(1n, (1n << 52n) - 1n))
    .map(([s, f]) => (s << 63n) | f);
  const pairs = fc.oneof(
    fc.tuple(anyBits, anyBits),
    fc.tuple(near, near),
    fc.tuple(sub, near),
    fc.tuple(sub, sub),
  );
  for (const op of OPS) {
    it(`op ${op}`, () => {
      fc.assert(
        fc.property(pairs, ([a, b]) => {
          const got = operate(BINARY64, op, a, b).bits;
          const want = js(op, f64(a), f64(b));
          return Number.isNaN(want) ? isNaNBits(BINARY64, got) : got === bits64(want);
        }),
        { numRuns: RUNS },
      );
    });
  }
  it('known values', () => {
    expect(encodeBits(BINARY64, '0.1')).toBe(0x3fb999999999999an);
    const s = operate(BINARY64, '+', encodeBits(BINARY64, '0.1')!, encodeBits(BINARY64, '0.2')!);
    expect(s.bits).toBe(0x3fd3333333333334n);
    expect(shortestDecimal(BINARY64, s.bits)).toBe('0.30000000000000004');
  });
  it('encode matches Number parsing for random decimals', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[1-9][0-9]{0,16}$/),
        fc.integer({ min: -320, max: 308 }),
        (d, e) => {
          const t = `${d}e${e}`;
          return encodeBits(BINARY64, t) === bits64(Number(t));
        },
      ),
      { numRuns: RUNS },
    );
  });
});

describe('binary16 oracle (Math.f16round)', () => {
  const anyBits = fc.bigInt(0n, 0xffffn);
  for (const op of OPS) {
    it(`op ${op}`, () => {
      fc.assert(
        fc.property(anyBits, anyBits, (a, b) => {
          const got = operate(BINARY16, op, a, b).bits;
          const want = Math.f16round(js(op, f16(a), f16(b)));
          return Number.isNaN(want) ? isNaNBits(BINARY16, got) : got === bits16(want);
        }),
        { numRuns: RUNS },
      );
    });
  }
  it('known values', () => {
    expect(encodeBits(BINARY16, '0.1')).toBe(0x2e66n);
    expect(encodeBits(BINARY16, '65504')).toBe(0x7bffn);
    expect(encodeBits(BINARY16, '65520')).toBe(0x7c00n);
  });
});
