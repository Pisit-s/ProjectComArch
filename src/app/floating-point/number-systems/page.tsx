import type { Metadata } from 'next';
import { Callout, Formula } from '@/components/content/callout';
import { Term } from '@/components/content/term';
import { ChapterLayout, Section, Summary } from '@/components/layout/chapter-layout';
import {
  BinaryToDecimalDemo,
  IntegerExplorer,
  PlaceValueDemo,
} from '@/components/tools/integer-tools';
import { ToolBoundary } from '@/components/tools/tool-boundary';
import { Base, Pow } from '@/components/ui/num';
import { chapterBySlug } from '@/content/chapters';
import { uintMax, uintTerms, uintToBits, uintValue } from '@/lib/fp';

const ch = chapterBySlug('number-systems');
export const metadata: Metadata = { title: `บทที่ 1 ${ch.title}`, description: ch.blurb };

const TOC = [
  { id: 'decimal', title: 'ระบบเลขฐานสิบ' },
  { id: 'binary', title: 'เลขฐานสองใช้แค่ 0 กับ 1' },
  { id: 'weights', title: 'น้ำหนักของแต่ละบิต' },
  { id: 'example', title: 'ตัวอย่าง 1011₂' },
  { id: 'range', title: 'ช่วงค่าของ 8 บิต' },
  { id: 'explorer', title: 'ลองกดบิตเอง' },
];

export default function NumberSystemsPage() {
  return (
    <ChapterLayout slug="number-systems" toc={TOC}>
      <Section id="decimal" title="ระบบเลขฐานสิบและค่าประจำหลัก">
        <p>
          ตัวเลขที่เราใช้ทุกวันเป็นระบบเลขฐานสิบ (Base 10) มีเลขโดด 10 ตัวคือ 0 ถึง 9 และแต่ละหลักมี{' '}
          <Term k="place" /> ไม่เท่ากัน หลักหน่วยมีค่า 1 หลักสิบมีค่า 10 หลักร้อยมีค่า 100
          ทุกครั้งที่ขยับไปทางซ้ายหนึ่งหลัก ค่าประจำหลักจะคูณ 10
        </p>
        <Formula>
          345 = 3 × <Pow base="10" exp={2} /> + 4 × <Pow base="10" exp={1} /> + 5 ×{' '}
          <Pow base="10" exp={0} />
        </Formula>
        <p>กดปุ่มด้านล่างเพื่อดูการแยกเลข 345 ทีละขั้น (ใช้ปุ่มลูกศรบนคีย์บอร์ดก็ได้)</p>
        <ToolBoundary>
          <PlaceValueDemo />
        </ToolBoundary>
      </Section>

      <Section id="binary" title="เลขฐานสองใช้แค่ 0 กับ 1">
        <p>
          คอมพิวเตอร์เก็บข้อมูลด้วยวงจรที่มีแค่ 2 สถานะ (มีไฟ / ไม่มีไฟ) จึงใช้ระบบเลขฐานสอง (Base
          2) ซึ่งมีเลขโดดแค่ 0 และ 1 หลักแต่ละหลักของเลขฐานสองเรียกว่า <Term k="bit" />
        </p>
        <p>
          หลักการเหมือนฐานสิบทุกอย่าง ต่างกันตรงที่ขยับไปทางซ้ายหนึ่งหลัก ค่าประจำหลักจะคูณ <b>2</b>{' '}
          แทนที่จะคูณ 10 เพื่อไม่ให้สับสน เราเขียนฐานไว้ข้างล่าง เช่น <Base>1011</Base> คือเลขฐานสอง
          ส่วน 1011<sub>10</sub> คือหนึ่งพันสิบเอ็ด
        </p>
      </Section>

      <Section id="weights" title="น้ำหนักของแต่ละบิต">
        <p>
          ค่าประจำหลักของบิตเรียกว่า <Term k="weight" /> นับตำแหน่งจากขวาสุดเป็นตำแหน่งที่ 0
          บิตตำแหน่งที่ k มีน้ำหนัก <Pow exp="k" />
        </p>
        <div className="glass-solid scroll-x rounded-xl ring-1 ring-foreground/10" tabIndex={0}>
          <table className="table table-sm text-center">
            <thead>
              <tr>
                <th className="text-left">ตำแหน่ง</th>
                {[7, 6, 5, 4, 3, 2, 1, 0].map((k) => (
                  <th key={k} className="num font-mono">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="num font-mono">
              <tr>
                <td className="text-left font-sans">น้ำหนัก</td>
                {[7, 6, 5, 4, 3, 2, 1, 0].map((k) => (
                  <td key={k}>
                    <Pow exp={k} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="text-left font-sans">ค่า</td>
                {[7, 6, 5, 4, 3, 2, 1, 0].map((k) => (
                  <td key={k} className="font-semibold">
                    {2 ** k}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          ค่าฐานสิบของเลขฐานสองจึงเท่ากับผลรวมของน้ำหนักทุกบิตที่เป็น 1 (บิตที่เป็น 0 ไม่เพิ่มอะไร)
        </p>
      </Section>

      <Section id="example" title="ตัวอย่าง: แปลง 1011₂ เป็นฐานสิบ">
        <p>ไล่ทีละบิตที่เป็น 1 แล้วบวกน้ำหนักเข้าไปทีละตัว:</p>
        <ToolBoundary>
          <BinaryToDecimalDemo bits="1011" />
        </ToolBoundary>
        <Formula>
          <Base>1011</Base> = 1×8 + 0×4 + 1×2 + 1×1 = 11
        </Formula>
        <p>ตัวอย่างเพิ่มเติม (คิดแบบเดียวกัน: รวมน้ำหนักของบิตที่เป็น 1):</p>
        <ul className="space-y-1" data-testid="more-int-examples">
          {['101', '11010', '10000000', '01111111'].map((b) => (
            <li key={b} className="num font-mono">
              <Base>{b}</Base> ={' '}
              {uintTerms(b)
                .filter((t) => t.bit === 1)
                .map((t) => t.weight)
                .join(' + ')}{' '}
              = <b>{uintValue(b)}</b>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="range" title="ช่วงค่าของจำนวนเต็ม 8 บิตแบบไม่มีเครื่องหมาย">
        <p>
          ถ้าใช้ทั้ง 8 บิตเก็บขนาดของค่า (ไม่มีบิตเครื่องหมาย เรียกว่า <Term k="unsigned" />)
          จะได้ทั้งหมด <Pow exp={8} /> = 256 แบบ
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            ค่าน้อยที่สุด: <span className="num font-mono">{uintToBits(0)}</span> = 0
          </li>
          <li>
            ค่ามากที่สุด: <span className="num font-mono">{uintToBits(uintMax())}</span> ={' '}
            {uintTerms(uintToBits(uintMax()))
              .map((t) => t.weight)
              .join(' + ')}{' '}
            = {uintMax()} = <Pow exp={8} /> − 1
          </li>
        </ul>
        <Callout tone="tip">
          <p>
            n บิตเก็บจำนวนเต็มไม่มีเครื่องหมายได้ตั้งแต่ 0 ถึง <Pow exp="n" /> − 1 ·
            เลขที่ใหญ่กว่านี้ต้องใช้บิตมากขึ้น
          </p>
        </Callout>
      </Section>

      <Section id="explorer" title="Integer Explorer: ลองกดบิตเอง" wide>
        <p className="max-w-[72ch]">
          กดที่บิตเพื่อสลับ 0/1 แล้วดูว่าแต่ละบิตเพิ่มค่าเท่าไร ค่าฐานสิบเปลี่ยนทันที
          (บนคีย์บอร์ดใช้ Tab เข้ามาแล้วกดลูกศรซ้าย/ขวาย้ายบิต Space หรือ Enter เพื่อสลับ)
        </p>
        <ToolBoundary>
          <IntegerExplorer />
        </ToolBoundary>
      </Section>

      <Summary
        points={[
          <>ระบบเลขแบบค่าประจำหลัก: ค่าของตัวเลข = ผลรวมของ (เลขในหลัก × ค่าประจำหลัก)</>,
          <>
            ฐานสิบมีเลขโดด 0–9 ค่าประจำหลักเป็น <Pow base="10" exp="k" /> · ฐานสองมีแค่ 0 กับ 1
            ค่าประจำหลักเป็น <Pow exp="k" />
          </>,
          <>
            หลักหนึ่งหลักของฐานสองเรียกว่าบิต น้ำหนักของบิตตำแหน่ง 0–7 คือ 1, 2, 4, 8, 16, 32, 64,
            128
          </>,
          <>ค่าฐานสิบของเลขฐานสอง = ผลรวมน้ำหนักของบิตที่เป็น 1 เช่น 1011₂ = 8 + 2 + 1 = 11</>,
          <>จำนวนเต็ม 8 บิตแบบไม่มีเครื่องหมายมีค่า 0 ถึง 255</>,
        ]}
      />
    </ChapterLayout>
  );
}
