import { ChartColumn, FolderGit2 } from 'lucide-react';
import Link from 'next/link';
import { TOPICS_IN_ORDER } from '@/content/topics';
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
              เว็บไซต์เพื่อการเรียนรู้และ Simulation วิชา {site.course} · คำนวณทุกอย่างใน browser
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
              <h2 className="text-sm font-semibold">หัวข้อ</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {TOPICS_IN_ORDER.map((t) => (
                  <li key={t.id}>
                    <Link href={t.href} className="link text-ink/80 link-hover">
                      {t.title}
                    </Link>
                    {t.status !== 'ready' && (
                      <span className="ml-1.5 text-xs text-muted">(กำลังพัฒนา)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold">อ้างอิง</h2>
              <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
                {site.references.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              {site.githubUrl && (
                <a
                  href={site.githubUrl}
                  className="mt-3 inline-flex link items-center gap-1.5 text-sm text-ink/80 link-hover"
                  rel="noreferrer"
                  target="_blank"
                >
                  <FolderGit2 className="h-4 w-4" aria-hidden />
                  โค้ดบน GitHub
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-line/70 pt-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            {site.name} · เว็บไซต์เพื่อการเรียนรู้และ Simulation วิชา {site.course}
          </p>
          <p
            className="inline-flex items-center gap-2 self-start rounded-full bg-white/80 py-1.5 pr-3 pl-1.5 ring-1 ring-line sm:self-auto"
            data-testid="analytics-badge"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
              <ChartColumn className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span>
              นับผู้เข้าชมด้วย{' '}
              <span className="font-semibold text-ink/80">Vercel Web Analytics</span> · ไม่ใช้
              cookie เก็บเฉพาะข้อมูลแบบไม่ระบุตัวตน
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
