import type { Metadata } from 'next';
import { FpSimulator } from '@/components/tools/fp-simulator';
import { ToolBoundary } from '@/components/tools/tool-boundary';
import { ALL_OP_EXAMPLES } from '@/content/examples';

export const metadata: Metadata = { title: 'Lab' };

export default function LabPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold">Lab</h1>
      <div className="mt-6">
        <ToolBoundary>
          <FpSimulator
            ops={['+', '-', '*', '/']}
            initial={{ op: '*', a: '6.5', b: '2.75' }}
            examples={ALL_OP_EXAMPLES}
            specials
          />
        </ToolBoundary>
      </div>
    </div>
  );
}
