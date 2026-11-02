import { describe, expect, it } from 'vitest';
import { QUIZ } from '@/content/lesson/quiz';
import { CHAPTERS, LESSONS, SECTIONS, sectionById } from '@/content/lesson/sections';
import { BINARY32, encodeBits, simulate, toHex } from '@/lib/fp';
import { buildFpFrames } from '@/lib/lesson/fp-frames';
import { addBits, toBits, toSigned } from '@/lib/int/adder';

describe('section registry', () => {
  it('ids unique, chapters numbered 1..6 in order, summary last', () => {
    const ids = SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CHAPTERS.map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(SECTIONS.at(-1)!.id).toBe('summary');
    const sceneIds = SECTIONS.flatMap((s) => s.scenes.map((x) => x.id));
    expect(new Set([...ids, ...sceneIds]).size).toBe(ids.length + sceneIds.length);
    expect(sectionById('fp-add').scenes.map((s) => s.id)).toContain('rounding');
    expect(() => sectionById('nope' as never)).toThrow();
  });
  it('every chapter 1-6 has a quiz with 3 options and a valid order', () => {
    for (const c of LESSONS) {
      const q = QUIZ[c.id]!;
      expect(q.options).toHaveLength(3);
      expect([...q.order].sort()).toEqual([0, 1, 2]);
    }
  });
  it('chapter 5 quiz: G = 1, R = S = 0 with LSB = 1 rounds up (tie to even)', () => {
    // 16777216 + 3 is exactly that case; the first option is the answer
    const sim = simulate(BINARY32, '+', '16777216', '3');
    if (!sim.ok) throw new Error();
    const round = buildFpFrames(BINARY32, sim).frames.find((f) => f.stage === 'round')!;
    expect(round.grs).toEqual({ g: 1, r: 0, s: 0, lsb: 1 });
    expect(round.decision).toBe('tie-even-up');
    expect(QUIZ['fp-add']!.question).toContain('G = 1, R = 0, S = 0 และ LSB = 1');
    expect(QUIZ['fp-add']!.options[0]).toContain('ปัดขึ้น');
  });

  it('quiz answers agree with the models', () => {
    const r = addBits(4, 4, 5);
    expect(QUIZ.binary!.options[0]).toBe(
      `${toBits(4, r.result)} = ${toSigned(4, r.result)} เกิด overflow`,
    );
    expect(QUIZ.ieee754!.options[0]).toBe(toHex(encodeBits(BINARY32, '-0.75')!, 32));
    expect(QUIZ.ieee754!.options[0]).toBe('0xBF400000');
  });
});
