'use client';

import { useEffect } from 'react';
import { parsePlayQuery } from '@/lib/url-state';
import { MAIN } from '@/content/lesson/examples';

/**
 * Old Lab links (/lab?a=…) are redirected to /?a=… without a hash (PLAN.md 4.1). When the page
 * opens with a playground query and no hash, scroll to the playground so the shared example shows.
 */
export function PlaygroundLink() {
  useEffect(() => {
    if (window.location.hash) return;
    const { present } = parsePlayQuery(new URLSearchParams(window.location.search), {
      ...MAIN,
      step: null,
    });
    if (!present) return;
    const target = document.getElementById('playground');
    if (!target) return;
    window.history.replaceState(null, '', `${window.location.search}#playground`);
    target.scrollIntoView();
  }, []);
  return null;
}
