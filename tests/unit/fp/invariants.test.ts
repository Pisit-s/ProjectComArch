import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { OPS, type Op, type Step, encodeDecimal, operate, simulate } from '@/lib/fp';
import { F32, stepOf } from './helpers';
import { PAIR_KINDS } from './oracle-gen';

const anyPair = fc.oneof(...PAIR_KINDS.map(([, arb]) => arb));

function checkCommon(steps: Step[], bits: bigint): void {
  const ids = steps.map((s) => s.id);
  expect(new Set(ids).size).toBe(ids.length);
  const last = steps.at(-1)!;
  expect(last.kind).toBe('encode');
  if (last.kind === 'encode') expect(last.bits).toBe(bits);
}

function checkOp(op: Op, a: bigint, b: bigint): boolean {
  const r = operate(F32, op, a, b);
  checkCommon(r.steps, r.bits);
  for (const s of r.steps) {
    if (s.kind === 'round' && s.decision.startsWith('tie')) {
      expect([s.guard, s.round, s.sticky]).toEqual([1, 0, 0]);
    }
  }
  return true;
}

describe('step invariants', () => {
  for (const op of OPS) {
    it(`op ${op}`, () => {
      fc.assert(
        fc.property(anyPair, ([a, b]) => checkOp(op, a, b)),
        { numRuns: 5_000 },
      );
    });
  }

  it('encode steps', () => {
    for (const text of ['5.75', '0.1', '-0', '1e-40', '3.5e38', 'nan', '123456.789', '7e-46']) {
      const r = encodeDecimal(F32, text);
      if (!r.ok) throw new Error(text);
      checkCommon(r.steps, r.bits);
    }
  });

  it('add/sub of opposite values cancels to +0', () => {
    const r = operate(F32, '-', 0x40490fdbn, 0x40490fdbn);
    expect(r.bits).toBe(0n);
    expect(stepOf(r, 'sig-add').result).toBe(0n);
  });

  it('add overflow and subnormal results report a range step', () => {
    const big = operate(F32, '+', 0x7f7fffffn, 0x7f7fffffn);
    expect(big.bits).toBe(0x7f800000n);
    expect(stepOf(big, 'range').outcome).toBe('overflow');
    const tiny = operate(F32, '-', 0x00800001n, 0x00800000n);
    expect(tiny.bits).toBe(1n);
    expect(stepOf(tiny, 'range').outcome).toBe('underflow-subnormal');
  });

  it('special rules for add/sub', () => {
    const rule = (op: Op, a: bigint, b: bigint) => stepOf(operate(F32, op, a, b), 'special').rule;
    expect(rule('+', 0x7fc00000n, 1n)).toBe('nan-operand');
    expect(rule('-', 0x7f800000n, 0x7f800000n)).toBe('inf-minus-inf');
    expect(rule('+', 0x7f800000n, 0x7f800000n)).toBe('inf-operand');
    expect(rule('+', 0x3f800000n, 0xff800000n)).toBe('inf-operand');
    expect(rule('+', 0x80000000n, 0x80000000n)).toBe('zero-plus-zero');
    expect(operate(F32, '+', 0x80000000n, 0x80000000n).bits).toBe(0x80000000n);
    expect(operate(F32, '-', 0x80000000n, 0n).bits).toBe(0x80000000n);
    expect(rule('+', 0n, 0x3f800000n)).toBe('add-zero');
    expect(rule('+', 0x3f800000n, 0n)).toBe('add-zero');
  });

});

describe('simulate', () => {
  it('reports parse errors per operand', () => {
    expect(simulate(F32, '+', '1,5', '2')).toEqual({
      ok: false,
      errorA: { kind: 'comma' },
      errorB: null,
    });
    expect(simulate(F32, '-', '1', '')).toEqual({
      ok: false,
      errorA: null,
      errorB: { kind: 'empty' },
    });
    const ok = simulate(F32, '+', '6.5', '3.75');
    expect(ok.ok && ok.result.bits).toBe(0x41240000n);
  });
});

describe('align stages', () => {
  it('end at the aligned value and grow sticky monotonically', () => {
    fc.assert(
      fc.property(anyPair, ([a, b]) => {
        const r = operate(F32, '+', a, b);
        const al = r.steps.find((s) => s.kind === 'align');
        if (!al || al.kind !== 'align') return true;
        const last = al.stages.at(-1)!;
        expect(last.value).toBe(al.after);
        expect(last.shift).toBe(al.shift);
        for (let i = 1; i < al.stages.length; i++) {
          expect(al.stages[i].sticky >= al.stages[i - 1].sticky).toBe(true);
        }
        return true;
      }),
      { numRuns: 2_000 },
    );
  });
});

describe('simulate comparison values', () => {
  it('0.1 + 0.2: typed 0.3, stored differs', () => {
    const s = simulate(F32, '+', '0.1', '0.2');
    if (!s.ok) throw new Error();
    expect(s.typed).toEqual({ num: 3n, den: 10n });
    expect(s.error && s.error.num > 0n).toBe(true);
  });
  it('special values have no typed result', () => {
    const s = simulate(F32, '+', 'inf', '1');
    if (!s.ok) throw new Error();
    expect(s.typed).toBeNull();
    expect(s.stored).toBeNull();
    const m = simulate(F32, '-', '5', '3');
    expect(m.ok && m.error).toEqual({ num: 0n, den: 1n });
    const p = simulate(F32, '-', '-0', '0');
    expect(p.ok && p.typed).toEqual({ num: 0n, den: 1n });
  });
});
