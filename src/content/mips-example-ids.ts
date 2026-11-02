/**
 * Ids of the example programs WP-1 must ship in the MIPS Simulator (PLAN.md 6.2). The checked
 * sources live in `docs/plans/golden/mips/<id>.s`. `OpenInSim` links to `/mips?example=<id>`.
 */
export const MIPS_EXAMPLE_IDS = [
  'hello',
  'sum-loop',
  'array-sum',
  'max',
  'factorial',
  'mult-div',
  'div-signs',
  'endian',
  'overflow',
  'io',
  'shift-add-multiply',
  'restoring-divide',
] as const;

export type MipsExampleId = (typeof MIPS_EXAMPLE_IDS)[number];
