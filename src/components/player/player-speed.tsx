'use client';

import { createContext, useContext } from 'react';

export interface PlayerMotion {
  /** Playback speed multiplier (0.5 .. 2). Divide every duration by it. */
  speed: number;
  /** User asked for reduced motion: show the end state at once. */
  reduced: boolean;
}

export const PlayerSpeedContext = createContext<PlayerMotion>({ speed: 1, reduced: false });

export function usePlayerMotion(): PlayerMotion & { d: (seconds: number) => number } {
  const ctx = useContext(PlayerSpeedContext);
  return { ...ctx, d: (s: number) => (ctx.reduced ? 0 : s / ctx.speed) };
}
