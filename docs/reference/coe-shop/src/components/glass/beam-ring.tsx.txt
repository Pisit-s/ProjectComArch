import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type Props = { className?: string; duration?: number; from?: string; to?: string };

/**
 * A light that travels around the card's own border, corners included. It is a ring masked out of the
 * card's shape (same technique as .glass-interactive::before), so it can never wander inside the card.
 * Put it inside a `relative` element with rounded corners.
 */
export function BeamRing({ className, duration = 6, from = '#2563eb', to = '#38b6ff' }: Props) {
  return (
    <span
      aria-hidden
      className={cn('beam-ring', className)}
      style={
        { '--beam-duration': `${duration}s`, '--beam-from': from, '--beam-to': to } as CSSProperties
      }
    />
  );
}
