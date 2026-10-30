'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CHAPTERS, LAB } from '@/content/chapters';
import { cn } from '@/lib/utils';

/** Desktop chapter links; the current chapter is highlighted. */
export function NavLinks() {
  const pathname = usePathname();
  const items = [
    ...CHAPTERS.map((c) => ({ href: c.href, label: c.short, num: String(c.number) })),
    { href: LAB.href, label: LAB.short, num: null },
  ];
  return (
    <ul className="ml-2 hidden items-center gap-0.5 lg:flex">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-content'
                  : 'text-ink/75 hover:bg-ice-100 hover:text-ink',
              )}
            >
              {it.num && (
                <span
                  className={cn('num font-mono text-xs', active ? 'text-white/80' : 'text-muted')}
                >
                  {it.num}
                </span>
              )}
              {it.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
