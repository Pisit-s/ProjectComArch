import { AnimatedNumber } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';

/** "× 2^e" tag whose exponent counts to its new value. */
export function ExponentTag({
  exp,
  base = 2,
  className,
  testId,
}: {
  exp: number;
  base?: number;
  className?: string;
  testId?: string;
}) {
  return (
    <span
      className={cn('num inline-flex items-start font-mono whitespace-nowrap', className)}
      data-testid={testId}
    >
      <span className="text-muted">×&nbsp;</span>
      {base}
      <AnimatedNumber
        value={exp}
        className={cn('-mt-1 ml-px text-[0.7em] font-semibold', 'text-bit-exp-ink')}
      />
    </span>
  );
}
