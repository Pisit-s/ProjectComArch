'use client';

import type { ComponentProps } from 'react';
import { BINARY32 } from '@/lib/fp';
import { Register } from '@/components/bits/register';

/** Single-precision register (s | exponent | significand); phones split it into two rows. */
export function Register32(props: Omit<ComponentProps<typeof Register>, 'fmt'>) {
  return <Register fmt={BINARY32} {...props} />;
}
