import { describe, expect, it } from 'vitest';
import { BINARY32, encodeDecimal, encodeBits } from '@/lib/fp';
import {
  buildDecodeFrames,
  buildEncodeFrames,
  buildLayoutFrames,
} from '@/lib/lesson/encode-frames';
import { buildFunFact } from '@/lib/lesson/fun-fact';
import { buildIntAddFrames, buildIntSubFrames, buildWheelFrames } from '@/lib/lesson/int-frames';
import { buildDec4Frames, buildPointFrames, runCCode } from '@/lib/lesson/sci-frames';

const F = BINARY32;
const enc = (t: string) => {
  const r = encodeDecimal(F, t);
  if (!r.ok) throw new Error(t);
  return buildEncodeFrames(F, r);
};

describe('chapter 1 frames', () => {
  it('7 + 6 in 8 bits: four columns, then the rest folds into one frame', () => {
    const s = buildIntAddFrames(8, 7, 6);
    expect(s.frames.map((f) => f.id)).toEqual([
      'start',
      'col-0',
      'col-1',
      'col-2',
      'col-3',
      'rest',
      'end',
    ]);
    expect(s.frames.at(-1)).toMatchObject({
      captionKey: 'int.add.end',
      params: { bits: '00001101', dec: '13' },
    });
    expect(s.frames[2].params).toMatchObject({
      i: '1',
      a: '1',
      b: '1',
      cin: '0',
      sum: '0',
      cout: '1',
    });
    expect(s.frames.at(-1)!.sums.join('')).toBe('10110000');
    expect([s.aBits, s.bBits]).toEqual(['00000111', '00000110']);
  });
  it('carry out of the leftmost column', () => {
    const s = buildIntAddFrames(4, 9, 8);
    expect(s.frames.at(-1)!.captionKey).toBe('int.add.carryOut');
    expect(s.frames.at(-1)!.carries[4]).toBe(1);
  });
  it('7 - 6 on the ALU', () => {
    const s = buildIntSubFrames(4, 7, 6);
    expect(s.frames.map((f) => f.bShown)).toEqual(['0110', '1001', '1001', '1001', '1001']);
    expect(s.frames.at(-1)).toMatchObject({
      result: '0001',
      carryOut: 1,
      params: { bits: '0001', dec: '1' },
    });
    expect(s.frames[0].params).toEqual({ a: '7', b: '6' });
  });
  it('wheel: 4 + 5 overflows, 3 + 2 does not, minus walks counter-clockwise', () => {
    const o = buildWheelFrames(4, 5, '+');
    expect(o.frames.at(-1)).toMatchObject({
      captionKey: 'int.wheel.overflow',
      pin: -7,
      overflow: true,
      params: { truth: '9' },
    });
    expect(o.slots[8]).toEqual({ value: -8, bits: '1000' });
    expect(buildWheelFrames(3, 2, '+').frames.at(-1)).toMatchObject({
      captionKey: 'int.wheel.ok',
      pin: 5,
    });
    expect(buildWheelFrames(7, 6, '-').frames[2].params).toEqual({ steps: '6', dir: 'ccw' });
  });
});

describe('chapter 2 / 5.1 frames', () => {
  it('point hops', () => {
    expect(buildPointFrames('0.002', 4).map((f) => f.captionKey)).toEqual([
      'point.not',
      'point.hopRight',
      'point.hopRight',
      'point.hopRight',
      'point.done',
    ]);
    expect(buildPointFrames('2.34', 56).map((f) => f.captionKey)).toEqual(['point.already']);
    expect(buildPointFrames('110.1', 0, 2).at(-1)).toMatchObject({
      captionKey: 'point.binary',
      state: { text: '1.101', exp: 2 },
    });
  });
  it('C code output (golden D.4)', () => {
    expect(runCCode(F, 7, 6, '6.5', '3.75').output).toBe('13 10.250000');
    expect(runCCode(F, 7, 6, '0.1', '0.2', 9).floatResult).toBe('0.300000012');
    expect(() => runCCode(F, 1, 1, 'x', '1')).toThrow();
  });
  it('4-digit addition frames', () => {
    const s = buildDec4Frames({ text: '9.999', exp: 1 }, { text: '1.610', exp: -1 });
    expect(s.frames.map((f) => f.bigStep)).toEqual([0, 1, 1, 2, 3, 4]);
    expect(s.frames.at(-1)!.params).toEqual({ rounded: '1.002', e: '2' });
  });
});

describe('chapter 3-4 frames', () => {
  it('encode 6.5', () => {
    const s = enc('6.5');
    expect(s.hex).toBe('0x40D00000');
    expect(s.intBin).toBe('110');
    expect(s.frames.map((f) => f.stage)).toEqual([
      'split',
      'int',
      'times2',
      'join',
      'normalize',
      'sign',
      'exp',
      'sig',
      'hidden',
      'hex',
    ]);
    expect(s.frames.find((f) => f.stage === 'exp')!.params).toEqual({
      e: '2',
      E: '129',
      Ebits: '10000001',
    });
    expect(s.frames.find((f) => f.stage === 'join')!.params.bin).toBe('110.1');
    expect(s.inexact).toBe(false);
  });
  it('encode -0.75 (P&H) and 0.1 (loops and rounds)', () => {
    expect(enc('-0.75').hex).toBe('0xBF400000');
    const t = enc('0.1');
    expect(t.inexact).toBe(true);
    expect(t.frames.filter((f) => f.stage === 'times2')).toHaveLength(8);
    expect(t.frames.find((f) => f.stage === 'loop')!.params).toMatchObject({
      f: '0.2',
      start: '2',
      length: '4',
    });
    expect(t.frames.find((f) => f.stage === 'round')!.params).toMatchObject({
      decision: 'up',
      stored: '0.1',
    });
    expect(t.frames.find((f) => f.stage === 'join')!.params.bin.endsWith('…')).toBe(true);
  });
  it('special inputs', () => {
    expect(enc('inf').frames.map((f) => f.stage)).toEqual(['special', 'hex']);
    expect(enc('-0').hex).toBe('0x80000000');
  });
  it('decode 0xC0A00000 = -5 (P&H)', () => {
    const d = buildDecodeFrames(F, 0xc0a00000n);
    expect(d.value).toBe('-5');
    expect(d.frames.map((f) => f.id)).toEqual(['fields', 'exp', 'sig', 'value']);
    expect(d.frames[1].params).toEqual({ E: '129', e: '2' });
    expect(d.frames[2].params.sig).toBe('1.01');
    expect(buildDecodeFrames(F, 0x7f800000n).frames.map((f) => f.id)).toEqual(['fields', 'value']);
  });
  it('layout of 6.5', () => {
    const l = buildLayoutFrames(F, encodeBits(F, '6.5')!)!;
    expect(l.fields).toEqual({ sign: '0', exp: '10000001', sig: '10100000000000000000000' });
    expect(l.frames.find((f) => f.id === 'plug-exp')!.params).toEqual({ E: '129', e: '2' });
    expect(l.frames.find((f) => f.id === 'value')!.params).toEqual({
      sigDec: '1.625',
      e: '2',
      value: '6.5',
    });
    expect(l.frames.find((f) => f.id === 'plug-sign')!.params.sign).toBe('pos');
    expect(buildLayoutFrames(F, 0n)).toBeNull();
  });
});

describe('fun fact (golden D.6, double)', () => {
  it('1e17 + 20', () => {
    const f = buildFunFact();
    expect([f.yMinusX, f.leftFirst, f.rightFirst, f.ulp]).toEqual(['16', '20', '16', '16']);
    expect(f.ticks).toEqual(['100000000000000000', '100000000000000016', '100000000000000032']);
    expect(f.offsets).toEqual(['0', '16', '32']);
  });
});

describe('caption key registry', () => {
  it('keys are unique', async () => {
    const { CAPTION_KEYS, DETAIL_KEYS } = await import('@/lib/lesson/keys');
    expect(new Set(CAPTION_KEYS).size).toBe(CAPTION_KEYS.length);
    expect(new Set(DETAIL_KEYS).size).toBe(DETAIL_KEYS.length);
  });
});
