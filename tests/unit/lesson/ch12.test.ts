import { describe, expect, it } from 'vitest';
import { BINARY32 as F } from '@/lib/fp';
import { buildIntAddFrames, buildIntSubFrames, buildWheelFrames } from '@/lib/lesson/int-frames';
import { binaryOf, buildCCodeFrames, buildPointScene } from '@/lib/lesson/sci-frames';
import { C_CODE } from '@/content/lesson/examples';

/** Chapter 1-2 adapters against PLAN.md appendix D. */
describe('chapter 1 frames', () => {
  it('7 + 6 in 8 bits: 00001101 = 13, carries into columns 1-4 are 0 1 1 0, rest folded', () => {
    const m = buildIntAddFrames(8, 7, 6);
    expect(m.frames.map((f) => f.id)).toEqual([
      'start',
      'col-0',
      'col-1',
      'col-2',
      'col-3',
      'rest',
      'end',
    ]);
    const end = m.frames.at(-1)!;
    expect(end.params).toEqual({ bits: '00001101', dec: '13' });
    expect(end.carries.slice(1, 5)).toEqual([0, 1, 1, 0]);
  });

  it('7 − 6 in 4 bits: invert 0110 → 1001, result 0001 with a carry out', () => {
    const m = buildIntSubFrames(4, 7, 6);
    expect(m.frames[1].bShown).toBe('1001');
    expect(m.frames.at(-1)).toMatchObject({ result: '0001', carryOut: 1, params: { dec: '1' } });
  });

  it('wheel: 4 + 5 crosses the seam to −7; 3 + (−2) does not', () => {
    const o = buildWheelFrames(4, 5, '+').frames.at(-1)!;
    expect(o).toMatchObject({ captionKey: 'int.wheel.overflow', pin: -7, overflow: true });
    expect(buildWheelFrames(3, -2, '+').frames.at(-1)).toMatchObject({ pin: 1, overflow: false });
  });
});

describe('chapter 2 frames', () => {
  it('C code prints 13 10.250000; the teaser prints 0.300000012', () => {
    const { int, float, teaser } = C_CODE;
    const main = buildCCodeFrames(F, 'main', int.a, int.b, float.a, float.b, float.decimals);
    expect(main.map((f) => [f.unit, f.value])).toEqual([
      ['alu', '13'],
      ['fpu', '10.250000'],
      [null, null],
    ]);
    expect(main.at(-1)!.output).toBe('13 10.250000');
    const t = buildCCodeFrames(F, 'teaser', int.a, int.b, teaser.a, teaser.b, teaser.decimals);
    expect(t.at(-1)).toMatchObject({ captionKey: 'c.teaser', output: '0.300000012' });
  });

  it('point positions follow the hops', () => {
    const a = buildPointScene('0.002', 4);
    expect(a.digits).toBe('0002');
    expect(a.lead).toBe(3);
    expect(a.frames.map((f) => f.pointAt)).toEqual([1, 2, 3, 4, 4]);
    expect(a.frames.at(-1)!.state).toEqual({ text: '2', exp: 1 });
    const b = buildPointScene('987.02', 9);
    expect(b.frames.map((f) => f.pointAt)).toEqual([3, 2, 1, 1]);
    expect(b.frames.at(-1)!.state).toEqual({ text: '9.8702', exp: 11 });
    expect(buildPointScene('2.34', 56).frames).toHaveLength(1);
  });

  it('6.5 in base 2 comes from the engine: 110.1 → 1.101 × 2²', () => {
    const s = binaryOf(F, '6.5');
    expect(s).toEqual({ text: '110.1', exp: 0 });
    const m = buildPointScene(s.text, s.exp, 2);
    expect(m.frames.at(-1)).toMatchObject({
      captionKey: 'point.binary',
      state: { text: '1.101', exp: 2 },
    });
  });
});
