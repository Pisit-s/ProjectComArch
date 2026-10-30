import { cn } from '@/lib/utils';
import { FIELD_STYLE, type FieldKind } from './field-style';

export function FieldLegend({
  fields = ['sign', 'exp', 'frac'],
  className,
}: {
  fields?: FieldKind[];
  className?: string;
}) {
  return (
    <ul
      className={cn('flex flex-wrap gap-x-4 gap-y-1 text-sm', className)}
      aria-label="สีของแต่ละส่วน"
    >
      {fields.map((f) => (
        <li key={f} className={cn('flex items-center gap-1.5 font-medium', FIELD_STYLE[f].text)}>
          <span
            aria-hidden
            className={cn(
              'h-3 w-3 rounded-sm',
              FIELD_STYLE[f].chip,
              f === 'hidden' && 'border border-dashed border-white',
            )}
          />
          {FIELD_STYLE[f].label}
        </li>
      ))}
    </ul>
  );
}
