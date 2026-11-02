import type { ReactNode } from 'react';
import { CHAPTERS, LAB, type ChapterSlug, chapterBySlug } from '@/content/chapters';
import { ChapterIcon } from './chapter-icon';
import { LessonLayout, type TocItem } from './lesson-layout';

export { Section, Summary, type TocItem } from './lesson-layout';

/** A Floating-Point chapter: `LessonLayout` filled from `chapters.ts` (looks as in stage 1). */
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
  const i = CHAPTERS.findIndex((c) => c.slug === slug);
  const prev = CHAPTERS[i - 1];
  const next = CHAPTERS[i + 1];
  return (
    <LessonLayout
      icon={<ChapterIcon name={ch.icon} className="h-4 w-4" />}
      eyebrow={`บทที่ ${ch.number}`}
      title={ch.title}
      objectives={ch.objectives}
      readMinutes={ch.readMinutes}
      toc={toc}
      prev={
        prev && {
          href: prev.href,
          caption: `บทก่อนหน้า · บทที่ ${prev.number}`,
          title: prev.title,
        }
      }
      next={
        next
          ? { href: next.href, caption: `บทถัดไป · บทที่ ${next.number}`, title: next.title }
          : { href: LAB.href, caption: 'ต่อไป', title: 'ลองทุกอย่างใน Lab' }
      }
    >
      {children}
    </LessonLayout>
  );
}
