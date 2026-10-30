import { FolderGit2 } from 'lucide-react';
import Link from 'next/link';
import { CHAPTERS, LAB } from '@/content/chapters';
import { site } from '@/lib/site';
import { LogoMark } from './logo';

export function SiteFooter() {
  return (
    <footer className="mt-16 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="glass mx-auto max-w-6xl rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="font-display text-lg font-semibold">{site.name}</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              สื่อการสอนวิชา {site.course} เรื่องเลขฐานสองและ Floating-Point (IEEE 754 Single
              Precision) · คำนวณทุกอย่างใน browser
            </p>
            <h2 className="mt-5 text-sm font-semibold">จัดทำโดย</h2>
            <ul className="mt-2 grid gap-1.5 text-sm md:grid-cols-2 md:gap-x-6">
              {site.authors.map((a) => (
                <li key={a.id} className="flex flex-wrap gap-x-2">
                  <span className="num font-mono text-muted">{a.id}</span>
                  <span>{a.name}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">
              <span className="font-semibold">อาจารย์ผู้สอน:</span> {site.instructor}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold">บทเรียน</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {CHAPTERS.map((c) => (
                  <li key={c.slug}>
                    <Link href={c.href} className="link text-ink/80 link-hover">
                      {c.number}. {c.short}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={LAB.href} className="link text-ink/80 link-hover">
                    {LAB.title}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold">อ้างอิง</h2>
              <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
                {site.references.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <a
                href={site.githubUrl}
                className="mt-3 inline-flex link items-center gap-1.5 text-sm text-ink/80 link-hover"
                rel="noreferrer"
                target="_blank"
              >
                <FolderGit2 className="h-4 w-4" aria-hidden />
                โค้ดบน GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
