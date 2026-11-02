import { Divide, SquareTerminal, X, type LucideProps } from 'lucide-react';
import { FpMark } from '@/components/layout/logo';
import type { TopicIconName } from '@/content/topics';

const LUCIDE = { multiply: X, divide: Divide, mips: SquareTerminal } as const;

/** Icon of a topic: lucide for multiply, divide and MIPS, the three-bar mark for Floating-Point. */
export function TopicIcon({
  name,
  className = 'h-5 w-5',
  ...props
}: { name: TopicIconName } & LucideProps) {
  if (name === 'floating-point') return <FpMark className={className} />;
  const Icon = LUCIDE[name];
  return <Icon aria-hidden className={className} {...props} />;
}
