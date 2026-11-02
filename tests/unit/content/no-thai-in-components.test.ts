import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { graphemes } from '@/content/lesson/budget';

/** Text users read lives in src/content/lesson; components keep only short labels (PLAN.md 1.3). */
const ROOTS = ['src/components', 'src/app'];
const MAX = 20;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(ts|tsx)$/.test(name) ? [p] : [];
  });
}

/** Thai runs between quotes, braces and tags, comments removed. */
function thaiRuns(source: string): string[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  return (code.match(/[^'"`{}<>\n]*[฀-๿][^'"`{}<>\n]*/g) ?? []).map((s) => s.trim());
}

describe('no long Thai text in components', () => {
  it(`every Thai string in ${ROOTS.join(', ')} is at most ${MAX} graphemes`, () => {
    const long = ROOTS.flatMap(files).flatMap((f) =>
      thaiRuns(readFileSync(f, 'utf8'))
        .filter((s) => graphemes(s) > MAX)
        .map((s) => `${f}: ${s}`),
    );
    expect(long).toEqual([]);
  });
});
