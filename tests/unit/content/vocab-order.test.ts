import { describe, expect, it } from 'vitest';
import { CH1 } from '@/content/lesson/captions/ch1';
import { CH2 } from '@/content/lesson/captions/ch2';
import { CH3 } from '@/content/lesson/captions/ch3';
import { CH4 } from '@/content/lesson/captions/ch4';
import { CH5 } from '@/content/lesson/captions/ch5';
import { CH6 } from '@/content/lesson/captions/ch6';
import type { CaptionTable } from '@/content/lesson/captions/types';
import { OTHER, TAKEAWAY } from '@/content/lesson/copy';
import { QUIZ } from '@/content/lesson/quiz';
import { CHAPTERS, LESSONS } from '@/content/lesson/sections';
import { VOCAB } from '@/content/lesson/vocab';

/** A term is introduced in the vocabulary strip of the chapter that first uses it (PLAN.md 1.1). */
const TABLES: Record<string, CaptionTable[]> = {
  binary: [CH1],
  'float-in-c': [CH2],
  ieee754: [CH3, CH4],
  'fp-add': [CH5],
  circuit: [CH6],
};
// params are filled with a neutral value; we only look for the words of the captions
const params = new Proxy({}, { get: () => '·' }) as Record<string, string>;

function chapterText(n: number): string {
  const c = CHAPTERS.find((x) => x.number === n)!;
  const q = QUIZ[c.id];
  return [
    c.hook,
    TAKEAWAY[c.id] ?? '',
    ...(OTHER[c.id] ?? []),
    q ? [q.question, ...q.options, q.reason].join(' ') : '',
    ...(TABLES[c.id] ?? []).flatMap((t) => Object.values(t).map((fn) => fn!(params))),
  ].join('\n');
}

describe('vocabulary comes before use', () => {
  it('no chapter uses a term that a later chapter introduces', () => {
    const late: string[] = [];
    for (const c of LESSONS) {
      for (const id of c.vocab) {
        const word = VOCAB[id].term.replace(/\s*\(.*\)$/, '');
        const re = new RegExp(
          `(^|[^A-Za-z])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z]|$)`,
          'i',
        );
        for (let n = 1; n < c.number; n++)
          if (re.test(chapterText(n)))
            late.push(`${word}: used in chapter ${n}, introduced in ${c.number}`);
      }
    }
    expect(late).toEqual([]);
  });
});
