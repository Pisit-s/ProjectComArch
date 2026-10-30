import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/** Three blocks: Sign, Exponent, Fraction (same as the header logo). */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        padding: 8,
        background: '#ECF5FF',
        borderRadius: 14,
      }}
    >
      <div style={{ width: 9, height: 40, background: '#D55E00', borderRadius: 3 }} />
      <div style={{ width: 16, height: 40, background: '#009E73', borderRadius: 3 }} />
      <div style={{ width: 19, height: 40, background: '#2563EB', borderRadius: 3 }} />
    </div>,
    size,
  );
}
