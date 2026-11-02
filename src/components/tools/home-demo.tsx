'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { StepPlayer } from '@/components/player/step-player';
import { Num } from '@/components/ui/num';
import { StepView } from '@/components/viz/step-view';
import { toPlayerSteps } from '@/content/step-text';
import { fmt } from '@/lib/display';
import { BINARY32, shortestDecimal, simulate } from '@/lib/fp';

/** 0.1 + 0.2 plays slowly on its own; any hover, tap or focus pauses it. */
export function HomeDemo() {
  const sim = useMemo(() => simulate(BINARY32, '+', '0.1', '0.2'), []);
  if (!sim.ok) return null;
  const steps = sim.result.steps;
  return (
    <div className="space-y-3">
      <StepPlayer
        steps={toPlayerSteps(steps, '+')}
        label="ตัวอย่างสด: 0.1 + 0.2 ใน Single Precision"
        render={(i) => <StepView step={steps[i]} op="+" />}
        autoPlay
        compact
        minHeight="15rem"
        testId="home-demo"
        className="glass-raised"
      />
      <p className="text-sm">
        ผลแม่นยำคือ 0.3 แต่ float ได้{' '}
        <Num value={shortestDecimal(BINARY32, sim.result.bits)} className="font-bold" /> (เก็บจริง{' '}
        <Num value={fmt(sim.stored)} />) ·{' '}
        <Link
          href="/floating-point/add-sub"
          className="inline-flex link items-center gap-1 link-primary"
        >
          ดูว่าทำไมในบทที่ 4 <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </p>
    </div>
  );
}
