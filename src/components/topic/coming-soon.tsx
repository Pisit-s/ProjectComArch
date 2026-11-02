import { ArrowLeft, ArrowRight, BookOpen, CircleCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Glass } from '@/components/glass/glass';
import { firstReadyLesson, topicById, type TopicId } from '@/content/topics';
import { StatusBadge } from './status-badge';
import { TopicIcon } from './topic-icon';

/** Metadata of a coming-soon page: the topic name as title, kept out of search engines. */
export function comingSoonMetadata(id: TopicId): Metadata {
  const t = topicById(id);
  return { title: t.title, description: t.blurb, robots: { index: false } };
}

/**
 * Placeholder page of a topic that is still `coming-soon` (PLAN.md 2.4). The WP that owns the
 * topic replaces `src/app/<id>/page.tsx` as a whole when its page is ready.
 */
export function ComingSoon({ id }: { id: TopicId }) {
  const t = topicById(id);
  const next = firstReadyLesson();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 pb-4 sm:pt-14" data-testid="coming-soon">
      <Glass raised className="p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <TopicIcon name={t.icon} className="h-6 w-6" />
          </span>
          <StatusBadge status={t.status} />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-balance sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-2 text-lg text-ink/80">
          หัวข้อนี้ทีมกำลังพัฒนาอยู่ จะเปิดให้เรียน{' '}
          <span className="whitespace-nowrap">เร็ว ๆ นี้</span>
        </p>
        <p className="mt-3 max-w-[64ch] text-ink/80">{t.blurb}</p>

        <h2 className="mt-6 font-display text-xl font-semibold">สิ่งที่จะได้เรียน</h2>
        <ul className="mt-3 space-y-2" data-testid="coming-soon-covers">
          {t.covers.map((c) => (
            <li key={c} className="flex gap-2">
              <CircleCheck className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex items-center gap-1.5 text-sm text-muted">
          <BookOpen className="h-4 w-4" aria-hidden />
          อ้างอิง: {t.textbook}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/" className="btn h-12 min-h-12 px-5 text-base btn-primary">
            <ArrowLeft className="h-5 w-5" aria-hidden />
            กลับหน้าแรก
          </Link>
          {next && (
            <Link
              href={next.href}
              className="btn h-12 min-h-12 bg-white/80 btn-ghost px-5 text-base ring-1 ring-line"
            >
              ไปเรียน {next.title}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          )}
        </div>
      </Glass>
    </div>
  );
}
