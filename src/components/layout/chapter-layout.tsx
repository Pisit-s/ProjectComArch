import { ArrowLeft, ArrowRight, Clock, ListChecks, Target } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Glass, GlassPill } from '@/components/glass/glass';
import { CHAPTERS, LAB, type ChapterSlug, chapterBySlug } from '@/content/chapters';
import { ChapterIcon } from './chapter-icon';

export interface TocItem {
  id: string;
  title: string;
}

export function ChapterLayout({
  slug,
  toc,
  children,
}: {
  slug: ChapterSlug;
  toc: TocItem[];
  children: ReactNode;
}) {
  const ch = chapterBySlug(slug);
  const items = [...toc, { id: 'summary', title: 'สรุปท้ายบท' }];
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-4 sm:pt-10">
      <header className="tb-rise">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
            <ChapterIcon name={ch.icon} className="h-4 w-4" />
            บทที่ {ch.number}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden />
            อ่านประมาณ {ch.readMinutes} นาที
          </span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold text-balance sm:text-4xl">
          {ch.title}
        </h1>
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Target className="h-4 w-4 text-primary" aria-hidden />
            เรียนจบบทนี้แล้วจะ
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="วัตถุประสงค์การเรียนรู้">
            {ch.objectives.map((o) => (
              <li key={o}>
                <GlassPill className="text-left leading-snug font-normal">{o}</GlassPill>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
        <Toc items={items} />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
      <ChapterNav slug={slug} />
    </div>
  );
}

function Toc({ items }: { items: TocItem[] }) {
  const list = (
    <ol className="space-y-1 text-sm">
      {items.map((it, i) => (
        <li key={it.id}>
          <a
            href={`#${it.id}`}
            className="flex gap-2 rounded-md px-2 py-1.5 text-ink/80 hover:bg-ice-100 hover:text-ink"
          >
            <span className="num w-4 font-mono text-xs text-muted">{i + 1}</span>
            <span>{it.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <details className="glass collapse-arrow collapse mb-4 rounded-xl bg-card ring-1 ring-foreground/10 lg:hidden">
        <summary className="collapse-title min-h-11 py-3 text-sm font-semibold">
          <ListChecks className="mr-1.5 inline h-4 w-4 text-primary" aria-hidden />
          หัวข้อในบทนี้
        </summary>
        <nav aria-label="หัวข้อในบทนี้" className="collapse-content">
          {list}
        </nav>
      </details>
      <aside className="hidden lg:block">
        <nav aria-label="หัวข้อในบทนี้" className="sticky top-24">
          <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted">หัวข้อในบทนี้</p>
          {list}
        </nav>
      </aside>
    </>
  );
}

export function Section({
  id,
  title,
  children,
  wide = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  /** Tools may use the full width; reading text stays near 72ch. */
  wide?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24">
      <Glass className="p-4 sm:p-6">
        <h2 id={`${id}-h`} className="font-display text-2xl font-semibold">
          {title}
        </h2>
        <div className={wide ? 'mt-3 space-y-4' : 'prose-th mt-3 max-w-[72ch] space-y-3'}>
          {children}
        </div>
      </Glass>
    </section>
  );
}

export function Summary({ points }: { points: ReactNode[] }) {
  return (
    <section
      id="summary"
      aria-labelledby="summary-h"
      className="scroll-mt-24"
      data-testid="chapter-summary"
    >
      <div className="glass-raised rounded-2xl bg-card p-4 ring-2 ring-primary/30 sm:p-6">
        <h2 id="summary-h" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <ListChecks className="h-6 w-6 text-primary" aria-hidden />
          สรุปท้ายบท
        </h2>
        <ul className="mt-3 max-w-[72ch] list-disc space-y-2 pl-5 marker:text-primary">
          {points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ChapterNav({ slug }: { slug: ChapterSlug }) {
  const i = CHAPTERS.findIndex((c) => c.slug === slug);
  const prev = CHAPTERS[i - 1];
  const next = CHAPTERS[i + 1];
  return (
    <nav
      aria-label="บทก่อนหน้าและบทถัดไป"
      className="mt-10 grid gap-3 sm:grid-cols-2"
      data-testid="chapter-nav"
    >
      {prev ? (
        <Link href={prev.href} className="rounded-xl" data-testid="prev-chapter">
          <Glass interactive className="flex h-full items-center gap-3 p-4">
            <ArrowLeft className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="block text-xs text-muted">บทก่อนหน้า · บทที่ {prev.number}</span>
              <span className="font-semibold">{prev.title}</span>
            </span>
          </Glass>
        </Link>
      ) : (
        <span />
      )}
      <Link href={next ? next.href : LAB.href} className="rounded-xl" data-testid="next-chapter">
        <Glass interactive className="flex h-full items-center justify-end gap-3 p-4 text-right">
          <span>
            <span className="block text-xs text-muted">
              {next ? `บทถัดไป · บทที่ ${next.number}` : 'ต่อไป'}
            </span>
            <span className="font-semibold">{next ? next.title : 'ลองทุกอย่างใน Lab'}</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        </Glass>
      </Link>
    </nav>
  );
}
