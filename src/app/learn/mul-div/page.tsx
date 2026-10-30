import type { Metadata } from 'next';
import { Callout, Formula } from '@/components/content/callout';
import { Term } from '@/components/content/term';
import { OpDetail, OpWorked } from '@/components/content/worked-example';
import { ChapterLayout, Section, Summary } from '@/components/layout/chapter-layout';
import { FpSimulator } from '@/components/tools/fp-simulator';
import { ToolBoundary } from '@/components/tools/tool-boundary';
import { chapterBySlug } from '@/content/chapters';
import { DIV_EXAMPLES, MUL_EXAMPLES } from '@/content/examples';

const ch = chapterBySlug('mul-div');
export const metadata: Metadata = { title: `บทที่ 5 ${ch.title}`, description: ch.blurb };

const TOC = [
  { id: 'compare', title: 'ต่างจากบวก/ลบอย่างไร' },
  { id: 'mul', title: 'การคูณ 8 ขั้น' },
  { id: 'mul-example', title: 'ตัวอย่าง M3 แบบละเอียด' },
  { id: 'div', title: 'การหาร 8 ขั้น' },
  { id: 'div-example', title: 'ตัวอย่าง D3 แบบละเอียด' },
  { id: 'special', title: 'กรณีพิเศษและ IEEE exception' },
  { id: 'mistakes', title: 'ข้อผิดพลาดที่เจอบ่อย' },
  { id: 'examples', title: 'ตัวอย่าง M1–M6, D1–D5' },
  { id: 'simulator', title: 'Simulator คูณ/หาร' },
];

const COMPARE: [string, string, string][] = [
  ['ปรับ Exponent ให้เท่ากัน', 'ต้องทำ (เลื่อนตัวที่ Exponent น้อยกว่า)', 'ไม่ต้องทำ'],
  ['Exponent ของผล', 'ใช้ตัวที่มากกว่า', 'EA + EB − 127 หรือ EA − EB + 127'],
  ['Sign', 'ขึ้นกับขนาดและการดำเนินการ', 'SA XOR SB'],
  ['Significand', 'บวกหรือลบ', 'คูณหรือหาร'],
  [
    'Normalize',
    'ขวา 1 บิต (มีตัวทด) หรือซ้ายหลายบิต (ลบกันแล้วค่าหาย)',
    'คูณ: ขวาไม่เกิน 1 บิต · หาร: ซ้ายไม่เกิน 1 บิต',
  ],
  ['ปัดเศษ', 'Guard, Round, Sticky', 'Guard, Round, Sticky (หาร: Sticky ได้จากเศษด้วย)'],
];

const SPECIALS: [string, string, string][] = [
  ['x ÷ 0 (x เป็นค่าจำกัดที่ไม่ใช่ 0)', '±∞ (Sign = XOR)', 'Division by zero'],
  ['0 ÷ 0, ∞ ÷ ∞, 0 × ∞', 'NaN', 'Invalid operation'],
  ['0 × x, 0 ÷ x (x เป็นค่าจำกัดที่ไม่ใช่ 0)', '±0 (Sign = XOR)', '—'],
  ['x ÷ ∞ (x เป็นค่าจำกัด)', '±0', '—'],
  ['∞ × x (x ไม่ใช่ 0), ∞ ÷ x (x เป็นค่าจำกัด)', '±∞', '—'],
  ['มีตัวใดตัวหนึ่งเป็น NaN', 'NaN', '—'],
  ['ผลใหญ่กว่าค่าจำกัดที่มากที่สุด', '±∞', 'Overflow (และ Inexact)'],
  ['ผลเล็กกว่าค่า normalized ที่เล็กที่สุด', 'Subnormal หรือ ±0', 'Underflow (เมื่อปัดแล้วไม่ตรง)'],
];

export default function MulDivPage() {
  return (
    <ChapterLayout slug="mul-div" toc={TOC}>
      <Section id="compare" title="ต่างจากการบวก/ลบอย่างไร">
        <p>
          คูณเลขแบบ scientific notation ง่ายกว่าบวก:{' '}
          <span className="num font-mono">(2 × 10³) × (3 × 10⁴) = 6 × 10⁷</span> คือคูณตัวเลขสำคัญ
          แล้ว <b>บวก</b> เลขชี้กำลัง ไม่ต้องปรับเลขชี้กำลังให้เท่ากันก่อน
          ส่วนการหารก็หารตัวเลขสำคัญแล้ว <b>ลบ</b> เลขชี้กำลัง
        </p>
        <div className="glass-solid scroll-x rounded-xl ring-1 ring-foreground/10">
          <table className="table table-sm" data-testid="compare-table">
            <thead>
              <tr>
                <th />
                <th>บวก/ลบ (บทที่ 4)</th>
                <th>คูณ/หาร (บทที่ 5)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([k, a, b]) => (
                <tr key={k}>
                  <th className="font-semibold">{k}</th>
                  <td>{a}</td>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="mul" title="การคูณ 8 ขั้น">
        <ol className="list-decimal space-y-2 pl-5">
          <li>แยกทั้งสองค่าเป็น Sign, Biased exponent และ Significand (1.Fraction)</li>
          <li>
            Sign: <span className="num font-mono">S = SA XOR SB</span>
          </li>
          <li>
            Exponent: <span className="num font-mono">E = EA + EB − 127</span>
          </li>
          <li>
            คูณ Significand 24 บิตสองค่าแบบ shift-and-add ผลแม่นยำยาวได้ถึง 48 บิต และอยู่ในช่วง [1,
            4)
          </li>
          <li>Normalize: ถ้าผลคูณ ≥ 2 เลื่อนขวา 1 บิตแล้ว Exponent + 1</li>
          <li>
            ปัดให้เหลือ 24 บิตด้วย Guard, Round, Sticky ถ้าปัดแล้วมีตัวทดให้ Normalize อีกครั้ง
          </li>
          <li>ตรวจช่วง: Overflow ได้ ±∞ · Underflow ได้ Subnormal หรือ ±0</li>
          <li>encode ผลเป็น 32 บิต</li>
        </ol>
        <Callout tone="tip" title="ทำไมลบ Bias หนึ่งครั้ง">
          <p>
            Biased exponent แต่ละตัวมี +127 อยู่แล้ว: EA = eA + 127 และ EB = eB + 127 ถ้าบวกกันตรง ๆ
            จะได้ eA + eB + 254 ซึ่งมี Bias ซ้ำสองครั้ง จึงต้องลบ 127 ออกหนึ่งครั้งให้เหลือ (eA +
            eB) + 127
          </p>
        </Callout>
        <Formula>E = EA + EB − 127 · Significand ∈ [1, 2) × [1, 2) = [1, 4)</Formula>
        <p>
          การคูณแบบ shift-and-add: ทุกบิต 1 ของตัวคูณ (<Term k="multiplicand" />) ให้{' '}
          <Term k="partialProduct" /> หนึ่งแถว คือตัวตั้งเลื่อนไปตามตำแหน่งของบิตนั้น แล้วบวกทุกแถว
        </p>
      </Section>

      <Section id="mul-example" title="ตัวอย่าง M3 แบบละเอียด: 6.5 × 2.75">
        <OpDetail id="M3" />
      </Section>

      <Section id="div" title="การหาร 8 ขั้น">
        <ol className="list-decimal space-y-2 pl-5">
          <li>แยกทั้งสองค่าเป็น Sign, Biased exponent และ Significand</li>
          <li>
            Sign: <span className="num font-mono">S = SA XOR SB</span>
          </li>
          <li>
            Exponent: <span className="num font-mono">E = EA − EB + 127</span>
          </li>
          <li>
            หาร Significand ของตัวตั้งด้วยตัวหารด้วยการหารยาวฐานสอง ผลหารอยู่ในช่วง (0.5, 2)
            หาบิตให้พอสำหรับ Guard และ Round ส่วน Sticky เป็น 1 เมื่อเศษสุดท้ายไม่เป็นศูนย์
          </li>
          <li>Normalize: ถ้าผลหาร &lt; 1 เลื่อนซ้าย 1 บิตแล้ว Exponent − 1</li>
          <li>ปัดเศษ แล้ว Normalize อีกครั้งถ้ามีตัวทด</li>
          <li>ตรวจช่วง (Overflow หรือ Underflow)</li>
          <li>encode ผลเป็น 32 บิต</li>
        </ol>
        <Callout tone="tip" title="ทำไมบวก Bias กลับหนึ่งครั้ง">
          <p>
            EA − EB = (eA + 127) − (eB + 127) = eA − eB · Bias หักล้างกันหายไปหมด จึงต้องบวก 127
            กลับหนึ่งครั้ง
          </p>
        </Callout>
        <p>
          การหารยาวฐานสองง่ายกว่าฐานสิบ เพราะแต่ละรอบมีแค่ 2 ทาง: ถ้าเศษ ≥{' '}
          <Term k="dividend">ตัวหาร</Term> ให้ลบแล้วได้บิตผลหาร 1 ไม่งั้นได้ 0
          แล้วเลื่อนเศษไปทางซ้าย 1 บิต
        </p>
      </Section>

      <Section id="div-example" title="ตัวอย่าง D3 แบบละเอียด: 1 ÷ 3">
        <OpDetail id="D3" />
      </Section>

      <Section id="special" title="กรณีพิเศษและ IEEE exception">
        <p>
          กรณีเหล่านี้ไม่ต้องไล่ทุกขั้น ใช้กฎสั้น ๆ ได้ผลทันที และ IEEE 754 ไม่ได้หยุดโปรแกรม
          แต่ให้ค่าพิเศษพร้อมแจ้ง exception
        </p>
        <div className="glass-solid scroll-x rounded-xl ring-1 ring-foreground/10">
          <table className="table table-sm" data-testid="special-table">
            <thead>
              <tr>
                <th>กรณี</th>
                <th>ผลลัพธ์</th>
                <th>Exception</th>
              </tr>
            </thead>
            <tbody>
              {SPECIALS.map(([c, r, e]) => (
                <tr key={c}>
                  <td className="num font-mono text-sm">{c}</td>
                  <td>{r}</td>
                  <td>{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm">
          <Term k="overflow" /> และ <Term k="underflow" /> ดูได้ในขั้น “ตรวจ Overflow / Underflow”
          ของ Simulator ลองตัวอย่าง M5, M6, D4, D5 หรือปุ่มค่าพิเศษ
        </p>
      </Section>

      <Section id="mistakes" title="ข้อผิดพลาดที่เจอบ่อย">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <b>ลืมลบ Bias</b> ตอนคูณ (ได้ EA + EB เฉย ๆ) หรือลืมบวก Bias กลับตอนหาร → Exponent ผิดไป
            127
          </li>
          <li>
            <b>ลืม hidden bit</b> คูณ/หารแค่ Fraction 23 บิตโดยไม่มีเลข 1 หน้าจุด → ผลผิดทั้งหมด
          </li>
          <li>
            <b>ใส่ Sign ผิด</b> คูณ/หารใช้ XOR เสมอ ไม่ได้ขึ้นกับว่าค่าไหนใหญ่กว่า
          </li>
          <li>
            <b>Normalize ผิดทาง</b> คูณเลื่อนขวา (ผลอาจถึง 2 ขึ้นไป) หารเลื่อนซ้าย (ผลอาจต่ำกว่า 1)
          </li>
          <li>
            <b>ทิ้งเศษของการหาร</b> เศษที่ไม่เป็น 0 ต้องกลายเป็น Sticky = 1 ไม่งั้นปัดผิดได้
          </li>
        </ul>
        <Callout tone="info" title="แบบจำลองเพื่อการเรียนรู้">
          <p>
            ขั้นตอนนี้เป็นแบบจำลองของขั้นหลักเพื่อการเรียนรู้
            ไม่ใช่วงจรคูณหรือหารของฮาร์ดแวร์รุ่นใดรุ่นหนึ่ง (เช่น array multiplier, Booth encoding,
            SRT division) แต่ผลลัพธ์ตรงกับ IEEE 754 ทุกบิต
          </p>
        </Callout>
      </Section>

      <Section id="examples" title="ตัวอย่าง M1–M6 และ D1–D5">
        <div className="space-y-2">
          {[...MUL_EXAMPLES, ...DIV_EXAMPLES]
            .filter((e) => e.featured)
            .map((e) => (
              <OpWorked key={e.id} id={e.id} />
            ))}
        </div>
      </Section>

      <Section id="simulator" title="Simulator: คูณและหาร" wide>
        <p className="max-w-[72ch]">
          เลือก × หรือ ÷ แล้วดูทีละขั้น: XOR ของ Sign, การแก้ Bias (ฐานสิบและฐานสอง 8 บิต), partial
          product ทีละแถว, การหารยาวทีละแถว, Normalize, ปัดเศษ, ตรวจช่วง และผลลัพธ์ · ใส่ค่าพิเศษ 0,
          −0, ∞, −∞, NaN ได้จากปุ่มด้านล่างช่องกรอก
        </p>
        <ToolBoundary>
          <FpSimulator
            ops={['*', '/']}
            initial={{ op: '*', a: '6.5', b: '2.75' }}
            examples={[...MUL_EXAMPLES, ...DIV_EXAMPLES].filter((e) => e.featured)}
            specials
          />
        </ToolBoundary>
      </Section>

      <Summary
        points={[
          <>Sign ของผลคูณและผลหาร = SA XOR SB เสมอ</>,
          <>
            คูณ: E = EA + EB − 127 (ลบ Bias ที่ซ้ำ) · หาร: E = EA − EB + 127 (บวก Bias ที่หายไปกลับ)
          </>,
          <>
            คูณ/หาร Significand ที่รวม hidden bit แล้ว: คูณแบบ shift-and-add (ผลใน [1, 4)) ·
            หารแบบหารยาว (ผลใน (0.5, 2))
          </>,
          <>Normalize: คูณเลื่อนขวาไม่เกิน 1 บิต · หารเลื่อนซ้ายไม่เกิน 1 บิต</>,
          <>
            ปัดเศษด้วย Guard, Round, Sticky (round to nearest, ties to even) การหารเอาเศษที่ไม่เป็น
            0 มาเป็น Sticky
          </>,
          <>
            กรณีพิเศษ: x ÷ 0 = ±∞ · 0 ÷ 0, ∞ ÷ ∞, 0 × ∞ = NaN · ผลใหญ่เกินเป็น ±∞ (Overflow) ·
            ผลเล็กเกินเป็น Subnormal หรือ ±0 (Underflow)
          </>,
        ]}
      />
    </ChapterLayout>
  );
}
