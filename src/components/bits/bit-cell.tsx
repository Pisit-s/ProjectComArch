'use client';

import { motion } from 'motion/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { FIELD_STYLE, type FieldKind } from './field-style';

type Props = {
  bit: 0 | 1 | '0' | '1';
  field: FieldKind;
  /** Changed in the current step: sky ring + glow. */
  changed?: boolean;
  selected?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
} & Omit<ComponentProps<'button'>, 'children'>;

const SIZES = {
  xs: 'h-7 min-w-0 text-[0.7rem] sm:min-w-[1.05rem] sm:text-xs',
  sm: 'h-9 min-w-[1.35rem] text-sm',
  md: 'h-11 min-w-[1.6rem] text-base lg:min-w-[1.9rem] lg:text-lg',
  lg: 'h-11 w-11 text-lg sm:h-12 sm:w-12 sm:text-xl',
};

/**
 * One bit. 1 = 14% field colour and bold, 0 = 6%. Bottom border in the field colour.
 * Renders a button when it can be pressed (onClick), otherwise a span.
 */
export function BitCell({
  bit,
  field,
  changed,
  selected,
  size = 'md',
  className,
  onClick,
  ...rest
}: Props) {
  const one = bit === 1 || bit === '1';
  const s = FIELD_STYLE[field];
  const classes = cn(
    'relative inline-grid place-items-center rounded-md border-b-2 font-mono leading-none select-none',
    SIZES[size],
    s.border,
    s.text,
    one ? cn(s.on, 'font-bold') : cn(s.off, 'font-normal opacity-90'),
    changed && 'tb-glow ring-2 ring-sky-400',
    selected && 'outline-2 outline-offset-1 outline-ink',
    onClick && 'cursor-pointer transition-transform active:scale-95',
    className,
  );
  const face = (
    <motion.span
      key={one ? 1 : 0}
      initial={{ rotateX: 90, opacity: 0.4 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className="inline-block"
    >
      {one ? 1 : 0}
    </motion.span>
  );
  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} {...rest}>
        {face}
      </button>
    );
  }
  return (
    <span className={classes} aria-label={rest['aria-label']}>
      {face}
    </span>
  );
}
