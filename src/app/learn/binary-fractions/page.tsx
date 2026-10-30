import type { Metadata } from 'next';
import { Callout, Formula } from '@/components/content/callout';
import { Term } from '@/components/content/term';
import { ChapterLayout, Section, Summary } from '@/components/layout/chapter-layout';
import {
  BinaryFractionDemo,
  FractionConverter,
  FractionExplorer,
} from '@/components/tools/fraction-tools';
import { ToolBoundary } from '@/components/tools/tool-boundary';
import { Pow } from '@/components/ui/num';
import { chapterBySlug } from '@/content/chapters';
import { R, convertFraction, formatRational } from '@/lib/fp';

const ch = chapterBySlug('binary-fractions');
export const metadata: Metadata = { title: `บทที่ 2 ${ch.title}`, description: ch.blurb };

const TOC = [
  { id: 'decimal', title: 'ค่าประจำหลักหลังจุดฐานสิบ' },
  { id: 'binary', title: 'น้ำหนักหลังจุดฐานสอง' },
  { id: 'example', title: 'ตัวอย่าง 0.101₂' },
  { id: 'explorer', title: 'Fraction Explorer 16 บิต' },
  { id: 'convert', title: 'แปลงฐานสิบเป็นฐานสองด้วยการคูณ 2' },
  { id: 'point-one', title: 'ทำไม 0.1 เก็บไม่พอดี' },
];

const plain = (r: R.Rational) => formatRational(r, { scientific: false });

export default function BinaryFractionsPage() {
  const tenth = convertFraction(R.rat(1n, 10n), 16);
  const rep = tenth.repeat!;
  const cycle = convertFraction(R.rat(1n, 10n), rep.start - 1 + rep.length).bits;
  return (
    <ChapterLayout slug="binary-fractions" toc={TOC}>
      <Section id="decimal" title="ค่าประจำหลักหลังจุดทศนิยม (ฐานสิบ)">
        <p>
          หลังจุดทศนิยม ค่าประจำหลักลดลงทีละ 10 เท่า: หลักแรกหลังจุดมีค่า <Pow base="10" exp={-1} />{' '}
          = 0.1 หลักที่สองมีค่า <Pow base="10" exp={-2} /> = 0.01 หลักที่สามมีค่า{' '}
          <Pow base="10" exp={-3} /> = 0.001
        </p>
        <Formula>
          0.375 = 3 × <Pow base="10" exp={-1} /> + 7 × <Pow base="10" exp={-2} /> + 5 ×{' '}
          <Pow base="10" exp={-3} />
        </Formula>
      </Section>

      <Section id="binary" title="น้ำหนักหลังจุดฐานสอง">
        <p>
          ฐานสองก็เหมือนกัน แต่ลดลงทีละครึ่ง บิตที่ k หลังจุดมี<Term k="weight">น้ำหนัก</Term>{' '}
          <Pow exp="−k" /> เราเขียนเศษส่วนฐานสองในรูป{' '}
          <span className="num font-mono">
            0.b<sub>1</sub>b<sub>2</sub>b<sub>3</sub>…
          </span>{' '}
          โดย b<sub>1</sub> คือบิตแรกหลังจุด
        </p>
        <div className="glass-solid scroll-x rounded-xl ring-1 ring-foreground/10" tabIndex={0}>
          <table className="table table-sm text-center">
            <thead>
              <tr>
                <th className="text-left">บิตที่</th>
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <th key={k} className="num font-mono">
                    b<sub>{k}</sub>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="num font-mono">
              <tr>
                <td className="text-left font-sans">น้ำหนัก</td>
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <td key={k}>
                    <Pow exp={-k} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="text-left font-sans">เศษส่วน</td>
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <td key={k}>1/{2 ** k}</td>
                ))}
              </tr>
              <tr>
                <td className="text-left font-sans">ทศนิยม</td>
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <td key={k} className="font-semibold">
                    {plain(R.pow2(-k))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="example" title="ตัวอย่าง: 0.101₂ เป็นฐานสิบ">
        <p>บวกน้ำหนักของบิตที่เป็น 1:</p>
        <ToolBoundary>
          <BinaryFractionDemo bits="101" />
        </ToolBoundary>
      </Section>

      <Section id="explorer" title="Fraction Explorer: เศษส่วนฐานสอง 16 บิต" wide>
        <p className="max-w-[72ch]">
          บิตหลังจุด 16 บิต น้ำหนักตั้งแต่ <Pow exp={-1} /> ถึง <Pow exp={-16} /> กดบิตเพื่อสลับ
          แล้วดูค่าฐานสิบและตำแหน่งบนเส้นจำนวน 0–1 (แตะบิตเพื่อดูน้ำหนักแบบทศนิยมเต็ม)
        </p>
        <ToolBoundary>
          <FractionExplorer />
        </ToolBoundary>
      </Section>

      <Section id="convert" title="แปลงเศษส่วนฐานสิบเป็นฐานสองด้วยการคูณ 2" wide>
        <div className="max-w-[72ch] space-y-3">
          <p>วิธีที่ใช้กันคือคูณด้วย 2 ซ้ำ ๆ:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>เอาเศษส่วนคูณ 2</li>
            <li>ส่วนจำนวนเต็มที่ได้ (0 หรือ 1) คือบิตถัดไปหลังจุด</li>
            <li>เอาเฉพาะส่วนเศษไปทำข้อ 1 ต่อ จนเศษเป็น 0 หรือได้บิตครบตามที่ต้องการ</li>
          </ol>
          <p>
            เหตุผล: การคูณ 2 เลื่อนจุดฐานสองไปทางขวาหนึ่งตำแหน่ง
            บิตแรกหลังจุดจึงโผล่มาอยู่หน้าจุดให้เราอ่านได้
          </p>
        </div>
        <ToolBoundary>
          <FractionConverter />
        </ToolBoundary>
      </Section>

      <Section id="point-one" title="ทำไม 0.1 เก็บไม่พอดี">
        <p>
          ลองแปลง 0.1 ด้วยเครื่องมือข้างบน จะเห็นว่าเศษวนกลับมาเป็นค่าเดิม (0.2 → 0.4 → 0.8 → 0.6 →
          0.2 → …) จึงไม่มีวันเป็น 0 บิตชุด{' '}
          <span className="num border-t-2 border-bit-grs font-mono">
            {cycle.slice(rep.start - 1)}
          </span>{' '}
          ซ้ำไปเรื่อย ๆ ตั้งแต่บิตที่ {rep.start}
        </p>
        <Formula>
          0.1<sub>10</sub> = 0.{cycle.slice(0, rep.start - 1)}
          <span className="border-t-2 border-bit-grs">{cycle.slice(rep.start - 1)}</span>
          <sub>2</sub> (ซ้ำไม่รู้จบ)
        </Formula>
        <p>
          คอมพิวเตอร์มีบิตจำกัด จึงต้องตัดที่จำนวนบิตหนึ่งแล้วได้แค่ <b>ค่าประมาณ</b> เช่นเก็บ 16
          บิตได้ <span className="num font-mono">{plain(tenth.approx)}</span> ต่างจาก 0.1 อยู่{' '}
          <span className="num font-mono">{plain(tenth.error)}</span>
        </p>
        <Callout tone="warn" title="ใช้ได้กับเศษส่วนแบบไหน">
          <p>
            เศษส่วนฐานสิบจะแปลงเป็นฐานสองได้พอดีก็ต่อเมื่อเขียนเป็นเศษส่วนที่ตัวส่วนเป็น 2
            ยกกำลังได้ เช่น 0.375 = 3/8 · ส่วน 0.1 = 1/10 มีตัวประกอบ 5 อยู่ในตัวส่วน
            จึงซ้ำไม่รู้จบเสมอ
          </p>
        </Callout>
      </Section>

      <Summary
        points={[
          <>
            หลังจุดฐานสิบ ค่าประจำหลักเป็น <Pow base="10" exp={-1} />, <Pow base="10" exp={-2} />, …
            ส่วนหลังจุดฐานสองเป็น <Pow exp={-1} />, <Pow exp={-2} />, … (0.5, 0.25, 0.125, …)
          </>,
          <>ค่าของ 0.b₁b₂b₃…₂ = ผลรวมน้ำหนักของบิตที่เป็น 1 เช่น 0.101₂ = 0.5 + 0.125 = 0.625</>,
          <>แปลงฐานสิบเป็นฐานสองด้วยการคูณ 2 ซ้ำ ส่วนจำนวนเต็มที่ได้แต่ละรอบคือบิตถัดไป</>,
          <>
            บางค่า เช่น 0.1 ในฐานสองซ้ำไม่รู้จบ เมื่อมีบิตจำกัดจึงเก็บได้แค่ค่าประมาณ
            และมีความคลาดเคลื่อนเล็ก ๆ เสมอ
          </>,
        ]}
      />
    </ChapterLayout>
  );
}
