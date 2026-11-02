'use client';

import type { ReactNode } from 'react';
import { BINARY32, simulate } from '@/lib/fp';
import { chooseWindow } from '@/lib/lesson/bit-window';
import { buildFpFrames, type FpScene } from '@/lib/lesson/fp-frames';
import { buildRoundLine } from '@/lib/lesson/round-line';
import { caption, detail } from '@/content/lesson/captions';
import { MAIN, ROUND_MAIN, type FpExample } from '@/content/lesson/examples';
import { StepPlayer } from '@/components/player/step-player';
import { BitTrack } from '@/components/stage/bit-track';
import { CarryArc } from '@/components/stage/carry-arc';
import { ExponentTag } from '@/components/stage/exponent-tag';
import { FieldBrackets } from '@/components/stage/field-brackets';
import { MiniAlu } from '@/components/stage/mini-alu';
import { Register32 } from '@/components/stage/register32';
import { RoundLine } from '@/components/stage/round-line';
import { StepBar } from '@/components/stage/step-bar';
import { StickyBucket } from '@/components/stage/sticky-bucket';
import { HwAlu, HwBox, HwMux, HwRegister, HwWire } from '@/components/hw/primitives';

function sceneOf(ex: FpExample): FpScene {
  const sim = simulate(BINARY32, ex.op, ex.a, ex.b);
  if (!sim.ok) throw new Error('bad example');
  return buildFpFrames(BINARY32, sim);
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-solid space-y-3 rounded-2xl p-4 ring-1 ring-foreground/5">
      <h2 className="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function TrackPlayer({ ex, testId }: { ex: FpExample; testId: string }) {
  const sc = sceneOf(ex);
  const win = chooseWindow(sc);
  const steps = sc.frames.map((f) => ({
    id: f.id,
    title: f.id,
    caption: caption(f.captionKey, f.params),
    detail: f.detailKey ? detail(f.detailKey) : undefined,
    bigStep: f.bigStep,
  }));
  return (
    <StepPlayer
      steps={steps}
      label={`${ex.a} ${ex.op} ${ex.b}`}
      stepBar
      testId={testId}
      minHeight="14rem"
      render={(i) => {
        const f = sc.frames[i];
        const moving = f.rows.findIndex((r) => r.shifted > 0 && r.key !== 'R');
        return (
          <BitTrack
            rows={f.rows}
            fracBits={sc.fracBits}
            window={win}
            focusRow={f.stage === 'align' || f.stage === 'alignFast' ? moving : undefined}
            bucket={f.stage === 'align' || f.stage === 'alignFast'}
            lens={f.decision ? { row: 0, decision: f.decision } : undefined}
          />
        );
      }}
    />
  );
}

export function Kit() {
  const round = (() => {
    const sim = simulate(BINARY32, ROUND_MAIN.op, ROUND_MAIN.a, ROUND_MAIN.b);
    if (!sim.ok) throw new Error('bad example');
    const rd = sim.result.steps.find((s) => s.kind === 'round');
    if (!rd || rd.kind !== 'round') throw new Error('no round step');
    return { line: buildRoundLine(BINARY32, rd, sim.result.exact!, 0), bits: sim.result.bits };
  })();

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8" data-testid="dev-kit">
      <h1 className="font-display text-2xl font-semibold">kit</h1>
      <Block title="StepBar">
        {[0, 1, 2, 3, 4].map((n) => (
          <StepBar key={n} active={n} />
        ))}
      </Block>
      <Block title="BitTrack + StepPlayer (compact)">
        <TrackPlayer ex={MAIN} testId="kit-main" />
      </Block>
      <Block title="BitTrack + GrsLens (tail)">
        <TrackPlayer ex={ROUND_MAIN} testId="kit-round" />
      </Block>
      <Block title="RoundLine">
        {([0, 1, 2, 3] as const).map((s) => (
          <RoundLine key={s} line={round.line} stage={s} downLabel="down" upLabel="up" />
        ))}
      </Block>
      <Block title="Register32 + FieldBrackets">
        <Register32 bits={round.bits} name="kit-reg" />
        <FieldBrackets
          groups={[
            { span: 1, kind: 'sign', label: 's' },
            { span: 8, kind: 'exp' },
            { span: 23, kind: 'frac' },
          ]}
        />
      </Block>
      <Block title="MiniAlu · CarryArc · StickyBucket · ExponentTag">
        <div className="flex flex-wrap items-end gap-6">
          <MiniAlu binvert={0} carryIn={0} />
          <MiniAlu binvert={1} carryIn={1} active />
          <CarryArc />
          <span className="w-8">
            <StickyBucket sticky={0} />
          </span>
          <span className="w-8">
            <StickyBucket sticky={1} />
          </span>
          <ExponentTag exp={-3} className="text-xl" />
        </div>
      </Block>
      <Block title="hw primitives">
        <svg viewBox="0 0 360 260" className="w-full max-w-md">
          <HwRegister id="regA" x={10} y={10} w={150} h={28} label="A" active />
          <HwRegister id="regB" x={200} y={10} w={150} h={28} label="B" />
          <HwWire
            id="w1"
            kind="exp"
            active
            chip="2"
            points={[
              [40, 38],
              [40, 70],
              [100, 70],
              [100, 90],
            ]}
          />
          <HwWire
            id="w2"
            kind="sig"
            points={[
              [300, 38],
              [300, 130],
            ]}
          />
          <HwAlu id="smallAlu" x={60} y={90} w={90} h={50} label="Small ALU" active />
          <HwMux id="mux" x={250} y={130} w={90} h={26} label="MUX" />
          <HwWire
            id="w3"
            kind="ctl"
            active
            points={[
              [150, 115],
              [250, 143],
            ]}
          />
          <HwBox id="shift" x={240} y={190} w={110} h={34} label="Shift right" />
          <HwBox id="control" x={60} y={190} w={110} h={34} label="Control" selected />
        </svg>
      </Block>
    </div>
  );
}
