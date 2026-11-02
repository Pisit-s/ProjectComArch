import { describe, expect, it } from 'vitest';
import { QUIZ } from '@/content/lesson/quiz';
import { CHAPTERS, SECTIONS, sectionById } from '@/content/lesson/sections';
import { BINARY32, encodeBits, toHex } from '@/lib/fp';
import { addBits, toBits, toSigned } from '@/lib/int/adder';

describe('section registry', () => {
  it('ids unique, chapters numbered 1..7 in order, summary last', () => {
    const ids = SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CHAPTERS.map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(SECTIONS.at(-1)!.id).toBe('summary');
    const sceneIds = SECTIONS.flatMap((s) => s.scenes.map((x) => x.id));
    expect(new Set([...ids, ...sceneIds]).size).toBe(ids.length + sceneIds.length);
    expect(sectionById('fp-add').scenes.map((s) => s.id)).toContain('rounding');
    expect(() => sectionById('nope' as never)).toThrow();
  });
  it('every chapter 1-6 has a quiz with 3 options and a valid order', () => {
    for (const c of CHAPTERS.filter((x) => x.number <= 6)) {
      const q = QUIZ[c.id]!;
      expect(q.options).toHaveLength(3);
      expect([...q.order].sort()).toEqual([0, 1, 2]);
    }
  });
  it('quiz answers agree with the models', () => {
    const r = addBits(4, 4, 5);
    expect(QUIZ.binary!.options[0]).toBe(
      `${toBits(4, r.result)} = ${toSigned(4, r.result)} เกิด overflow`,
    );
    expect(QUIZ.convert!.options[0]).toBe(toHex(encodeBits(BINARY32, '-0.75')!, 32));
    expect(QUIZ.convert!.options[0]).toBe('0xBF400000');
    expect(QUIZ.ieee754!.options[0]).toBe('2^3');
  });
});
