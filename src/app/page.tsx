import { ArrowRight, Calculator, Cpu, FlaskConical, X } from 'lucide-react';
import Link from 'next/link';
import { BeamRing } from '@/components/glass/beam-ring';
import { Glass, GlassPill } from '@/components/glass/glass';
import { ChapterIcon } from '@/components/layout/chapter-icon';
import { HomeDemo } from '@/components/tools/home-demo';
import { ToolBoundary } from '@/components/tools/tool-boundary';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { BlurFade } from '@/components/ui/blur-fade';
import { CHAPTERS, LAB } from '@/content/chapters';
import { site } from '@/lib/site';

const SHORTCUTS = [
  {
    href: '/floating-point/ieee-754#converter',
    title: 'แปลงเลขเป็น IEEE 754',
    body: 'พิมพ์ทศนิยมแล้วดู 32 บิตทีละขั้น',
    icon: Cpu,
  },
  {
    href: '/floating-point/add-sub#simulator',
    title: 'Simulator บวก/ลบ',
    body: 'เลื่อนให้ Exponent เท่ากัน แล้วปัดด้วย G/R/S',
    icon: Calculator,
  },
  {
    href: '/floating-point/mul-div#simulator',
    title: 'Simulator คูณ/หาร',
    body: 'partial product, หารยาว และกรณีพิเศษ',
    icon: X,
  },
  {
    href: '/floating-point/lab',
    title: 'Lab',
    body: 'ครบ + − × ÷ และส่งลิงก์ตัวอย่างได้',
    icon: FlaskConical,
    featured: true,
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 sm:pt-14">
      <section className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]" aria-labelledby="hero-h">
        <div className="tb-rise lg:pt-6">
          <GlassPill>
            <AnimatedShinyText className="mx-0">{site.course} · IEEE 754</AnimatedShinyText>
          </GlassPill>
          <h1
            id="hero-h"
            className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            {site.name}
          </h1>
          <p className="mt-3 font-display text-2xl text-primary sm:text-3xl">{site.tagline}</p>
          <p className="mt-4 max-w-[52ch] text-lg text-ink/80">
            เรียนตั้งแต่เลขฐานสองไปจนถึงการบวก ลบ คูณ หาร Floating-Point
            ทุกขั้นตอนกดดูเองได้ทีละขั้น และคำนวณได้ตรงกับคอมพิวเตอร์จริงทุกบิต
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={CHAPTERS[0].href} className="btn h-12 min-h-12 px-6 text-base btn-primary">
              เริ่มบทที่ 1 <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/floating-point/lab"
              className="btn h-12 min-h-12 bg-white/80 btn-ghost px-6 text-base ring-1 ring-line"
            >
              เปิด Lab
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">
            ตัวอย่างสด: 0.1 + 0.2 ใน float ได้ 0.3 ไหม
          </p>
          <ToolBoundary>
            <HomeDemo />
          </ToolBoundary>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="path-h">
        <h2 id="path-h" className="font-display text-2xl font-semibold sm:text-3xl">
          เส้นทางการเรียน
        </h2>
        <p className="mt-1 text-muted">
          เรียงจากพื้นฐานไปหาเรื่องที่ยากขึ้น แต่ละบทมีเครื่องมือให้ลองและสรุปท้ายบท
        </p>
        <ol className="relative mt-6 grid gap-4 border-l-2 border-line pl-6 sm:grid-cols-2 sm:border-l-0 sm:pl-0 lg:grid-cols-3">
          {CHAPTERS.map((c, i) => (
            <li key={c.slug} className="relative">
              <span
                aria-hidden
                className="absolute top-5 -left-[2.1rem] grid h-6 w-6 place-items-center rounded-full bg-primary font-mono text-xs text-white sm:hidden"
              >
                {c.number}
              </span>
              <BlurFade delay={0.05 * i} inView className="h-full">
                <Link
                  href={c.href}
                  className="block h-full rounded-xl"
                  data-testid={`home-chapter-${c.number}`}
                >
                  <Glass interactive className="flex h-full flex-col gap-2 p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                        <ChapterIcon name={c.icon} className="h-6 w-6" />
                      </span>
                      <span className="text-sm font-semibold text-primary">บทที่ {c.number}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                    <p className="text-sm text-ink/80">{c.blurb}</p>
                    <span className="mt-auto pt-2 text-xs text-muted">
                      อ่านประมาณ {c.readMinutes} นาที
                    </span>
                  </Glass>
                </Link>
              </BlurFade>
            </li>
          ))}
          <li className="relative">
            <span
              aria-hidden
              className="absolute top-5 -left-[2.1rem] grid h-6 w-6 place-items-center rounded-full bg-navy-900 text-white sm:hidden"
            >
              <FlaskConical className="h-3.5 w-3.5" />
            </span>
            <Link href={LAB.href} className="block h-full rounded-xl">
              <Glass interactive className="flex h-full flex-col gap-2 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy-900/10 text-navy-900">
                    <ChapterIcon name={LAB.icon} className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-navy-900">ทดลองอิสระ</span>
                </div>
                <h3 className="font-display text-lg font-semibold">{LAB.title}</h3>
                <p className="text-sm text-ink/80">{LAB.blurb}</p>
              </Glass>
            </Link>
          </li>
        </ol>
      </section>

      <section className="mt-16" aria-labelledby="try-h">
        <h2 id="try-h" className="font-display text-2xl font-semibold sm:text-3xl">
          ลองเลย
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="block h-full rounded-xl">
                <Glass interactive className="relative flex h-full flex-col gap-2 p-5">
                  {'featured' in s && <BeamRing />}
                  <s.icon className="h-6 w-6 text-primary" aria-hidden />
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-ink/80">{s.body}</p>
                </Glass>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
