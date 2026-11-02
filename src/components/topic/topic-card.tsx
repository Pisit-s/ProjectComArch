import { ArrowRight, BookOpen, Check } from 'lucide-react';
import Link from 'next/link';
import { BeamRing } from '@/components/glass/beam-ring';
import { Glass } from '@/components/glass/glass';
import type { Topic } from '@/content/topics';
import { cn } from '@/lib/utils';
import { StatusBadge } from './status-badge';
import { TopicIcon } from './topic-icon';

/**
 * A topic on the home page (PLAN.md 2.3). `wide` is the simulator card: full row on desktop,
 * the whole `covers` list, and a travelling beam on its border. Coming-soon topics stay clickable
 * but look a little quieter.
 */
export function TopicCard({ topic: t, wide = false }: { topic: Topic; wide?: boolean }) {
  const ready = t.status === 'ready';
  const label = t.kind === 'simulator' ? 'Simulator' : `หัวข้อที่ ${t.order}`;
  const covers = wide ? t.covers : t.covers.slice(0, 2);
  return (
    <Link
      href={t.href}
      className="group block h-full rounded-xl"
      data-testid={`topic-card-${t.id}`}
      data-status={t.status}
    >
      <Glass
        interactive
        raised={ready}
        className={cn(
          'relative flex h-full flex-col gap-3 p-5',
          wide && 'sm:p-6 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-8',
          !ready && 'bg-white/55',
        )}
      >
        {wide && <BeamRing />}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                ready ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500',
              )}
            >
              <TopicIcon name={t.icon} className="h-6 w-6" />
            </span>
            <span className={cn('text-sm font-semibold', ready ? 'text-primary' : 'text-muted')}>
              {label}
            </span>
            <StatusBadge status={t.status} className="ml-auto" />
          </div>
          <h3
            className={cn(
              'font-display font-semibold',
              wide ? 'text-xl sm:text-2xl' : 'text-lg',
              !ready && 'text-ink/85',
            )}
          >
            {t.title}
          </h3>
          <p className={cn('text-sm', ready ? 'text-ink/80' : 'text-ink/70')}>{t.blurb}</p>
        </div>
        <div className="mt-auto flex flex-col gap-3 lg:mt-0">
          <ul className="space-y-1.5 text-sm">
            {covers.map((c) => (
              <li key={c} className="flex gap-2">
                <Check
                  className={cn('mt-0.5 h-4 w-4 shrink-0', ready ? 'text-primary' : 'text-muted')}
                  aria-hidden
                />
                <span className="text-ink/80">{c}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              {t.textbook}
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </div>
        </div>
      </Glass>
    </Link>
  );
}
