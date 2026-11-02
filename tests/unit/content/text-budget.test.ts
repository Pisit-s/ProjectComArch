import { describe, expect, it } from 'vitest';
import { LIMITS, allBudgets, detailLengths, graphemes } from '@/content/lesson/budget';
import { CAPTIONS, caption } from '@/content/lesson/captions';
import { buildRoundingScene } from '@/lib/lesson/rounding-frames';
import { OTHER, TAKEAWAY } from '@/content/lesson/copy';
import {
  BITPLAY_EXAMPLES,
  CIRCUIT_EXAMPLES,
  C_CODE,
  DEC4,
  DECODE_EXAMPLES,
  ENCODE_EXAMPLES,
  FP_EXAMPLES,
  INT_ADD_EXAMPLES,
  INT_SUB_EXAMPLES,
  LAYOUT_EXAMPLES,
  POINT_EXAMPLES,
  ROUND_EXAMPLES,
  SHIFT_EXAMPLES,
  SUB_EXAMPLES,
  WHEEL_EXAMPLES,
} from '@/content/lesson/examples';
import { CHAPTERS, LESSONS } from '@/content/lesson/sections';
import { VOCAB } from '@/content/lesson/vocab';
import { BINARY32, encodeBits, encodeDecimal, simulate, shortestDecimal } from '@/lib/fp';
import { shiftRight } from '@/lib/int/adder';
import { hwCaption } from '@/lib/lesson/circuit-map';
import {
  buildDecodeFrames,
  buildEncodeFrames,
  buildLayoutFrames,
} from '@/lib/lesson/encode-frames';
import { buildFpFrames } from '@/lib/lesson/fp-frames';
import { buildFunFact } from '@/lib/lesson/fun-fact';
import { buildIntAddFrames, buildIntSubFrames, buildWheelFrames } from '@/lib/lesson/int-frames';
import type { CaptionKey, Params } from '@/lib/lesson/keys';
import { buildDec4Frames, buildPointFrames } from '@/lib/lesson/sci-frames';
import { exponentWindow } from '@/lib/lesson/window';

const F = BINARY32;

/** Every caption the page can show for the example chips, rendered with real values. */
function renderedCaptions(): { key: CaptionKey; text: string }[] {
  const out: { key: CaptionKey; text: string }[] = [];
  const add = (key: CaptionKey, params: Params = {}) =>
    out.push({ key, text: caption(key, params) });
  for (const ex of [...FP_EXAMPLES, ...SUB_EXAMPLES, ...ROUND_EXAMPLES, ...CIRCUIT_EXAMPLES]) {
    const s = simulate(F, ex.op, ex.a, ex.b);
    if (!s.ok) throw new Error();
    const sc = buildFpFrames(F, s);
    for (const f of sc.frames) {
      add(f.captionKey, f.params);
      const hw = hwCaption(f);
      add(hw.key, hw.params);
    }
    buildRoundingScene(F, s)?.frames.forEach((f) => add(f.captionKey, f.params));
  }
  for (const h of LAYOUT_EXAMPLES)
    buildLayoutFrames(F, BigInt('0x' + h))?.frames.forEach((f) => add(f.captionKey, f.params));
  for (const t of [...ENCODE_EXAMPLES, ...BITPLAY_EXAMPLES]) {
    const r = encodeDecimal(F, t);
    if (!r.ok) throw new Error();
    const sc = buildEncodeFrames(F, r);
    for (const f of sc.frames) add(f.captionKey, f.params);
    add('enc.inexact', { stored: sc.stored });
    const l = buildLayoutFrames(F, r.bits);
    l?.frames.forEach((f) => add(f.captionKey, f.params));
    const w = exponentWindow(F, r.bits);
    if (w) add('bitplay.live', { lo: w.lo, hi: w.hi });
  }
  for (const h of DECODE_EXAMPLES)
    buildDecodeFrames(F, BigInt('0x' + h)).frames.forEach((f) => add(f.captionKey, f.params));
  for (const e of INT_ADD_EXAMPLES)
    buildIntAddFrames(e.width, e.a, e.b).frames.forEach((f) => add(f.captionKey, f.params));
  for (const e of INT_SUB_EXAMPLES)
    buildIntSubFrames(e.width, e.a, e.b).frames.forEach((f) => add(f.captionKey, f.params));
  for (const [a, b] of WHEEL_EXAMPLES)
    buildWheelFrames(a, b, '+').frames.forEach((f) => add(f.captionKey, f.params));
  for (const v of SHIFT_EXAMPLES)
    for (let s = 0; s <= 4; s++)
      add('int.shift.live', { s: String(s), dec: String(shiftRight(8, v, s).value) });
  for (const p of POINT_EXAMPLES)
    buildPointFrames(p.text, p.exp).forEach((f) => add(f.captionKey, f.params));
  buildPointFrames('110.1', 0, 2).forEach((f) => add(f.captionKey, f.params));
  buildDec4Frames(DEC4.a, DEC4.b, DEC4.p).frames.forEach((f) => add(f.captionKey, f.params));
  const ff = buildFunFact();
  add('slide.funfact1', { r: ff.yMinusX, ulp: ff.ulp });
  add('slide.funfact2', { r1: ff.leftFirst, r2: ff.rightFirst });
  add('special.range', {
    min: shortestDecimal(F, 1n),
    max: shortestDecimal(F, encodeBits(F, '3.4028235e38')!),
  });
  add('double.compare', { e64: '11', f64: '52', b64: '1023' });
  for (const k of [
    'c.int',
    'c.float',
    'c.print',
    'c.teaser',
    'int.wheel.rule',
    'special.zone0',
    'special.zoneNormal',
    'special.zone255',
    'round.line',
    'round.rule',
  ] as CaptionKey[])
    add(k);
  void C_CODE;
  return out;
}

describe('text budget (PLAN.md 1.3)', () => {
  const budgets = allBudgets();
  it('per chapter limits', () => {
    for (const b of budgets) {
      expect(b.title, b.id).toBeLessThanOrEqual(LIMITS.title);
      expect(b.hook, b.id).toBeLessThanOrEqual(LIMITS.hook);
      expect(b.vocabMax, b.id).toBeLessThanOrEqual(LIMITS.vocab);
      expect(b.takeaway, b.id).toBeLessThanOrEqual(LIMITS.takeaway);
      expect(b.total, b.id).toBeLessThanOrEqual(LIMITS.total);
    }
  });
  it('hooks are one line, takeaways one line, other text at most 2 blocks', () => {
    for (const c of CHAPTERS) {
      expect(c.hook).not.toMatch(/\n/);
      expect(TAKEAWAY[c.id] ?? '').not.toMatch(/\n/);
      const other = OTHER[c.id] ?? [];
      expect(other.length).toBeLessThanOrEqual(LIMITS.otherBlocks);
      for (const t of other) expect(graphemes(t)).toBeLessThanOrEqual(LIMITS.other);
    }
  });
  it('chapters 1-6 have 3-6 terms and every term exists', () => {
    for (const c of LESSONS) {
      expect(c.vocab.length, c.id).toBeGreaterThanOrEqual(3);
      expect(c.vocab.length, c.id).toBeLessThanOrEqual(6);
      for (const v of c.vocab) expect(VOCAB[v]).toBeDefined();
    }
    for (const v of Object.values(VOCAB))
      expect(graphemes(v.meaning)).toBeLessThanOrEqual(LIMITS.vocab);
  });
  it('"why?" texts', () => {
    for (const n of detailLengths()) expect(n).toBeLessThanOrEqual(LIMITS.detail);
  });
  it('every caption rendered for every example chip fits in 70 graphemes', () => {
    const too = renderedCaptions().filter((c) => graphemes(c.text) > LIMITS.caption);
    expect(too).toEqual([]);
  });
  it('every caption key the adapters can emit has a caption', async () => {
    const { CAPTION_KEYS } = await import('@/lib/lesson/keys');
    for (const k of CAPTION_KEYS) expect(CAPTIONS[k], k).toBeTypeOf('function');
  });
});
