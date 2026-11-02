'use client';

import { useEffect, useState } from 'react';
import { CHAPTERS } from '@/content/lesson/sections';

/** Scrollspy: the chapter whose body crosses the middle of the screen (no hash changes). */
export function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (e): e is HTMLElement => !!e,
    );
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const top = document.getElementById('top');
    const topIo = new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), {
      rootMargin: '-45% 0px -50% 0px',
    });
    if (top) topIo.observe(top);
    return () => {
      io.disconnect();
      topIo.disconnect();
    };
  }, []);
  return active;
}
