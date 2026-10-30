import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type GlassProps = ComponentProps<'div'> & {
  interactive?: boolean;
  raised?: boolean;
  solid?: boolean;
};

/** Base glass surface. `solid` is for dense data (tables, size charts) where legibility beats the effect. */
export function Glass({ className, interactive, raised, solid, ...props }: GlassProps) {
  return (
    <div
      className={cn(
        'rounded-xl ring-1 ring-foreground/10',
        solid ? 'glass-solid' : raised ? 'glass-raised bg-card' : 'glass bg-card',
        interactive && 'glass-interactive',
        className,
      )}
      {...props}
    />
  );
}

export function GlassPill({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'glass inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-sm font-medium ring-1 ring-foreground/10',
        className,
      )}
      {...props}
    />
  );
}
