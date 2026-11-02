import { describe, expect, it } from 'vitest';
import { BINARY32 as F, simulate } from '@/lib/fp';
import { buildRoundingScene } from '@/lib/lesson/rounding-frames';

const scene = (a: string, b: string, op: '+' | '-' = '+') => {
  const sim = simulate(F, op, a, b);
  if (!sim.ok) throw new Error('bad input');
  return buildRoundingScene(F, sim);
};

describe('rounding scene (5.4)', () => {
  it('0.1 + 0.2: G=1 R=1 S=0, rounds up to 0x3E99999A', () => {
    const s = scene('0.1', '0.2')!;
    expect(s.frames.map((f) => f.id)).toEqual(['bits', 'line', 'rule', 'result', 'compare']);
    expect(s.frames[0].params).toEqual({ g: '1', r: '1', s: '0' });
    expect(s.rule).toBe('up');
    expect(s.line.chosen).toBe('up');
    expect(s.fp.result.hex).toBe('0x3E99999A');
    expect(s.upShort).toBe(s.fp.result.value);
    expect(s.frames[4].params.typed).toBe('0.3');
  });
  it('16777216 + 1 is a tie that stays even', () => {
    const s = scene('16777216', '1')!;
    expect(s.rule).toBe('tie');
    expect(s.line.tie).toBe(true);
    expect(s.line.chosen).toBe('down');
    expect(s.fp.result.hex).toBe('0x4B800000');
  });
  it('16777216 + 3 is a tie that rounds up to even', () => {
    const s = scene('16777216', '3')!;
    expect(s.rule).toBe('tie');
    expect(s.line.chosen).toBe('up');
  });
  it('100 + 0.1 rounds down, 1 + 1e-8 rounds down', () => {
    expect(scene('100', '0.1')!.rule).toBe('down');
    expect(scene('1', '1e-8')!.rule).toBe('down');
  });
  it('exact result and special values', () => {
    expect(scene('6.5', '3.75')!.rule).toBe('exact');
    expect(scene('inf', '1')).toBeNull();
    expect(scene('2', '2', '-')).toBeNull();
  });
});

describe('special values on the page', () => {
  it('overflow shows ∞ and a window that fits a phone', async () => {
    const { chooseWindow } = await import('@/lib/lesson/bit-window');
    const { buildFpFrames, displayValue } = await import('@/lib/lesson/fp-frames');
    const sim = simulate(F, '+', '3e38', '3e38');
    if (!sim.ok) throw new Error();
    const sc = buildFpFrames(F, sim);
    expect(sc.result.value).toBe('∞');
    expect(displayValue(F, 0xff800000n)).toBe('−∞');
    expect(displayValue(F, 0x7fc00000n)).toBe('NaN');
    expect(chooseWindow(sc).columns.length).toBeLessThanOrEqual(14);
  });
});
