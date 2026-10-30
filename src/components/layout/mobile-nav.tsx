'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CHAPTERS, LAB } from '@/content/chapters';
import { cn } from '@/lib/utils';
import { ChapterIcon } from './chapter-icon';

/** Phone/tablet menu: daisyUI drawer from the right with every chapter and a one-line blurb. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const items = [
    ...CHAPTERS.map((c) => ({ ...c, label: `บทที่ ${c.number}`, name: c.title })),
    { ...LAB, label: 'เครื่องมือ', name: 'Lab', number: 0 },
  ];

  return (
    <div className="drawer drawer-end w-auto lg:hidden">
      <input
        id="mobile-nav"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
        aria-label="เปิดเมนูบทเรียน"
      />
      <div className="drawer-content">
        <label
          htmlFor="mobile-nav"
          className="btn btn-circle h-11 w-11 btn-ghost"
          aria-label="เมนูบทเรียน"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </label>
      </div>
      <div className="drawer-side z-50">
        <label htmlFor="mobile-nav" aria-label="ปิดเมนู" className="drawer-overlay" />
        <nav
          aria-label="บทเรียนทั้งหมด"
          className="glass-raised flex min-h-dvh w-[min(22rem,86vw)] flex-col gap-2 bg-white/95 p-4 pt-[max(1rem,env(safe-area-inset-top))]"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-lg font-semibold">บทเรียน</span>
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
            {items.map((it) => {
              const active = pathname === it.href;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex gap-3 rounded-xl p-3 ring-1 transition-colors',
                      active ? 'bg-primary/10 ring-primary/40' : 'ring-line/70 hover:bg-ice-100',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-lg',
                        active ? 'bg-primary text-white' : 'bg-ice-100 text-primary',
                      )}
                    >
                      <ChapterIcon name={it.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-muted">{it.label}</span>
                      <span className="block leading-snug font-semibold">{it.name}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-muted">
                        {it.blurb}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
