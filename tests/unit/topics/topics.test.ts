import { describe, expect, it } from 'vitest';
import {
  TOPICS,
  TOPICS_IN_ORDER,
  firstReadyLesson,
  isReady,
  topicById,
  topicOfPath,
} from '@/content/topics';

describe('topic registry', () => {
  it('has unique ids', () => {
    const ids = TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('href is "/" + id', () => {
    for (const t of TOPICS) expect(t.href).toBe(`/${t.id}`);
  });

  it('order is 1..4 without repeats', () => {
    expect(TOPICS.map((t) => t.order).sort()).toEqual([1, 2, 3, 4]);
    expect(TOPICS_IN_ORDER.map((t) => t.order)).toEqual([1, 2, 3, 4]);
  });

  it('every topic covers at least 3 things', () => {
    for (const t of TOPICS) expect(t.covers.length).toBeGreaterThanOrEqual(3);
  });

  it('lessons come before the simulator', () => {
    const kinds = TOPICS_IN_ORDER.map((t) => t.kind);
    expect(kinds.lastIndexOf('lesson')).toBeLessThan(kinds.indexOf('simulator'));
  });

  it('lookups agree with the data', () => {
    for (const t of TOPICS) {
      expect(topicById(t.id)).toBe(t);
      expect(isReady(t.id)).toBe(t.status === 'ready');
      expect(topicOfPath(t.href)).toBe(t);
      expect(topicOfPath(`${t.href}/x`)).toBe(t);
    }
    expect(topicOfPath('/')).toBeUndefined();
    expect(topicOfPath('/mipsx')).toBeUndefined();
    expect(() => topicById('nope' as never)).toThrow();
  });

  it('first ready lesson is a ready lesson', () => {
    const t = firstReadyLesson();
    expect(t?.kind).toBe('lesson');
    expect(t?.status).toBe('ready');
  });
});
