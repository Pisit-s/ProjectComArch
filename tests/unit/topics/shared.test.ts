import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatBitValue } from '@/components/bits/bit-format';
import { FIELD_STYLE } from '@/components/bits/field-style';
import { HW_ROLE_COLOR } from '@/components/hw/colors';
import { GLOSSARY, GLOSSARY_PARTS } from '@/content/glossary';
import { MIPS_EXAMPLE_IDS } from '@/content/mips-example-ids';

const root = process.cwd();

describe('glossary', () => {
  it('keys are unique across topic files', () => {
    const keys = Object.values(GLOSSARY_PARTS).flatMap((p) => Object.keys(p));
    expect(new Set(keys).size).toBe(keys.length);
    expect(Object.keys(GLOSSARY).length).toBe(keys.length);
  });

  it('every entry has a term and a meaning', () => {
    for (const [k, g] of Object.entries(GLOSSARY)) {
      expect(g.term, k).not.toBe('');
      expect(g.meaning, k).not.toBe('');
    }
  });
});

describe('MIPS example ids', () => {
  it('match the checked programs in docs/plans/golden/mips', () => {
    const files = readdirSync(join(root, 'docs/plans/golden/mips'))
      .filter((f) => f.endsWith('.s'))
      .map((f) => f.slice(0, -2))
      .sort();
    expect([...MIPS_EXAMPLE_IDS].sort()).toEqual(files);
  });
});

describe('colour tokens', () => {
  const css = readFileSync(join(root, 'src/app/globals.css'), 'utf8');
  const token = (name: string) =>
    new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i').exec(css)?.[1]?.toLowerCase();

  it('hardware colours mirror globals.css', () => {
    for (const [role, c] of Object.entries(HW_ROLE_COLOR)) {
      if (role === 'neutral') continue;
      expect(token(role), role).toBe(c.main);
      expect(token(`${role}-ink`), `${role}-ink`).toBe(c.ink);
    }
  });

  it('every FieldKind colour exists as a token', () => {
    for (const [kind, s] of Object.entries(FIELD_STYLE)) {
      const name = /^text-(.+)$/.exec(s.text)?.[1];
      if (!name || name === 'ink') continue;
      expect(token(name), kind).toMatch(/^#/);
    }
  });
});

describe('formatBitValue', () => {
  it('reads unsigned, signed and hex', () => {
    expect(formatBitValue(0b1101n, 4, 'unsigned')).toBe('13');
    expect(formatBitValue(0b1101n, 4, 'signed')).toBe('-3');
    expect(formatBitValue(0b0101n, 4, 'signed')).toBe('5');
    expect(formatBitValue(0xabn, 8, 'hex')).toBe('0xAB');
    expect(formatBitValue(0x1ffn, 8, 'unsigned')).toBe('255');
    expect(formatBitValue(0xfn, 12, 'hex')).toBe('0x00F');
  });
});
