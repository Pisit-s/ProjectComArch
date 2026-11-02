import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { BINARY32, type Op, R, simulate, toHex } from '@/lib/fp';
import { chooseWindow, fullWindow } from '@/lib/lesson/bit-window';
import { BLOCK_IDS, circuitState } from '@/lib/lesson/circuit-map';
import { buildFpFrames } from '@/lib/lesson/fp-frames';
import { buildRoundLine } from '@/lib/lesson/round-line';
import { exponentWindow } from '@/lib/lesson/window';
import { f32FromBits } from '../fp/helpers';
import { PAIR_KINDS } from '../fp/oracle-gen';

const F = BINARY32;
function scene(a: string, op: '+' | '-', b: string) {
  const s = simulate(F, op, a, b);
  if (!s.ok) throw new Error('bad input');
  return { sim: s, sc: buildFpFrames(F, s) };
}
const frame = (sc: ReturnType<typeof buildFpFrames>, id: string) =>
  sc.frames.find((f) => f.id === id)!;

describe('golden D.1 (add / sub binary32)', () => {
  const rows: [string, '+' | '-', string, string, number, string, number, string?, boolean?][] = [
    // a, op, b, hex, d, normalize direction, amount, GRS, swapped
    ['6.5', '+', '3.75', '0x41240000', 1, 'right', 1, '000', false],
    ['3.75', '-', '6.5', '0xC0300000', 1, 'left', 1, '000', true],
    ['0.5', '-', '0.4375', '0x3D800000', 1, 'left', 3, '000', false],
    ['9.75', '+', '0.5625', '0x41250000', 4, 'none', 0, '000', false],
    ['1.5', '+', '0.375', '0x3FF00000', 2, 'none', 0, '000', false],
    ['100', '+', '0.1', '0x42C83333', 10, 'none', 0, '001', false],
    ['0.1', '+', '0.2', '0x3E99999A', 1, 'right', 1, '110', true],
    ['1', '+', '1e-8', '0x3F800000', 27, 'none', 0, '001', false],
    ['16777216', '+', '1', '0x4B800000', 24, 'none', 0, '100', false],
    ['16777216', '+', '3', '0x4B800002', 23, 'none', 0, '100', false],
    ['1.0000001', '-', '1', '0x34000000', 0, 'left', 23, '000', false],
  ];
  for (const [a, op, b, hex, d, dir, amount, grs, swapped] of rows) {
    it(`${a} ${op} ${b}`, () => {
      const { sc } = scene(a, op, b);
      expect(sc.result.hex).toBe(hex);
      expect(sc.shift).toBe(d);
      const n = frame(sc, 'normalize').normalize!;
      expect([n.direction, n.amount]).toEqual([dir, amount]);
      const r = frame(sc, 'round');
      expect(`${r.grs!.g}${r.grs!.r}${r.grs!.s}`).toBe(grs);
      expect(sc.frames.some((f) => f.id === 'swap')).toBe(swapped);
      expect(sc.frames.filter((f) => f.stage === 'align').length).toBe(Math.min(d, 4));
      expect(sc.frames.some((f) => f.stage === 'alignFast')).toBe(d > 4);
      expect(sc.frames.some((f) => f.id === 'negate')).toBe(op === '-');
    });
  }

  it('A7 6.5 + 3.75 in detail', () => {
    const { sc } = scene('6.5', '+', '3.75');
    expect(frame(sc, 'unpack').params).toMatchObject({
      EA: '129',
      EB: '128',
      sigA: '1.101',
      sigB: '1.111',
    });
    expect(frame(sc, 'unpack').rows.map((r) => r.exp)).toEqual([2, 1]);
    expect(frame(sc, 'add').params).toMatchObject({ a: '1.101', b: '0.1111', sum: '10.1001' });
    expect(frame(sc, 'add').captionKey).toBe('fp.add');
    expect(frame(sc, 'normalize').params).toMatchObject({ k: '1', e: '3' });
    expect(frame(sc, 'round').captionKey).toBe('fp.roundExact');
    expect(frame(sc, 'pack').params).toEqual({ hex: '0x41240000', value: '10.25' });
    expect(sc.result.inexact).toBe(false);
    expect(chooseWindow(sc).mode).toBe('compact');
  });
  it('rounding captions and tail window', () => {
    expect(frame(scene('0.1', '+', '0.2').sc, 'round').captionKey).toBe('fp.roundUp');
    expect(frame(scene('16777216', '+', '1').sc, 'round').captionKey).toBe('fp.tieDown');
    expect(frame(scene('16777216', '+', '3').sc, 'round').captionKey).toBe('fp.tieUp');
    expect(frame(scene('1', '+', '1e-8').sc, 'round').captionKey).toBe('fp.roundDown');
    const w = chooseWindow(scene('0.1', '+', '0.2').sc);
    expect(w.mode).toBe('tail');
    expect(w.columns).toContain('gap');
    expect(w.hidden).toBe(15);
    expect(fullWindow(26).columns).toHaveLength(28);
  });
  it('subtraction uses the sub caption and the sign of the bigger operand', () => {
    const { sc } = scene('3.75', '-', '6.5');
    expect(frame(sc, 'add').captionKey).toBe('fp.sub');
    expect(frame(sc, 'pack').rows[0].sign).toBe(1);
  });
  it('special values and exact cancellation', () => {
    const inf = scene('inf', '-', 'inf').sc;
    expect(inf.frames.map((f) => f.id)).toEqual(['unpack', 'negate', 'special', 'pack']);
    expect(frame(inf, 'special').params.rule).toBe('inf-minus-inf');
    const zero = scene('2.5', '-', '2.5').sc;
    expect(zero.frames.at(-1)!.params.hex).toBe('0x00000000');
    expect(zero.frames.some((f) => f.id === 'normalize')).toBe(false);
  });
  it('overflow and underflow frames', () => {
    const big = scene('3.4e38', '+', '3.4e38').sc;
    expect(big.frames.some((f) => f.stage === 'overflow')).toBe(true);
    const tiny = scene('1.1754945e-38', '-', '1.1754944e-38').sc;
    expect(tiny.frames.some((f) => f.stage === 'underflow')).toBe(true);
  });
  it('round carry frame: a tie that rounds up into the next binade', () => {
    const { sc } = scene('1.9999999', '+', '5.9604645e-8');
    expect(frame(sc, 'round').captionKey).toBe('fp.tieUp');
    expect(frame(sc, 'round-carry').stage).toBe('roundCarry');
    expect(sc.result.hex).toBe('0x40000000');
    expect(frame(sc, 'pack').rows[0].exp).toBe(1);
  });
});

describe('carries of the add frame', () => {
  it('6.5 + 3.75 carries into the columns where a 1 + 1 happened, subtraction has none', () => {
    const { sc } = scene('6.5', '+', '3.75');
    const add = frame(sc, 'add');
    const [a, b, sum] = add.rows.map((r) => r.value);
    expect(sum).toBe(a + b);
    expect(add.carries).toBe(sum ^ a ^ b);
    expect(add.carries! > 0n).toBe(true);
    // the carry out of the top column lands in the carry column (2^1)
    expect((add.carries! >> BigInt(sc.fracBits + 1)) & 1n).toBe(1n);
    expect(frame(scene('0.5', '-', '0.4375').sc, 'add').carries).toBeUndefined();
  });
});

describe('frame invariants (random pairs)', () => {
  const pair = fc.oneof(...PAIR_KINDS.map(([, arb]) => arb));
  it('last frame packs the engine result, ids unique, four steps in order, circuit lights up', () => {
    fc.assert(
      fc.property(pair, fc.constantFrom<Op>('+', '-'), ([a, b], op) => {
        const sim = simulate(F, op, String(f32FromBits(a)), String(f32FromBits(b)));
        if (!sim.ok) return true;
        const sc = buildFpFrames(F, sim);
        const last = sc.frames.at(-1)!;
        expect(last.stage).toBe('pack');
        expect(last.params.hex).toBe(toHex(sim.result.bits, 32));
        const ids = sc.frames.map((f) => f.id);
        expect(new Set(ids).size).toBe(ids.length);
        const steps = sc.frames.map((f) => f.bigStep).filter((s) => s > 0);
        expect([...steps].sort((x, y) => x - y)).toEqual(steps);
        for (const f of sc.frames) {
          const st = circuitState(f);
          expect(st.active.length).toBeGreaterThan(0);
          expect(st.active.every((id) => (BLOCK_IDS as readonly string[]).includes(id))).toBe(true);
        }
        const w = chooseWindow(sc);
        if (w.mode === 'compact') {
          const shown = new Set(w.columns);
          for (const f of sc.frames)
            for (const r of f.rows)
              for (let i = 0; i <= sc.fracBits + 1; i++)
                if ((r.value >> BigInt(i)) & 1n) expect(shown.has(i)).toBe(true);
        }
        // the result row remembers how far its bits slid (normalize, then the rounding carry)
        const norm = sc.frames.find((f) => f.stage === 'normalize');
        if (norm?.normalize) {
          const { direction, amount } = norm.normalize;
          const moved = direction === 'right' ? amount : direction === 'left' ? -amount : 0;
          expect(norm.rows[0].shifted).toBe(moved);
          const carry = sc.frames.some((f) => f.stage === 'roundCarry') ? 1 : 0;
          expect(last.rows[0].shifted).toBe(moved + carry);
        }
        return true;
      }),
      { numRuns: 3_000 },
    );
  });
});

describe('round line (golden D.5)', () => {
  const line = (a: string, b: string) => {
    const { sim, sc } = scene(a, '+', b);
    const rd = sim.result.steps.find((s) => s.kind === 'round');
    if (!rd || rd.kind !== 'round') throw new Error();
    return { l: buildRoundLine(F, rd, sim.result.exact!, 0), sc };
  };
  it('0.1 + 0.2: pos 3/4, up', () => {
    const { l } = line('0.1', '0.2');
    expect(toHex(l.downBits, 32)).toBe('0x3E999999');
    expect(toHex(l.upBits, 32)).toBe('0x3E99999A');
    expect(l.exact).toBe('0.300000004470348358154296875');
    expect(l.pos).toEqual(R.rat(3n, 4n));
    expect([l.chosen, l.tie]).toEqual(['up', false]);
  });
  it('16777216 + 1 and + 3: ties', () => {
    const one = line('16777216', '1').l;
    expect([one.down, one.up, one.exact]).toEqual(['16777216', '16777218', '16777217']);
    expect([one.pos, one.chosen, one.tie]).toEqual([R.rat(1n, 2n), 'down', true]);
    const three = line('16777216', '3').l;
    expect([three.down, three.up, three.chosen]).toEqual(['16777218', '16777220', 'up']);
  });
  it('1 + 1e-8: pos 11258999/134217728, down', () => {
    const { l } = line('1', '1e-8');
    expect(l.pos).toEqual(R.rat(11258999n, 134217728n));
    expect(l.chosen).toBe('down');
    expect(l.ulp).toBe('1.1920928955078125e-7');
  });
});

describe('exponent window', () => {
  it('6.5 sits 5/8 of the way through [4, 8)', () => {
    const w = exponentWindow(F, 0x40d00000n)!;
    expect(w).toMatchObject({ e: 2, lo: '4', hi: '8' });
    expect(w.pos).toEqual(R.rat(5n, 8n));
    expect(exponentWindow(F, 0n)).toBeNull();
  });
});
