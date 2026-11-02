import { FIELD_STYLE, type FieldKind } from '@/components/bits/field-style';
import { cn } from '@/lib/utils';

export interface BracketGroup {
  /** Number of bits (or columns) under this bracket. */
  span: number;
  kind: FieldKind;
  label?: string;
}

/** Curly brackets with a label under groups of bits, sized by how many bits each group has. */
export function FieldBrackets({
  groups,
  className,
  testId = 'field-brackets',
}: {
  groups: BracketGroup[];
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={cn('grid gap-1', className)}
      style={{ gridTemplateColumns: groups.map((g) => `${g.span}fr`).join(' ') }}
      data-testid={testId}
    >
      {groups.map((g, i) => (
        <div key={i} className="flex min-w-0 flex-col items-stretch">
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-2.5 w-full" aria-hidden>
            <path
              d="M1 1 Q1 5 6 5 H44 Q50 5 50 9 Q50 5 56 5 H94 Q99 5 99 1"
              fill="none"
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
              stroke="currentColor"
              className={FIELD_STYLE[g.kind].text}
            />
          </svg>
          <span
            className={cn('truncate text-center text-xs font-semibold', FIELD_STYLE[g.kind].text)}
          >
            {g.label ?? FIELD_STYLE[g.kind].label}
          </span>
        </div>
      ))}
    </div>
  );
}
