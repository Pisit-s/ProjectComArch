import { CircleAlert, Info, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  info: { icon: Info, cls: 'bg-ice-100 ring-primary/20' },
  tip: { icon: Lightbulb, cls: 'bg-bit-exp/8 ring-bit-exp/30' },
  warn: { icon: CircleAlert, cls: 'bg-bit-sign/8 ring-bit-sign/30' },
} as const;

export function Callout({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const T = TONES[tone];
  return (
    <div className={cn('flex gap-3 rounded-xl p-4 ring-1', T.cls, className)}>
      <T.icon className="mt-0.5 h-5 w-5 shrink-0 text-ink/70" aria-hidden />
      <div className="min-w-0 space-y-1 text-[0.95rem]">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/** A formula line in JetBrains Mono with <sup>/<sub> (no KaTeX). */
export function Formula({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'glass-solid scroll-x my-2 rounded-lg px-4 py-3 text-center font-mono text-base ring-1 ring-foreground/10 sm:text-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}
