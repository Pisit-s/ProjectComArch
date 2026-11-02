import { decode } from './decode';
import type { FloatFormat } from './format';
import { absR, floor, rat } from './rational';

/**
 * What C's printf("%.Nf", x) prints for a stored float: the exact binary value rounded to N
 * decimal places, ties to even (glibc behaviour in the default rounding mode). %f is N = 6.
 * Never goes through Number.toFixed.
 */
export function printfFixed(fmt: FloatFormat, bits: bigint, decimals = 6): string {
  const d = decode(fmt, bits);
  if (d.cls === 'nan') return d.sign ? '-nan' : 'nan';
  if (d.cls === 'infinity') return d.sign ? '-inf' : 'inf';
  const x = absR(d.value!);
  const scale = 10n ** BigInt(decimals);
  const scaled = rat(x.num * scale, x.den);
  let q = floor(scaled);
  const twiceRem = 2n * (scaled.num - q * scaled.den);
  if (twiceRem > scaled.den || (twiceRem === scaled.den && q % 2n === 1n)) q += 1n;
  const digits = q.toString().padStart(decimals + 1, '0');
  const body =
    decimals === 0
      ? digits
      : `${digits.slice(0, digits.length - decimals)}.${digits.slice(-decimals)}`;
  return (d.sign ? '-' : '') + body;
}
