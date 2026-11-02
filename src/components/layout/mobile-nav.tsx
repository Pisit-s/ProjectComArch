'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UI } from '@/content/lesson/copy';
import { CHAPTERS } from '@/content/lesson/sections';
import { cn } from '@/lib/utils';
import { useActiveSection } from './use-active-section';

/** Phone/tablet menu: daisyUI drawer from the right listing every chapter. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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
          aria-label={UI.menu}
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
          aria-label={UI.close}
          className="drawer-overlay"
          onClick={() => setOpen(false)}
        />
        <nav
          id="mobile-nav-panel"
          aria-label={UI.menu}
          className="glass-raised flex min-h-dvh w-[min(20rem,84vw)] flex-col gap-2 bg-white/95 p-4 pt-[max(1rem,env(safe-area-inset-top))]"
        >
          <div className="mb-1 flex items-center justify-end">
            <button
              type="button"
              className="btn btn-circle h-11 w-11 btn-ghost"
              aria-label={UI.close}
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <ol className="flex flex-col gap-1.5">
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={c.id === active ? 'location' : undefined}
                  className={cn(
                    'flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 ring-1',
                    c.id === active
                      ? 'bg-primary/10 ring-primary/40'
                      : 'ring-line/70 hover:bg-ice-100',
                  )}
                >
                  <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-sm text-white">
                    {c.number}
                  </span>
                  <span className="leading-snug font-medium">{c.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
