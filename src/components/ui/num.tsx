import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Typographic minus for display. */
export const minus = (s: string): string => s.replace(/^-/, '−').replace(/e-/, 'e−');

/** "1.4e-45" -> 1.4 × 10^−45 ; "Infinity" -> ∞ ; plain numbers unchanged. */
export function Num({ value, className }: { value: string; className?: string }) {
  let body: ReactNode = minus(value);
  if (value === 'Infinity') body = '+∞';
  else if (value === '-Infinity') body = '−∞';
  else {
    const m = /^(-?[\d.…]+)e([+-])(\d+)$/.exec(value);
    if (m) {
      body = (
        <>
          {minus(m[1])} × 10
          <sup>
            {m[2] === '-' ? '−' : ''}
            {m[3]}
          </sup>
        </>
      );
    }
  }
  return <span className={cn('num font-mono break-all', className)}>{body}</span>;
}

/** base^exp with a real superscript. */
export function Pow({
  base = '2',
  exp,
  className,
}: {
  base?: string;
  exp: number | string;
  className?: string;
}) {
  const e = typeof exp === 'number' ? (exp < 0 ? `−${-exp}` : String(exp)) : exp;
  return (
    <span className={cn('num font-mono whitespace-nowrap', className)}>
      {base}
      <sup>{e}</sup>
    </span>
  );
}

/** Subscript base marker, e.g. 1011₂ */
export function Base({ children, base = 2 }: { children: ReactNode; base?: number }) {
  return (
    <span className="num font-mono whitespace-nowrap">
      {children}
      <sub>{base}</sub>
    </span>
  );
}
