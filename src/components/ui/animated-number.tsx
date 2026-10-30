'use client';

import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/** Integer that counts to its new value (about 400ms); instant under reduced motion. */
export function AnimatedNumber({
  value,
  className,
  duration = 0.4,
  ...rest
}: {
  value: number;
  className?: string;
  duration?: number;
  'data-testid'?: string;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduce || from.current === value || duration === 0) {
      from.current = value;
      const id = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(id);
    }
    const controls = animate(from.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setShown(Math.round(v)),
      onComplete: () => {
        from.current = value;
        setShown(value);
      },
    });
    return () => {
      from.current = value;
      controls.stop();
    };
  }, [value, reduce, duration]);

  return (
    <span className={className} {...rest}>
      {shown < 0 ? `−${-shown}` : shown}
    </span>
  );
}
