export type BitRowValue = 'unsigned' | 'signed' | 'hex' | false;

export const mask = (w: number) => (1n << BigInt(w)) - 1n;

/** The value of `value` read as unsigned, two's complement or hex, for the label beside the row. */
export function formatBitValue(value: bigint, width: number, how: Exclude<BitRowValue, false>) {
  const v = value & mask(width);
  if (how === 'hex')
    return `0x${v
      .toString(16)
      .toUpperCase()
      .padStart(Math.ceil(width / 4), '0')}`;
  if (how === 'signed' && width > 0 && v >> BigInt(width - 1) === 1n)
    return (v - (1n << BigInt(width))).toString();
  return v.toString();
}
