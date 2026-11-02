import { ArrowRightToLine, CirclePlus, MoveHorizontal, Target } from 'lucide-react';
import { UI } from '@/content/lesson/copy';
import { cn } from '@/lib/utils';

const STEPS = [
  { n: 1, label: UI.stepAlign, Icon: ArrowRightToLine },
  { n: 2, label: UI.stepAdd, Icon: CirclePlus },
  { n: 3, label: UI.stepNorm, Icon: MoveHorizontal },
  { n: 4, label: UI.stepRound, Icon: Target },
] as const;

/** The four steps of floating-point add / subtract, same icons in Chapters 5, 6 and 7. */
export function StepBar({ active }: { active: number }) {
  return (
    <ol className="grid grid-cols-4 gap-1.5" aria-label="4 ขั้น" data-testid="step-bar">
      {STEPS.map(({ n, label, Icon }) => {
        const on = n === active;
        const done = active > n;
        return (
          <li
            key={n}
            aria-current={on ? 'step' : undefined}
            className={cn(
              'flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold ring-1 transition-colors sm:text-sm',
              on
                ? 'bg-primary text-white ring-primary'
                : done
                  ? 'bg-primary/10 text-secondary ring-primary/25'
                  : 'bg-white/70 text-muted ring-line',
            )}
          >
            <span className="num font-mono">{n}</span>
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden truncate min-[420px]:inline">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
