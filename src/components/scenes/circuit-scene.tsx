'use client';

import { hwCaption } from '@/lib/lesson/circuit-map';
import type { FpScene } from '@/lib/lesson/fp-frames';
import { caption, detail } from '@/content/lesson/captions';
import { CIRCUIT_EXAMPLES, MAIN } from '@/content/lesson/examples';
import { sectionById } from '@/content/lesson/sections';
import type { PlayerStep } from '@/components/player/step-player';
import { FpAdderDiagram } from '@/components/hw/fp-adder-diagram';
import { FpFrameView, FpOpScene } from './fp-op-scene';

/** Circuit wording of every frame; the last frame explains why hardware takes several cycles. */
export function circuitSteps(scene: FpScene): PlayerStep[] {
  return scene.frames.map((f, i) => {
    const c = hwCaption(f);
    return {
      id: f.id,
      title: f.id,
      caption: caption(c.key, c.params),
      detail: i === scene.frames.length - 1 ? detail('why.cycles') : undefined,
      bigStep: f.bigStep,
    };
  });
}

/** One frame on the circuit; desktop also shows the bit track of the same frame beside it. */
export function CircuitFrame({
  scene,
  index,
  testId,
}: {
  scene: FpScene;
  index: number;
  testId: string;
}) {
  const f = scene.frames[index];
  const c = hwCaption(f);
  return (
    // the circuit lays itself out (diagram + bit track side by side): keep it as it is when presenting
    <div
      data-present-keep
      className="circuit-frame grid items-start gap-4 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]"
    >
      <FpAdderDiagram frame={f} summary={caption(c.key, c.params)} testId={`${testId}-diagram`} />
      {/* the bit track beside the circuit only where both fit side by side */}
      <div className="circuit-side hidden min-w-0 xl:block" aria-hidden>
        <FpFrameView scene={scene} index={index} full={false} compact testId={`${testId}-side`} />
      </div>
    </div>
  );
}

/** Scene 6.1: the same frames as Chapter 5, drawn as data flowing through the adder. */
export function CircuitScene() {
  const title = sectionById('circuit')?.scenes[0]?.title ?? 'circuit';
  return (
    <FpOpScene
      initial={MAIN}
      examples={CIRCUIT_EXAMPLES}
      testId="circuit"
      label={title}
      stepsOf={circuitSteps}
      showFull={false}
      minHeight="30rem"
      renderFrame={(scene, i) => <CircuitFrame scene={scene} index={i} testId="circuit" />}
    />
  );
}
