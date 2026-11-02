'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Scene id (sections.ts) -> scene component. Each scene loads its own code only when
 * SceneShell decides it is near the viewport (PLAN.md 4.9).
 */
export const SCENES: Record<string, ComponentType> = {
  dec4: dynamic(() => import('./dec4-scene').then((m) => m.Dec4Scene)),
  'fp-add-bits': dynamic(() => import('./chapter5').then((m) => m.FpAddScene)),
  'fp-sub': dynamic(() => import('./chapter5').then((m) => m.FpSubScene)),
  rounding: dynamic(() => import('./chapter5').then((m) => m.RoundingScene)),
  'slide-fun-fact': dynamic(() => import('./chapter5').then((m) => m.FunFactScene)),
};
