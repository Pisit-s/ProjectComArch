'use client';

import { useEffect, useRef } from 'react';

/** Thin bar under the header: how far down the page the reader is. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const ratio = max > 0 ? el.scrollTop / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div
      className="mx-auto mt-1.5 h-1 max-w-6xl overflow-hidden rounded-full bg-transparent"
      aria-hidden
    >
      <div ref={ref} className="h-full origin-left scale-x-0 rounded-full bg-primary/70" />
    </div>
  );
}
