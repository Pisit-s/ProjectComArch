import { type Rational, rat } from './rational';

export const MAX_INPUT_LENGTH = 200;
export const MAX_DECIMAL_EXPONENT = 100_000;

export type ParseError =
  | { kind: 'empty' }
  | { kind: 'comma' }
  | { kind: 'too-long'; max: number }
  | { kind: 'exponent-range'; max: number }
  | { kind: 'invalid' };

export type ParsedNumber =
  | { ok: true; kind: 'finite'; negative: boolean; magnitude: Rational }
  | { ok: true; kind: 'inf'; negative: boolean }
  | { ok: true; kind: 'nan'; negative: boolean };

export type ParseResult = ParsedNumber | { ok: false; error: ParseError };

const SPECIAL = /^([+-]?)(?:(inf|infinity|∞)|(nan))$/i;
const DECIMAL = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i;

/**
 * Exact decimal parser. Accepts "[+-]digits[.digits][e[+-]digits]", ".5", "5.",
 * "inf", "infinity", "∞", "nan" (case-insensitive) and the Unicode minus sign.
 * The value is returned as an exact rational magnitude plus a sign flag so "-0" is kept.
 */
export function parseDecimal(text: string): ParseResult {
  const s = text.trim().replace(/−/g, '-');
  if (s === '') return { ok: false, error: { kind: 'empty' } };
  if (s.length > MAX_INPUT_LENGTH) {
    return { ok: false, error: { kind: 'too-long', max: MAX_INPUT_LENGTH } };
  }
  if (s.includes(',')) return { ok: false, error: { kind: 'comma' } };

  const sp = SPECIAL.exec(s);
  if (sp) {
    const negative = sp[1] === '-';
    return sp[2] ? { ok: true, kind: 'inf', negative } : { ok: true, kind: 'nan', negative };
  }

  const m = DECIMAL.exec(s);
  if (!m) return { ok: false, error: { kind: 'invalid' } };
  const [, signStr, intDigits = '', fracDigits = '', expStr] = m;
  if (intDigits === '' && fracDigits === '') return { ok: false, error: { kind: 'invalid' } };

  let exp10 = 0;
  if (expStr !== undefined) {
    const digits = expStr.replace(/^[+-]/, '').replace(/^0+/, '');
    if (
      digits.length > 6 ||
      Number(expStr) > MAX_DECIMAL_EXPONENT ||
      Number(expStr) < -MAX_DECIMAL_EXPONENT
    ) {
      return { ok: false, error: { kind: 'exponent-range', max: MAX_DECIMAL_EXPONENT } };
    }
    exp10 = Number(expStr);
  }

  const mantissa = BigInt((intDigits + fracDigits).replace(/^0+(?=\d)/, '') || '0');
  const shift = exp10 - fracDigits.length;
  const magnitude =
    shift >= 0 ? rat(mantissa * 10n ** BigInt(shift)) : rat(mantissa, 10n ** BigInt(-shift));
  return { ok: true, kind: 'finite', negative: signStr === '-', magnitude };
}
