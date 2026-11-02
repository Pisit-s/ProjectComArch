import { describe, expect, it } from 'vitest';
import { BLOCK_IDS, WIRE_IDS } from '@/lib/lesson/circuit-map';
import { BLOCKS, CIRCUIT_VIEWBOX, WIRES } from '@/content/lesson/circuit';

describe('circuit layout (Chapter 6)', () => {
  it('draws every block and wire that circuit-map can light, exactly once', () => {
    expect(BLOCKS.map((b) => b.id).sort()).toEqual([...BLOCK_IDS].sort());
    expect(WIRES.map((w) => w.id).sort()).toEqual([...WIRE_IDS].sort());
  });
  it('stays inside the viewBox and blocks do not overlap', () => {
    for (const b of BLOCKS) {
      expect(b.x >= 0 && b.y >= 0).toBe(true);
      expect(b.x + b.w <= CIRCUIT_VIEWBOX.w && b.y + b.h <= CIRCUIT_VIEWBOX.h).toBe(true);
    }
    for (const w of WIRES)
      for (const [x, y] of w.points)
        expect(x >= 0 && x <= CIRCUIT_VIEWBOX.w && y >= 0 && y <= CIRCUIT_VIEWBOX.h).toBe(true);
    for (const a of BLOCKS)
      for (const b of BLOCKS) {
        if (a === b) continue;
        const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
        expect(apart, `${a.id} / ${b.id}`).toBe(true);
      }
  });
});

describe('block details (tap a block)', () => {
  it('every block has details and every listed wire really touches that block', async () => {
    const { BLOCK_DETAILS } = await import('@/content/lesson/circuit-details');
    const byId = new Map(WIRES.map((w) => [w.id, w]));
    const wrong: string[] = [];
    for (const id of BLOCK_IDS) {
      const d = BLOCK_DETAILS[id];
      expect(d.what.length, id).toBeGreaterThan(0);
      for (const r of d.inputs)
        if (r.wire && byId.get(r.wire)?.to !== id) wrong.push(`${id} in ${r.name} (${r.wire})`);
      for (const r of d.outputs)
        if (r.wire && byId.get(r.wire)?.from !== id) wrong.push(`${id} out ${r.name} (${r.wire})`);
    }
    expect(wrong).toEqual([]);
  });
});
