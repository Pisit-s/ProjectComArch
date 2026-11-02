'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/topic/status-badge';
import { TopicIcon } from '@/components/topic/topic-icon';
import { CHAPTERS, LAB } from '@/content/chapters';
import { TOPICS_IN_ORDER, topicOfPath } from '@/content/topics';
import { cn } from '@/lib/utils';
import { ChapterIcon } from './chapter-icon';

/**
 * Phone/tablet menu: daisyUI drawer from the right with every topic from the registry. Inside the
 * Floating-Point topic its chapters and the Lab are listed under it (PLAN.md 2.5).
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = topicOfPath(pathname);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const fpPages = [
    ...CHAPTERS.map((c) => ({ href: c.href, num: String(c.number), name: c.short, icon: c.icon })),
    { href: LAB.href, num: null, name: LAB.title, icon: LAB.icon },
  ];

  return (
    <div className="drawer drawer-end w-auto lg:hidden">
      <input
        id="mobile-nav"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
        tabIndex={-1}
        aria-hidden
      />
      <div className="drawer-content">
        <button
          type="button"
          className="btn btn-circle h-11 w-11 btn-ghost"
          aria-label="เมนูหัวข้อ"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div className="drawer-side z-50">
        <button
          type="button"
          tabIndex={-1}
          aria-label="ปิดเมนู"
          className="drawer-overlay"
          onClick={() => setOpen(false)}
        />
        <nav
          id="mobile-nav-panel"
          aria-label="หัวข้อทั้งหมด"
          className="flex min-h-dvh w-[min(22rem,86vw)] flex-col gap-2 overflow-y-auto bg-white p-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-lg font-semibold">หัวข้อ</span>
            <button
              type="button"
              className="btn btn-circle h-11 w-11 btn-ghost"
              aria-label="ปิดเมนู"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {TOPICS_IN_ORDER.map((t) => {
              const inTopic = current?.id === t.id;
              const onPage = pathname === t.href;
              return (
                <li key={t.id}>
                  <Link
                    href={t.href}
                    onClick={() => setOpen(false)}
                    aria-current={onPage ? 'page' : undefined}
                    data-testid={`drawer-topic-${t.id}`}
                    className={cn(
                      'flex gap-3 rounded-xl p-3 ring-1 transition-colors',
                      inTopic ? 'bg-primary/10 ring-primary/40' : 'ring-line/70 hover:bg-ice-100',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-lg',
                        inTopic
                          ? 'bg-white text-primary ring-1 ring-primary/30'
                          : 'bg-ice-100 text-primary',
                      )}
                    >
                      <TopicIcon name={t.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-xs font-medium text-muted">
                          {t.kind === 'simulator' ? 'Simulator' : `หัวข้อที่ ${t.order}`}
                        </span>
                        <StatusBadge status={t.status} />
                      </span>
                      <span className="mt-0.5 block leading-snug font-semibold">{t.title}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-muted">
                        {t.blurb}
                      </span>
                    </span>
                  </Link>
                  {inTopic && t.id === 'floating-point' && (
                    <ul
                      className="mt-1.5 ml-5 flex flex-col gap-1 border-l-2 border-primary/25 pl-3"
                      aria-label="บทของ Floating-Point"
                      data-testid="drawer-fp-chapters"
                    >
                      {fpPages.map((p) => {
                        const active = pathname === p.href;
                        return (
                          <li key={p.href}>
                            <Link
                              href={p.href}
                              onClick={() => setOpen(false)}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors',
                                active
                                  ? 'bg-primary font-semibold text-primary-content'
                                  : 'text-ink/85 hover:bg-ice-100',
                              )}
                            >
                              <ChapterIcon name={p.icon} className="h-4 w-4 shrink-0" />
                              <span>
                                {p.num ? `บทที่ ${p.num} · ` : ''}
                                {p.name}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
