'use client';

import { useEffect } from 'react';

/**
 * Drives the highlight on every `.glass-interactive` pane. One document-level listener writes --gx/--gy/--go
 * on the pane under the pointer. Mouse: follows the cursor. Touch: lights up at the tap point, then fades.
 */
export function GlassPointer() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let current: HTMLElement | null = null;
    let frame = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const clear = (el: HTMLElement | null) => el?.style.setProperty('--go', '0');

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      el.style.setProperty('--gx', `${x}%`);
      el.style.setProperty('--gy', `${y}%`);
      el.style.setProperty('--go', '1');
      pending = null;
    };

    const locate = (e: PointerEvent) => {
      const target =
        e.target instanceof Element ? e.target.closest<HTMLElement>('.glass-interactive') : null;
      if (!target) return null;
      const r = target.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return null;
      return {
        el: target,
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      };
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const hit = locate(e);
      if (hit?.el !== current) {
        clear(current);
        current = hit?.el ?? null;
      }
      if (!hit) return;
      pending = hit;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      const hit = locate(e);
      if (!hit) return;
      clearTimeout(fadeTimer);
      hit.el.dataset.touchFade = '1';
      hit.el.style.setProperty('--gx', `${hit.x}%`);
      hit.el.style.setProperty('--gy', `${hit.y}%`);
      hit.el.style.setProperty('--go', '1');
      fadeTimer = setTimeout(() => clear(hit.el), 450);
    };

    const onLeave = () => {
      clear(current);
      current = null;
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(fadeTimer);
    };
  }, []);

  return null;
}
