import { Binary, Cpu, Diff, FlaskConical, SquareDivide, X, type LucideProps } from 'lucide-react';
import type { IconName } from '@/content/chapters';

const ICONS = {
  binary: Binary,
  'divide-fraction': SquareDivide,
  cpu: Cpu,
  'plus-minus': Diff,
  x: X,
  flask: FlaskConical,
} as const;

export function ChapterIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden {...props} />;
}
