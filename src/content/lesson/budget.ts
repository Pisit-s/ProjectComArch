import { DETAILS } from './captions';
import { OTHER, TAKEAWAY } from './copy';
import { QUIZ } from './quiz';
import { CHAPTERS, type SectionDef } from './sections';
import { VOCAB } from './vocab';

/** Text budget of PLAN.md 1.3, counted in graphemes (Thai vowels and tone marks stack). */
export const LIMITS = {
  title: 30,
  hook: 90,
  vocab: 80,
  caption: 70,
  detail: 160,
  takeaway: 100,
  other: 120,
  otherBlocks: 2,
  total: 600,
} as const;

const seg = new Intl.Segmenter('th', { granularity: 'grapheme' });
export const graphemes = (s: string): number => [...seg.segment(s)].length;

export interface ChapterBudget {
  id: string;
  number: number;
  title: number;
  hook: number;
  vocab: number;
  vocabMax: number;
  takeaway: number;
  other: number;
  quiz: number;
  total: number;
}

export function chapterBudget(s: SectionDef): ChapterBudget {
  const vocab = s.vocab.map((v) => graphemes(VOCAB[v].meaning));
  const takeaway = graphemes(TAKEAWAY[s.id] ?? '');
  const other = (OTHER[s.id] ?? []).reduce((n, t) => n + graphemes(t), 0);
  const q = QUIZ[s.id];
  const quiz = q
    ? graphemes(q.question) + q.options.reduce((n, o) => n + graphemes(o), 0) + graphemes(q.reason)
    : 0;
  const hook = graphemes(s.hook);
  const vocabSum = vocab.reduce((n, x) => n + x, 0);
  return {
    id: s.id,
    number: s.number,
    title: graphemes(s.title),
    hook,
    vocab: vocabSum,
    vocabMax: Math.max(0, ...vocab),
    takeaway,
    other,
    quiz,
    total: hook + vocabSum + takeaway + other + quiz,
  };
}

export const allBudgets = (): ChapterBudget[] => CHAPTERS.map(chapterBudget);
export const detailLengths = (): number[] => Object.values(DETAILS).map(graphemes);
