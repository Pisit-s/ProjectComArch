'use client';

import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UI } from '@/content/lesson/copy';

/** Zoom levels of the page, like a browser's Cmd +/Cmd − steps. */
export const ZOOM_STEPS = [0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2] as const;
export const ZOOM_KEY = 'comkrub-zoom';

/**
 * Inline script for <body>: applies the saved zoom before the first paint (no jump).
 * Storage can be blocked (private mode): then the page just stays at 100%.
 */
export const ZOOM_BOOT = `try{var z=parseFloat(localStorage.getItem('${ZOOM_KEY}'));if(z>0&&z!==1)document.documentElement.style.zoom=String(z)}catch(e){}`;

/** Fired on window whenever the page zoom changes. */
export const ZOOM_EVENT = 'comkrub-zoom';

function apply(z: number) {
  document.documentElement.style.zoom = z === 1 ? '' : String(z);
  // the header and the phone menu each have a control: keep both in step
  window.dispatchEvent(new Event(ZOOM_EVENT));
  try {
    if (z === 1) localStorage.removeItem(ZOOM_KEY);
    else localStorage.setItem(ZOOM_KEY, String(z));
  } catch {
    // storage blocked: the zoom still works for this visit
  }
}

/** − 100% + in the header: scales the whole page (text, bits, circuits) like browser zoom. */
export function ZoomControl({ testId = 'zoom' }: { testId?: string }) {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    // the boot script may have applied a saved zoom before hydration
    const read = () => {
      const z = parseFloat(document.documentElement.style.zoom || '1');
      setZoom(Number.isFinite(z) && z > 0 ? z : 1);
    };
    const id = requestAnimationFrame(read);
    window.addEventListener(ZOOM_EVENT, read);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener(ZOOM_EVENT, read);
    };
  }, []);
  const at = ZOOM_STEPS.findIndex((s) => s >= zoom - 0.001);
  const set = (z: number) => apply(z);
  const btn =
    'btn btn-circle btn-ghost h-9 min-h-9 w-9 btn-sm disabled:bg-transparent disabled:opacity-40';
  return (
    <div className="flex items-center" role="group" aria-label={UI.zoom} data-testid={testId}>
      <button
        type="button"
        className={btn}
        aria-label={UI.zoomOut}
        disabled={at <= 0}
        onClick={() => set(ZOOM_STEPS[Math.max(0, at - 1)])}
        data-testid={`${testId}-out`}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className="num h-9 min-w-12 rounded-full px-1 text-center font-mono text-xs font-semibold text-ink hover:bg-ice-100"
        // the name starts with the visible text (100%) so voice control users can say it
        aria-label={`${Math.round(zoom * 100)}% ${UI.zoomReset}`}
        onClick={() => set(1)}
        data-testid={`${testId}-level`}
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        className={btn}
        aria-label={UI.zoomIn}
        disabled={at >= ZOOM_STEPS.length - 1}
        onClick={() => set(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, at + 1)])}
        data-testid={`${testId}-in`}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
