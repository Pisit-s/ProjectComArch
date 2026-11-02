import { ARITH_GLOSSARY } from './arith';
import { DIVIDE_GLOSSARY } from './divide';
import { FP_GLOSSARY } from './fp';
import { MIPS_GLOSSARY } from './mips';
import { MULTIPLY_GLOSSARY } from './multiply';

/**
 * Every term on the site, one file per topic (PLAN.md 6.3). `Term` shows the meaning on tap.
 * Each WP fills only its own file; keys must stay unique across files
 * (`tests/unit/topics/glossary.test.ts`).
 */
export const GLOSSARY = {
  ...FP_GLOSSARY,
  ...ARITH_GLOSSARY,
  ...MULTIPLY_GLOSSARY,
  ...DIVIDE_GLOSSARY,
  ...MIPS_GLOSSARY,
} as const;

export type TermKey = keyof typeof GLOSSARY;

export const GLOSSARY_PARTS = {
  fp: FP_GLOSSARY,
  arith: ARITH_GLOSSARY,
  multiply: MULTIPLY_GLOSSARY,
  divide: DIVIDE_GLOSSARY,
  mips: MIPS_GLOSSARY,
} as const;
