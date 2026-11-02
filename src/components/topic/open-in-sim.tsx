import { Hammer, SquareTerminal } from 'lucide-react';
import Link from 'next/link';
import type { MipsExampleId } from '@/content/mips-example-ids';
import { isReady, topicById } from '@/content/topics';
import { cn } from '@/lib/utils';

/**
 * "ลองใน MIPS Simulator" button that opens a checked example program (PLAN.md 6.2). While the
 * simulator is not ready it renders a disabled button that says so.
 */
export function OpenInSim({
  example,
  label = 'ลองใน MIPS Simulator',
  className,
}: {
  example: MipsExampleId;
  label?: string;
  className?: string;
}) {
  const sim = topicById('mips');
  const classes = cn('btn h-11 min-h-11 gap-2 px-4', className);
  if (!isReady('mips')) {
    return (
      <button
        type="button"
        disabled
        className={cn(classes, 'btn-disabled')}
        data-testid={`open-in-sim-${example}`}
      >
        <Hammer className="h-4 w-4" aria-hidden />
        {sim.title} (กำลังพัฒนา)
      </button>
    );
  }
  return (
    <Link
      href={{ pathname: sim.href, query: { example } }}
      className={cn(classes, 'btn-secondary')}
      data-testid={`open-in-sim-${example}`}
    >
      <SquareTerminal className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
