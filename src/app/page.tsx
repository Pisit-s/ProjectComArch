import { Keyboard, MousePointerClick, SlidersHorizontal } from 'lucide-react';
import type { Metadata } from 'next';
import { GlassPill } from '@/components/glass/glass';
import { TopicCard } from '@/components/topic/topic-card';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { BlurFade } from '@/components/ui/blur-fade';
import { TOPICS_IN_ORDER } from '@/content/topics';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: `${site.name} · ${site.tagline}` },
};

const LESSONS = TOPICS_IN_ORDER.filter((t) => t.kind === 'lesson');
const SIMULATORS = TOPICS_IN_ORDER.filter((t) => t.kind === 'simulator');

const HOW_TO = [
  {
    icon: MousePointerClick,
    title: 'กดดูทีละขั้น',
    body: 'ปุ่มถัดไป ย้อนกลับ หรือกดเลขขั้นเพื่อกระโดด',
  },
  {
    icon: Keyboard,
    title: 'เล่นอัตโนมัติและโหมดนำเสนอ',
    body: 'ปรับความเร็วได้ ขยายเต็มจอ ใช้ลูกศรกับ Space ได้',
  },
  {
    icon: SlidersHorizontal,
    title: 'ใส่ค่าเอง',
    body: 'ทุกเครื่องมือรับค่าที่อยากลอง และคำนวณตรงกับคอมพิวเตอร์จริงทุกบิต',
  },
] as const;

/** Home: pick a topic (PLAN.md 2.3). Topics and their status come from `src/content/topics.ts`. */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-4 sm:pt-12">
      <section className="tb-rise" aria-labelledby="hero-h">
        <GlassPill className="max-w-full text-left leading-snug">
          <AnimatedShinyText className="mx-0">
            {site.course} · เว็บไซต์เพื่อการเรียนรู้และ Simulation
          </AnimatedShinyText>
        </GlassPill>
        <h1
          id="hero-h"
          className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          {site.name}
        </h1>
        <p className="mt-1 font-display text-xl text-primary sm:mt-2 sm:text-3xl">{site.tagline}</p>
        <p className="mt-2 max-w-[60ch] text-ink/80 sm:mt-3 sm:text-lg">
          เลือกหัวข้อที่อยากเรียน ทุกกระบวนการกดดูทีละขั้นได้เอง ย้อนกลับได้
          และลองใส่ค่าของตัวเองได้ทุกหน้า
        </p>
      </section>

      <section className="mt-6 sm:mt-10" aria-labelledby="lessons-h">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 id="lessons-h" className="font-display text-2xl font-semibold sm:text-3xl">
            เลือกหัวข้อเรียน
          </h2>
          <p className="text-sm text-muted">เรียงตามตำรา Patterson &amp; Hennessy บทที่ 3</p>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LESSONS.map((t, i) => (
            <li key={t.id}>
              <BlurFade delay={0.05 * i} className="h-full">
                <TopicCard topic={t} />
              </BlurFade>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 sm:mt-14" aria-labelledby="sim-h">
        <h2 id="sim-h" className="font-display text-2xl font-semibold sm:text-3xl">
          ทดลองด้วย Simulator
        </h2>
        <ul className="mt-4 grid gap-4">
          {SIMULATORS.map((t) => (
            <li key={t.id}>
              <BlurFade delay={0.15} inView className="h-full">
                <TopicCard topic={t} wide />
              </BlurFade>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 sm:mt-14" aria-labelledby="howto-h">
        <h2 id="howto-h" className="font-display text-xl font-semibold sm:text-2xl">
          วิธีใช้เว็บนี้
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {HOW_TO.map((h, i) => (
            <li
              key={h.title}
              className="glass flex gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <h.icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">
                  <span className="num mr-1 font-mono text-sm text-muted">{i + 1}.</span>
                  {h.title}
                </span>
                <span className="mt-0.5 block text-sm text-ink/80">{h.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
