import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

const BLUE = '#2563EB';

/** Same chip as the header logo: blue frame with pins, three Floating-Point bars inside. */
export default function Icon() {
  const pins = (side: 'left' | 'right') => (
    <div
      style={{
        position: 'absolute',
        top: 18,
        [side]: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 8, height: 5, background: BLUE, borderRadius: 2 }} />
      ))}
    </div>
  );
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {pins('left')}
      {pins('right')}
      <div
        style={{
          width: 50,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BLUE,
          borderRadius: 13,
        }}
      >
        <div
          style={{
            width: 40,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            background: '#FFFFFF',
            borderRadius: 8,
          }}
        >
          <div style={{ width: 6, height: 34, background: '#D55E00', borderRadius: 2 }} />
          <div style={{ width: 11, height: 34, background: '#009E73', borderRadius: 2 }} />
          <div style={{ width: 11, height: 34, background: BLUE, borderRadius: 2 }} />
        </div>
      </div>
    </div>,
    size,
  );
}
