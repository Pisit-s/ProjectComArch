'use client';

import { useCallback, useEffect, useState } from 'react';

export const SPEEDS = [0.5, 1, 1.5, 2] as const;
export type Speed = (typeof SPEEDS)[number];
/** Time per step during auto play at 1x. */
export const STEP_MS = 2400;

export function usePlayer(count: number, initial = 0, autoPlay = false) {
  const clamp = useCallback((i: number) => Math.max(0, Math.min(count - 1, i)), [count]);
  const [index, setIndex] = useState(() => clamp(initial));
  const [playRequested, setPlayRequested] = useState(autoPlay);
  const [speed, setSpeed] = useState<Speed>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  // auto play stops by itself on the last step
  const playing = playRequested && index < count - 1;

  const go = useCallback(
    (i: number, fromUser = true) => {
      const next = clamp(i);
      setDirection(next >= index ? 1 : -1);
      setIndex(next);
      if (fromUser) setPlayRequested(false);
    },
    [clamp, index],
  );

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setDirection(1);
      setIndex((i) => Math.min(count - 1, i + 1));
    }, STEP_MS / speed);
    return () => clearTimeout(t);
  }, [playing, index, count, speed]);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlayRequested(false);
      return;
    }
    if (index >= count - 1) {
      // play again from the start when already at the end
      setDirection(-1);
      setIndex(0);
    }
    setPlayRequested(true);
  }, [playing, index, count]);

  return {
    index,
    direction,
    playing,
    speed,
    setSpeed,
    stop: () => setPlayRequested(false),
    go,
    next: () => go(index + 1),
    prev: () => go(index - 1),
    restart: () => go(0),
    togglePlay,
  };
}
