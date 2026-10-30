import type { Metadata } from 'next';
import { FieldLegend } from '@/components/bits/field-legend';
import { Register } from '@/components/bits/register';
import { Callout, Formula } from '@/components/content/callout';
import { Term } from '@/components/content/term';
import { DecodeWorked, EncodeWorked } from '@/components/content/worked-example';
import { ChapterLayout, Section, Summary } from '@/components/layout/chapter-layout';
import { Ieee754Converter } from '@/components/tools/ieee-converter';
import { ToolBoundary } from '@/components/tools/tool-boundary';
import { Num, Pow } from '@/components/ui/num';
import { chapterBySlug } from '@/content/chapters';
import {
  BINARY32,
  encodeBits,
  encodeDecimal,
  exactDecimal,
  shortestDecimal,
  toHex,
} from '@/lib/fp';
import { bin8, fmt } from '@/lib/display';

const ch = chapterBySlug('ieee-754');
export const metadata: Metadata = { title: `บทที่ 3 ${ch.title}`, description: ch.blurb };

const TOC = [
  { id: 'scientific', title: 'Scientific notation' },
  { id: 'why', title: 'ทำไมต้องมี Floating-Point' },
  { id: 'layout', title: 'Single Precision: 1-8-23' },
  { id: 'bias', title: 'Exponent และ Bias 127' },
  { id: 'hidden', title: 'Hidden bit' },
  { id: 'encode', title: 'ขั้นตอน encode' },
  { id: 'decode', title: 'ขั้นตอน decode' },
  { id: 'inexact', title: '0.1 เก็บไม่พอดี' },
  { id: 'special', title: 'Exponent 0 และ 255' },
  { id: 'converter', title: 'IEEE 754 Converter' },
];

const F = BINARY32;

export default function Ieee754Page() {
  const tenth = encodeDecimal(F, '0.1');
  const max = encodeBits(F, '3.4028235e38')!;
  const minNormal = encodeBits(F, '1.17549435e-38')!;
  const minSub = encodeBits(F, '1e-45')!;
  return (
    <ChapterLayout slug="ieee-754" toc={TOC}>
      <Section id="scientific" title="Scientific notation: จากฐานสิบสู่ฐานสอง">
        <p>
          นักวิทยาศาสตร์เขียนเลขที่ใหญ่หรือเล็กมากในรูป <b>ตัวเลข 1 หลักหน้าจุด × 10 ยกกำลัง</b>{' '}
          เช่น
        </p>
        <Formula>
          1250 = 1.25 × <Pow base="10" exp={3} /> · 0.00042 = 4.2 × <Pow base="10" exp={-4} />
        </Formula>
        <p>
          ฐานสองทำแบบเดียวกันได้ เลื่อนจุดจนหน้าจุดเหลือเลข 1 ตัวเดียว (ในฐานสองหลักแรกที่ไม่ใช่ 0
          ต้องเป็น 1 เสมอ) แล้วจดว่าเลื่อนไปกี่ตำแหน่ง ขั้นนี้เรียกว่า <Term k="normalize" />
        </p>
        <Formula>
          101.11<sub>2</sub> = 1.0111<sub>2</sub> × <Pow exp={2} />
        </Formula>
      </Section>

      <Section id="why" title="ทำไมต้องมี Floating-Point">
        <p>
          ถ้าเก็บจำนวนจริงแบบกำหนดตำแหน่งจุดตายตัว (fixed-point) เช่น 16 บิตหน้าจุด 16 บิตหลังจุด
          จะเก็บได้แค่ค่าในช่วงแคบ ๆ ค่าใหญ่มาก (ระยะทางระหว่างดาว) หรือเล็กมาก (ขนาดอะตอม)
          จะเก็บไม่ได้เลย
        </p>
        <p>
          <Term k="floatingPoint" /> เก็บแค่ <b>ตัวเลขสำคัญ</b> กับ <b>เลขชี้กำลัง</b> แยกกัน จุดจึง
          “ลอย” ไปอยู่ตรงไหนก็ได้ตามขนาดของค่า ด้วย 32 บิตเท่าเดิมเก็บได้ตั้งแต่ประมาณ{' '}
          <Num value={shortestDecimal(F, minSub)} /> ถึง <Num value={shortestDecimal(F, max)} />{' '}
          แลกกับความละเอียดที่มีจำกัด (ราว 7 หลักฐานสิบ)
        </p>
        <p>
          มาตรฐานที่ทุกเครื่องใช้คือ IEEE 754 ซึ่งกำหนดรูปแบบบิต วิธีปัดเศษ และค่าพิเศษ
          ทำให้ทุกเครื่องคำนวณได้ผลเหมือนกันทุกบิต
        </p>
      </Section>

      <Section id="layout" title="Single Precision: Sign 1 · Exponent 8 · Fraction 23">
        <p>
          <Term k="single" /> ใช้ 32 บิต แบ่งเป็น 3 ส่วน (สีของแต่ละส่วนเหมือนกันทุกบทในเว็บนี้):
        </p>
        <FieldLegend />
        <Register bits={encodeBits(F, '5.75')!} label="ตัวอย่าง: 5.75" name="layout" />
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Term k="sign" /> (1 บิต): 0 = บวก, 1 = ลบ
          </li>
          <li>
            <Term k="exponent" /> (8 บิต): เลขชี้กำลังของ 2 เก็บแบบบวก Bias
          </li>
          <li>
            <Term k="fraction" /> (23 บิต): บิตหลังจุดของตัวเลขสำคัญ
          </li>
        </ul>
        <Formula>
          ค่า = (−1)<sup>Sign</sup> × 1.Fraction × <Pow exp="Exponent − 127" />
        </Formula>
        <p className="text-sm text-muted">
          แตะที่บิตใดก็ได้เพื่อดูว่าบิตนั้นอยู่ส่วนไหนและมีน้ำหนักเท่าไร
        </p>
      </Section>

      <Section id="bias" title="Exponent และ Bias 127">
        <p>
          เลขชี้กำลังจริงมีทั้งบวกและลบ (ค่าเล็กกว่า 1 มีเลขชี้กำลังติดลบ) แต่ field Exponent
          เก็บเป็นจำนวนเต็มไม่มีเครื่องหมาย 0–255 จึงบวก <Term k="bias" /> 127 ก่อนเก็บ
          ค่าที่เก็บเรียกว่า <Term k="biasedExponent" />
        </p>
        <Formula>
          Biased exponent = exponent จริง + 127 · exponent จริง = Biased exponent − 127
        </Formula>
        <p>
          เช่น exponent จริง 2 เก็บเป็น 2 + 127 = 129 ={' '}
          <span className="num font-mono">{bin8(2 + 127)}</span> · exponent −3 เก็บเป็น −3 + 127 =
          124 = <span className="num font-mono">{bin8(-3 + 127)}</span>
        </p>
        <Callout tone="tip" title="ทำไมใช้ Bias แทนบิตเครื่องหมาย">
          <p>
            เพราะเมื่อเก็บแบบบวก Bias ค่าบวกที่ใหญ่กว่าจะมีรูปแบบบิตที่เป็นจำนวนเต็มใหญ่กว่าเสมอ
            ฮาร์ดแวร์จึงเทียบขนาดของ float ได้ด้วยวงจรเทียบจำนวนเต็มธรรมดา
          </p>
        </Callout>
      </Section>

      <Section id="hidden" title="Hidden bit">
        <p>
          หลัง Normalize แล้ว หน้าจุดเป็น 1 เสมอ จึงไม่ต้องเก็บ 1 ตัวนี้ เรียกว่า{' '}
          <Term k="hiddenBit" /> เก็บแค่บิตหลังจุด 23 บิตใน Fraction แต่ได้ความละเอียด 24 บิต ตัวเลข
          1.Fraction เต็ม ๆ เรียกว่า <Term k="significand" />
        </p>
      </Section>

      <Section id="encode" title="ขั้นตอน encode: ฐานสิบ → 32 บิต">
        <ol className="list-decimal space-y-1 pl-5">
          <li>แปลงเป็นฐานสอง (ส่วนเต็มหาร 2 ซ้ำ ส่วนเศษคูณ 2 ซ้ำ)</li>
          <li>Normalize ให้อยู่ในรูป 1.xxx × 2ᵉ</li>
          <li>กำหนด Sign bit</li>
          <li>คำนวณ Biased exponent = e + 127 แล้วเขียนเป็นฐานสอง 8 บิต</li>
          <li>เติม Fraction ด้วยบิตหลังจุด 23 บิต (ถ้ามีบิตเกินต้องปัดเศษ)</li>
          <li>รวม 3 ส่วนเป็น 32 บิต (มักเขียนเป็น hex 8 หลัก)</li>
        </ol>
        <EncodeWorked input="5.75" />
        <EncodeWorked input="-13.25" />
      </Section>

      <Section id="decode" title="ขั้นตอน decode: 32 บิต → ฐานสิบ">
        <p>
          ทำย้อนกลับ: แยก field → ดูประเภทจาก Exponent → exponent จริง = E − 127 → เติม hidden bit →
          แทนค่าในสูตร
        </p>
        <DecodeWorked source="0.15625" />
      </Section>

      <Section id="inexact" title="0.1 เก็บไม่พอดี">
        <p>
          จากบทที่ 2 เรารู้แล้วว่า 0.1 ในฐานสองซ้ำไม่รู้จบ Single Precision มี Significand แค่ 24
          บิต จึงต้องปัดให้ใกล้ที่สุด (round to nearest, ties to even) ผลคือ{' '}
          <span className="num font-mono">{toHex(tenth.ok ? tenth.bits : 0n, 32)}</span>{' '}
          ซึ่งมีค่าจริงเท่ากับ
        </p>
        <Formula>
          <Num value={exactDecimal(F, tenth.ok ? tenth.bits : 0n)} />
        </Formula>
        <p>
          ต่างจาก 0.1 อยู่ <Num value={tenth.ok && tenth.error ? fmt(tenth.error, 8) : '0'} />{' '}
          เล็กมากแต่ไม่ใช่ 0 เวลาโปรแกรมแสดงผลเป็น {shortestDecimal(F, tenth.ok ? tenth.bits : 0n)}{' '}
          เพราะเลือกทศนิยมที่สั้นที่สุดที่แปลงกลับได้บิตเดิม
        </p>
        <Callout tone="warn">
          <p>
            จำนวนจริงส่วนใหญ่เก็บแบบพอดีไม่ได้ด้วยบิตจำนวนจำกัด ค่าที่เก็บเป็นแค่ค่าที่ใกล้ที่สุดที่
            format นั้นมี
          </p>
        </Callout>
      </Section>

      <Section id="special" title="Exponent 0 และ 255 มีความหมายพิเศษ">
        <div className="glass-solid scroll-x rounded-xl ring-1 ring-foreground/10">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Exponent</th>
                <th>Fraction</th>
                <th>ความหมาย</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="num font-mono">0</td>
                <td>0</td>
                <td>±0 (มีทั้ง +0 และ −0)</td>
              </tr>
              <tr>
                <td className="num font-mono">0</td>
                <td>≠ 0</td>
                <td>
                  <Term k="subnormal" />: 0.Fraction × <Pow exp={-126} /> (ไม่มี hidden bit)
                </td>
              </tr>
              <tr>
                <td className="num font-mono">1–254</td>
                <td>อะไรก็ได้</td>
                <td>ค่าปกติ (normal) ตามสูตรข้างบน</td>
              </tr>
              <tr>
                <td className="num font-mono">255</td>
                <td>0</td>
                <td>
                  ±<Term k="infinity" />
                </td>
              </tr>
              <tr>
                <td className="num font-mono">255</td>
                <td>≠ 0</td>
                <td>
                  <Term k="nan" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            ค่าจำกัดที่มากที่สุด: <span className="num font-mono">{toHex(max, 32)}</span> ≈{' '}
            <Num value={shortestDecimal(F, max)} />
          </li>
          <li>
            ค่า normal ที่เล็กที่สุด: <span className="num font-mono">{toHex(minNormal, 32)}</span>{' '}
            = <Pow exp={-126} /> ≈ <Num value={shortestDecimal(F, minNormal)} />
          </li>
          <li>
            ค่า subnormal ที่เล็กที่สุด: <span className="num font-mono">{toHex(minSub, 32)}</span>{' '}
            = <Pow exp={-149} /> ≈ <Num value={shortestDecimal(F, minSub)} />
          </li>
        </ul>
        <p className="text-sm text-muted">
          บทนี้แสดงค่าพิเศษแบบสั้น ๆ ส่วนการคำนวณกับค่าพิเศษอธิบายเต็มในบทที่ 5
        </p>
      </Section>

      <Section id="converter" title="IEEE 754 Converter" wide>
        <p className="max-w-[72ch]">
          มี 2 โหมด: พิมพ์เลขฐานสิบเพื่อ encode เป็น 32 บิต หรือกด/พิมพ์บิตเพื่อ decode
          กลับเป็นฐานสิบ แต่ละโหมดดูได้ทีละขั้นด้วยปุ่มด้านล่าง ในขั้น Normalize
          ลองกดปุ่มเลื่อนจุดเองก่อนดูคำตอบ
        </p>
        <ToolBoundary>
          <Ieee754Converter />
        </ToolBoundary>
      </Section>

      <Summary
        points={[
          <>
            Scientific notation เขียนค่าเป็นตัวเลขสำคัญ × ฐานยกกำลัง ฐานสองเขียนเป็น 1.xxx × 2ᵉ
            (Normalize)
          </>,
          <>Single Precision มี 32 บิต: Sign 1 บิต · Exponent 8 บิต · Fraction 23 บิต</>,
          <>
            Exponent เก็บแบบบวก Bias 127 (Biased exponent = e + 127) และค่า normal มี hidden bit = 1
            ที่ไม่ต้องเก็บ
          </>,
          <>
            encode: ฐานสอง → Normalize → Sign → e + 127 → Fraction 23 บิต (ปัดถ้าเกิน) → รวม 32 บิต
            · decode ทำย้อนกลับ
          </>,
          <>Exponent 0 ใช้กับ ±0 และ Subnormal · Exponent 255 ใช้กับ ±∞ และ NaN</>,
          <>
            ด้วยบิตจำกัด ค่าส่วนใหญ่ (เช่น 0.1) เก็บได้แค่ค่าที่ใกล้ที่สุด จึงมีความคลาดเคลื่อนเล็ก
            ๆ เสมอ
          </>,
        ]}
      />
    </ChapterLayout>
  );
}
