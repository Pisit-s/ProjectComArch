import { describe, expect, it } from 'vitest';
import { BINARY32, encodeBits, encodeDecimal } from '@/lib/fp';
import { caption } from '@/content/lesson/captions';
import { BITPLAY_EXAMPLES, SPECIAL_EXAMPLES } from '@/content/lesson/examples';
import {
  buildSpecialView,
  doubleCompare,
  specialRange,
  zoneOf,
  zoneRange,
} from '@/lib/lesson/ch3-special';
import { buildEncodeFrames, buildLayoutFrames, powLabel } from '@/lib/lesson/encode-frames';
import { exponentWindow } from '@/lib/lesson/window';

const F = BINARY32;
const enc = (t: string) => {
  const r = encodeDecimal(F, t);
  if (!r.ok) throw new Error(t);
  return buildEncodeFrames(F, r);
};
const graphemes = (s: string) =>
  [...new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(s)].length;

describe('encode scene extras (4.1)', () => {
  it('0.1 is not exact: the warning shows every stored digit', () => {
    const s = enc('0.1');
    expect(s.inexact).toBe(true);
    expect(s.storedExact).toBe('0.100000001490116119384765625');
    expect(s.storedExact).not.toBe('0.1');
    expect(graphemes(caption('enc.inexact', { stored: s.storedExact }))).toBeLessThanOrEqual(70);
  });

  it('6.5: place values, point hop and nibbles', () => {
    const s = enc('6.5');
    expect(s.storedExact).toBe('6.5');
    expect(s.intTerms).toEqual([
      { weight: '4', bit: 1 },
      { weight: '2', bit: 1 },
      { weight: '1', bit: 0 },
    ]);
    expect(s.normalize).toMatchObject({
      digits: '1101',
      from: 3,
      to: 1,
      lead: 0,
      hops: 2,
      e: 2,
      compact: false,
      before: '110.1',
      after: '1.101',
    });
    expect(s.nibbles.map((n) => n.hex).join('')).toBe('40D00000');
    expect(s.nibbles[1]).toEqual({ bits: '0000', hex: '0' });
    expect(s.nibbles[2]).toEqual({ bits: '1101', hex: 'D' });
  });

  it('-0.75 hops right once; 0.1 hops right 4 and drops the leading zeros', () => {
    expect(enc('-0.75').normalize).toMatchObject({ from: 1, to: 2, lead: 1, after: '1.1' });
    const n = enc('0.1').normalize!;
    expect(n).toMatchObject({ from: 1, to: 5, lead: 4, hops: 4, e: -4, more: true });
    expect(n.after).toBe('1.1001100110…');
  });

  it('long integer parts: no place-value chips, compact hop', () => {
    const s = enc('16777216');
    expect(s.intTerms).toEqual([]);
    expect(s.normalize?.hops).toBe(24);
    expect(enc('1e30').normalize?.compact).toBe(true);
    expect(enc('0').normalize).toBeNull();
  });
});

describe('layout scene extras (3.1)', () => {
  it('6.5 plugs s = 0, E = 129, 2^2 = 4, 1.101 = 1.625', () => {
    const l = buildLayoutFrames(F, encodeBits(F, '6.5')!)!;
    expect(l.plug).toEqual({
      s: '0',
      E: '129',
      e: '2',
      pow: '4',
      sigBin: '1.101',
      sigDec: '1.625',
      value: '6.5',
    });
    expect(l.hex).toBe('0x40D00000');
  });
  it('powers of two stay short', () => {
    expect(powLabel(-1)).toBe('0.5');
    expect(powLabel(-10)).toBe('2^-10');
    expect(powLabel(127)).toBe('2^127');
  });
});

describe('exponent window (3.2)', () => {
  it('ticks around [4, 8) for 6.5', () => {
    const w = exponentWindow(F, encodeBits(F, '6.5')!)!;
    expect(w.ticks.map((t) => t.label)).toEqual(['1', '2', '4', '8', '16', '32']);
  });
  it('the live caption stays in budget from the smallest to the largest exponent', () => {
    const bits = [0x00800000n, 0x7f7fffffn, ...BITPLAY_EXAMPLES.map((t) => encodeBits(F, t)!)];
    for (const b of bits) {
      const w = exponentWindow(F, b)!;
      expect(graphemes(caption('bitplay.live', { lo: w.lo, hi: w.hi }))).toBeLessThanOrEqual(70);
    }
  });
});

describe('special zones (3.3)', () => {
  it('each slide example falls in its zone', () => {
    const zones = SPECIAL_EXAMPLES.map((h) => zoneOf(F, BigInt('0x' + h)));
    expect(zones).toEqual([
      'zone0',
      'zone0',
      'zone0',
      'zoneNormal',
      'zoneNormal',
      'zone255',
      'zone255',
      'zone255',
    ]);
    expect(zoneRange(F, 'zoneNormal')).toBe('1–254');
  });
  it('values come from the engine', () => {
    const v = SPECIAL_EXAMPLES.map((h) => buildSpecialView(F, BigInt('0x' + h)).value);
    expect(v).toEqual([
      '0',
      '-0',
      '1.40129846…e-45',
      '1.17549435…e-38',
      '3.40282346…e+38',
      '+∞',
      '−∞',
      'NaN',
    ]);
  });
  it('range and double captions fit the budget', () => {
    const r = specialRange(F);
    expect(r).toEqual({ min: '1.1754944e-38', max: '3.4028235e+38' });
    expect(graphemes(caption('special.range', r))).toBeLessThanOrEqual(70);
    expect(doubleCompare()).toMatchObject({ e64: '11', f64: '52', b64: '1023', b32: '127' });
  });
});
