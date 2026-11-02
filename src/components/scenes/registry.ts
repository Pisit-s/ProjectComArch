'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Scene id (sections.ts) -> scene component. Each scene loads its own code only when
 * SceneShell decides it is near the viewport (PLAN.md 4.9). Every scene is registered already:
 * owners edit only their own chapter file (docs/PARALLEL.md), never this registry.
 */
export const SCENES: Record<string, ComponentType> = {
  'hero-teaser': dynamic(() => import('./hero-scene').then((m) => m.HeroTeaser)),
  // chapter 1 (addsub-ch12)
  'int-add': dynamic(() => import('./chapter1').then((m) => m.IntAddScene)),
  'int-sub': dynamic(() => import('./chapter1').then((m) => m.IntSubScene)),
  overflow: dynamic(() => import('./chapter1').then((m) => m.OverflowScene)),
  shift: dynamic(() => import('./chapter1').then((m) => m.ShiftScene)),
  // chapter 2 (addsub-ch12)
  'c-code': dynamic(() => import('./chapter2').then((m) => m.CCodeScene)),
  point: dynamic(() => import('./chapter2').then((m) => m.PointScene)),
  // chapter 3 (addsub-ch34)
  layout: dynamic(() => import('./chapter3').then((m) => m.LayoutScene)),
  'bit-play': dynamic(() => import('./chapter3').then((m) => m.BitPlayScene)),
  special: dynamic(() => import('./chapter3').then((m) => m.SpecialScene)),
  // chapter 4 (addsub-ch34)
  encode: dynamic(() => import('./chapter4').then((m) => m.EncodeScene)),
  decode: dynamic(() => import('./chapter4').then((m) => m.DecodeScene)),
  // chapter 5-7 (addsub-redesign)
  dec4: dynamic(() => import('./dec4-scene').then((m) => m.Dec4Scene)),
  'fp-add-bits': dynamic(() => import('./chapter5').then((m) => m.FpAddScene)),
  'fp-sub': dynamic(() => import('./chapter5').then((m) => m.FpSubScene)),
  rounding: dynamic(() => import('./chapter5').then((m) => m.RoundingScene)),
  'slide-fun-fact': dynamic(() => import('./chapter5').then((m) => m.FunFactScene)),
  'circuit-flow': dynamic(() => import('./circuit-scene').then((m) => m.CircuitScene)),
  playground: dynamic(() => import('./playground-scene').then((m) => m.PlaygroundScene)),
};
