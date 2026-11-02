'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TopicIcon } from '@/components/topic/topic-icon';
import { TOPICS_IN_ORDER, topicOfPath } from '@/content/topics';
import { cn } from '@/lib/utils';

/**
 * Desktop topic links from the registry (PLAN.md 2.5). A topic is active on its own page and
 * every page under it; topics that are not ready yet carry a small grey dot.
 */
export function NavLinks() {
  const current = topicOfPath(usePathname());
  return (
    <ul className="ml-2 hidden items-center gap-0.5 lg:flex">
      {TOPICS_IN_ORDER.map((t) => {
        const active = current?.id === t.id;
        const soon = t.status !== 'ready';
        return (
          <li key={t.id}>
            <Link
              href={t.href}
              aria-current={active ? 'page' : undefined}
              title={soon ? 'กำลังพัฒนา' : undefined}
              data-testid={`nav-topic-${t.id}`}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-content'
                  : 'text-ink/75 hover:bg-ice-100 hover:text-ink',
              )}
            >
              <TopicIcon
                name={t.icon}
                className={cn('h-4 w-4', active ? 'text-white' : 'text-primary')}
              />
              {t.short}
              {soon && (
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    active ? 'bg-white/70' : 'bg-slate-400',
                  )}
                  aria-label="(กำลังพัฒนา)"
                  role="img"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
