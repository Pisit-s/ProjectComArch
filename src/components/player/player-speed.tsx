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

/**
 * Spring for movement inside a step: about `seconds` at 1× (well under 60% of STEP_MS),
 * divided by the playback speed, instant under reduced motion (PLAN.md 4.4).
 */
export function useStageSpring(seconds = 0.45) {
  const { speed, reduced } = useContext(PlayerSpeedContext);
  return reduced
    ? ({ duration: 0 } as const)
    : ({ type: 'spring', visualDuration: seconds / speed, bounce: 0.15 } as const);
}

/** Plain tween duration (seconds) scaled by the playback speed; 0 under reduced motion. */
export function useStageDuration(seconds: number): number {
  const { speed, reduced } = useContext(PlayerSpeedContext);
  return reduced ? 0 : seconds / speed;
}
