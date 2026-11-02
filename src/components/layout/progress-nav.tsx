'use client';

import { CHAPTERS } from '@/content/lesson/sections';
import { UI } from '@/content/lesson/copy';
import { cn } from '@/lib/utils';
import { useActiveSection } from './use-active-section';

/** Desktop: seven dots with short names, the chapter on screen is highlighted. */
export function ProgressNav() {
  const active = useActiveSection();
  return (
    <ol className="ml-2 hidden items-center gap-0.5 lg:flex" data-testid="progress-nav">
      {CHAPTERS.map((c) => {
        const on = c.id === active;
        return (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              aria-current={on ? 'location' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium transition-colors',
                on
                  ? 'bg-primary text-primary-content'
                  : 'text-ink/85 hover:bg-ice-100 hover:text-ink',
              )}
            >
              <span className={cn('num font-mono text-xs', on ? 'text-white/85' : 'text-muted')}>
                {c.number}
              </span>
              {c.short}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** Phones: a pill with the current chapter. */
export function ChapterPill() {
  const active = useActiveSection();
  const c = CHAPTERS.find((x) => x.id === active);
  if (!c) return null;
  return (
    <a
      href={`#${c.id}`}
      className="ml-1 truncate rounded-full bg-ice-100 px-3 py-1 text-sm font-medium text-ink lg:hidden"
      data-testid="chapter-pill"
    >
      {UI.chapter} {c.number} · {c.short}
    </a>
  );
}
