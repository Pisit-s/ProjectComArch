'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { CHAPTERS, LAB } from '@/content/chapters';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

/** Every page of the Floating-Point topic, in reading order (PLAN.md 2.5). */
export const FP_PAGES = [
  { href: '/floating-point' as const, label: 'ภาพรวม', num: null, crumb: null },
  ...CHAPTERS.map((c) => ({
    href: c.href,
    label: c.short,
    num: String(c.number),
    crumb: `บทที่ ${c.number}`,
  })),
  { href: LAB.href, label: LAB.short, num: null, crumb: LAB.title },
] as const;

/**
 * Breadcrumb + a row of chapter pills that scrolls sideways on phones. Lives in
 * `src/app/floating-point/layout.tsx`, so only Floating-Point pages show it.
 */
export function FpSubnav() {
  const pathname = usePathname();
  const current = FP_PAGES.find((p) => p.href === pathname);
  const rowRef = useRef<HTMLUListElement>(null);

  // keep the active pill in view on narrow screens
  // scroll only the row sideways: scrollIntoView would also move the page (WebKit jumps to the
  // top), which breaks links to #anchors such as /floating-point/mul-div#simulator
  useEffect(() => {
    const row = rowRef.current;
    const el = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !el) return;
    row.scrollLeft = el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2;
  }, [pathname]);

  return (
    <div className="no-print mx-auto max-w-6xl px-4 pt-4" data-testid="fp-subnav">
      <nav aria-label="ตำแหน่งปัจจุบัน">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <li>
            <Link href="/" className="link link-hover">
              {site.name}
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            {current?.crumb ? (
              <Link href="/floating-point" className="link link-hover">
                Floating-Point
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                Floating-Point
              </span>
            )}
          </li>
          {current?.crumb && (
            <>
              <li aria-hidden>
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="font-medium text-ink">
                {current.crumb}
              </li>
            </>
          )}
        </ol>
      </nav>
      <nav aria-label="บทของ Floating-Point" className="mt-2">
        <ul
          ref={rowRef}
          className="relative -mx-4 flex snap-x [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden"
        >
          {FP_PAGES.map((p) => {
            const active = p.href === pathname;
            return (
              <li key={p.href} className="shrink-0 snap-start">
                <Link
                  href={p.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap ring-1 transition-colors',
                    active
                      ? 'bg-primary text-primary-content ring-primary'
                      : 'glass bg-card text-ink/80 ring-foreground/10 hover:bg-ice-100 hover:text-ink',
                  )}
                >
                  {p.num && (
                    <span
                      className={cn(
                        'num font-mono text-xs',
                        active ? 'text-white/80' : 'text-muted',
                      )}
                    >
                      {p.num}
                    </span>
                  )}
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
