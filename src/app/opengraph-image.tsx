import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { BINARY32, encodeBits, splitFields } from '@/lib/fp';
import { site } from '@/lib/site';

export const alt = `${site.name} · ${site.ogSubtitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const font = (file: string) =>
  readFile(join(process.cwd(), 'node_modules/@fontsource/chakra-petch/files', file));

/** Shared in LINE: needs a Thai font, otherwise Thai text renders as boxes. */
export default async function OpengraphImage() {
  const [latin, thai] = await Promise.all([
    font('chakra-petch-latin-600-normal.woff'),
    font('chakra-petch-thai-600-normal.woff'),
  ]);
  const f = splitFields(BINARY32, encodeBits(BINARY32, '0.1')!);
  const cell = (bit: string, color: string, i: number) => (
    <div
      key={i}
      style={{
        width: 27,
        height: 46,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `4px solid ${color}`,
        background: bit === '1' ? `${color}24` : `${color}10`,
        color,
        fontSize: 26,
        borderRadius: 6,
      }}
    >
      {bit}
    </div>
  );
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 72,
        background: 'linear-gradient(180deg, #F5FAFF 0%, #ECF5FF 60%, #FFFFFF 100%)',
        fontFamily: 'Chakra Petch',
        color: '#0B1B4D',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            width: 96,
            height: 112,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#2563EB',
            borderRadius: 24,
          }}
        >
          <div
            style={{
              width: 76,
              height: 92,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: '#FFFFFF',
              borderRadius: 14,
            }}
          >
            <div style={{ width: 11, height: 62, background: '#D55E00', borderRadius: 4 }} />
            <div style={{ width: 21, height: 62, background: '#009E73', borderRadius: 4 }} />
            <div style={{ width: 21, height: 62, background: '#2563EB', borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ fontSize: 104, marginLeft: 12 }}>{site.name}</div>
      </div>
      <div style={{ fontSize: 44, marginTop: 18, color: '#2563EB' }}>{site.ogSubtitle}</div>
      <div style={{ display: 'flex', gap: 3, marginTop: 48 }}>
        {[...f.sign].map((b, i) => cell(b, '#D55E00', i))}
        <div style={{ width: 8 }} />
        {[...f.exp].map((b, i) => cell(b, '#009E73', i + 1))}
        <div style={{ width: 8 }} />
        {[...f.frac].map((b, i) => cell(b, '#2563EB', i + 9))}
      </div>
      <div style={{ fontSize: 30, marginTop: 28, color: '#54648A' }}>{site.tagline}</div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Chakra Petch', data: latin, weight: 600, style: 'normal' },
        { name: 'Chakra Petch', data: thai, weight: 600, style: 'normal' },
      ],
    },
  );
}
