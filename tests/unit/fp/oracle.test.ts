import fc from 'fast-check';
import { describe, it } from 'vitest';
import { OPS } from '@/lib/fp';
import { PAIR_KINDS, matchesOracle } from './oracle-gen';

/**
 * Math.fround(a op b) is a valid binary32 oracle: computing in binary64 and rounding once to
 * binary32 equals direct binary32 rounding for + - * / because 53 >= 2 * 24 + 2.
 */
const RUNS = 20_000;

describe('binary32 oracle (Math.fround)', () => {
  for (const op of OPS) {
    for (const [name, arb] of PAIR_KINDS) {
      it(`${op} ${name}`, () => {
        fc.assert(
          fc.property(arb, ([a, b]) => matchesOracle(op, a, b)),
          { numRuns: RUNS },
        );
      });
    }
  }
});
