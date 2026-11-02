'use client';

import { useEffect } from 'react';

const HOLD_MS = 2500;
const USER_INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

/**
 * Keeps a #chapter link on target. Scenes above the target load after the jump and are taller
 * than their reserved space, which pushed the target down. For a short while after a hash jump
 * (or a page opened with a hash), re-align the target whenever the page height changes, until
 * the user scrolls or touches the page.
 */
export function HashAnchor() {
  useEffect(() => {
    let release: (() => void) | null = null;
    const hold = () => {
      release?.();
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      const ro = new ResizeObserver(() => target.scrollIntoView({ block: 'start' }));
      const done = () => {
        ro.disconnect();
        clearTimeout(timer);
        USER_INPUT.forEach((t) => window.removeEventListener(t, done));
        release = null;
      };
      const timer = setTimeout(done, HOLD_MS);
      USER_INPUT.forEach((t) => window.addEventListener(t, done, { passive: true, once: true }));
      ro.observe(document.body);
      release = done;
    };
    hold();
    window.addEventListener('hashchange', hold);
    return () => {
      release?.();
      window.removeEventListener('hashchange', hold);
    };
  }, []);
  return null;
}
