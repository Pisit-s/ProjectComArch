'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { GLOSSARY, type TermKey } from '@/content/glossary';

/** A technical term with its meaning on tap/click (not hover only). */
export function Term({ k, children }: { k: TermKey; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const g = GLOSSARY[k];

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (
        e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="cursor-help font-semibold underline decoration-primary/60 decoration-dotted decoration-2 underline-offset-4"
      >
        {children ?? g.term}
      </button>
      {open && (
        <span
          id={id}
          role="note"
          className="absolute top-full left-0 z-30 mt-1 block w-[min(18rem,80vw)] rounded-lg bg-white p-3 text-sm leading-snug font-normal shadow-lg ring-1 ring-line"
        >
          <span className="block font-semibold">{g.term}</span>
          {g.meaning}
        </span>
      )}
    </span>
  );
}
