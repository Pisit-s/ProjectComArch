'use client';

import { UI } from '@/content/lesson/copy';
import { minus } from '@/components/ui/num';
import { cn } from '@/lib/utils';

/** Example chips under an input (inputs only; the scene computes nothing itself). */
export function ExampleChips({
  items,
  current,
  onPick,
  testId,
}: {
  items: string[];
  current: string;
  onPick: (v: string) => void;
  testId: string;
}) {
  return (
    <div className="scroll-x -mx-4 flex gap-1.5 px-4 pb-1" aria-label={UI.examples} role="group">
      {items.map((t) => {
        const on = t === current;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(t)}
            className={cn(
              'btn h-9 min-h-9 shrink-0 rounded-full px-3 font-mono text-sm font-medium',
              on ? 'btn-primary' : 'bg-white/80 ring-1 ring-line',
            )}
            data-testid={`${testId}-chip`}
          >
            {minus(t)}
          </button>
        );
      })}
    </div>
  );
}
