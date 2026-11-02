import { CircleCheck, Hammer } from 'lucide-react';
import type { TopicStatus } from '@/content/topics';
import { cn } from '@/lib/utils';

export const STATUS_LABEL: Record<TopicStatus, string> = {
  ready: 'พร้อมเรียน',
  'coming-soon': 'กำลังพัฒนา',
};

/** "พร้อมเรียน" / "กำลังพัฒนา" as a daisyUI badge (icon + text, colour is not the only cue). */
export function StatusBadge({ status, className }: { status: TopicStatus; className?: string }) {
  const ready = status === 'ready';
  const Icon = ready ? CircleCheck : Hammer;
  return (
    <span
      data-status={status}
      className={cn(
        'badge gap-1 border-0 badge-sm font-medium whitespace-nowrap',
        ready ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600',
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
