/**
 * Long oracle run: >= 1,000,000 binary32 cases against Math.fround (docs/plans/stage1-floating-point.md 4.5).
 * Run with `npm run test:long`.
 */
import fc from 'fast-check';
import { OPS } from '../src/lib/fp/simulate';
import { PAIR_KINDS, matchesOracle } from '../tests/unit/fp/oracle-gen';

const PER_CASE = 42_000; // 4 ops x 6 kinds x 42,000 = 1,008,000
let total = 0;
const started = Date.now();
for (const op of OPS) {
  for (const [name, arb] of PAIR_KINDS) {
    fc.assert(
      fc.property(arb, ([a, b]) => matchesOracle(op, a, b)),
      { numRuns: PER_CASE },
    );
    total += PER_CASE;
    process.stdout.write(`ok ${op} ${name} (${total.toLocaleString()})\n`);
  }
}
console.log(
  `PASS ${total.toLocaleString()} cases in ${((Date.now() - started) / 1000).toFixed(1)}s`,
);
