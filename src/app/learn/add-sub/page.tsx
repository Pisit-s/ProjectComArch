import type { Metadata } from 'next';
import { Callout, Formula } from '@/components/content/callout';
import { Term } from '@/components/content/term';
import { OpWorked } from '@/components/content/worked-example';
import { ChapterLayout, Section, Summary } from '@/components/layout/chapter-layout';
import { FpSimulator } from '@/components/tools/fp-simulator';
import { ToolBoundary } from '@/components/tools/tool-boundary';
import { Num, Pow } from '@/components/ui/num';
import { chapterBySlug } from '@/content/chapters';
import { ADD_SUB_EXAMPLES } from '@/content/examples';
import { BINARY32, shortestDecimal, simulate } from '@/lib/fp';
import { fmt } from '@/lib/display';

const ch = chapterBySlug('add-sub');
export const metadata: Metadata = { title: `บทที่ 4 ${ch.title}`, description: ch.blurb };

const TOC = [
  { id: 'why', title: 'ทำไมบวกตรง ๆ ไม่ได้' },
  { id: 'steps', title: '7 ขั้นของการบวก/ลบ' },
  { id: 'grs', title: 'Guard, Round, Sticky' },
  { id: 'rounding', title: 'Round to nearest, ties to even' },
  { id: 'examples', title: 'ตัวอย่าง A1–A6' },
  { id: 'simulator', title: 'Floating-Point Simulator' },
];

export default function AddSubPage() {
  const a2 = simulate(BINARY32, '+', '0.1', '0.2');
  return (
    <ChapterLayout slug="add-sub" toc={TOC}>
      <Section id="why" title="ทำไมบวกเลข Floating-Point ตรง ๆ ไม่ได้">
        <p>
          ลองบวกเลขฐานสิบแบบ scientific notation:{' '}
          <span className="num font-mono">1.5 × 10³ + 2.0 × 10¹</span> จะเอา 1.5 + 2.0 ไม่ได้
          เพราะเลขชี้กำลังไม่เท่ากัน ต้องปรับให้เป็น ×10³ ก่อน:
        </p>
        <Formula>
          1.5 × <Pow base="10" exp={3} /> + 0.02 × <Pow base="10" exp={3} /> = 1.52 ×{' '}
          <Pow base="10" exp={3} />
        </Formula>
        <p>
          Floating-Point ก็เหมือนกัน ต้องทำให้ Exponent เท่ากันก่อน โดยเลื่อน Significand ของตัวที่
          Exponent น้อยกว่าไปทางขวา แล้วจึงบวกหรือลบ Significand
        </p>
      </Section>

      <Section id="steps" title="7 ขั้นของการบวก/ลบ Floating-Point">
        <ol className="list-decimal space-y-2 pl-5">
          <li>encode ตัวเลขทั้งสองเป็น IEEE 754 (ใช้ค่าที่เก็บจริง ไม่ใช่ค่าที่พิมพ์)</li>
          <li>
            แยก Sign, Exponent และ <Term k="significand" /> (เติม hidden bit)
          </li>
          <li>
            เทียบ Exponent แล้วเลื่อน Significand ของตัวที่ Exponent น้อยกว่าไปทางขวาจนเท่ากัน
          </li>
          <li>
            บวก Significand ถ้า Sign เหมือนกัน หรือลบถ้า Sign ต่างกัน (การลบ A − B คือ A + (−B)
            จึงกลับ Sign ของ B ก่อน)
          </li>
          <li>
            Normalize: ถ้าผล ≥ 2 เลื่อนขวา 1 บิตแล้ว Exponent + 1 · ถ้าบิตหน้าเป็น 0
            (ลบกันแล้วเหลือน้อย) เลื่อนซ้ายจนได้ 1.xxx
          </li>
          <li>ปัดเศษให้เหลือ 24 บิตด้วย Guard, Round, Sticky</li>
          <li>encode ผลลัพธ์เป็น 32 บิต</li>
        </ol>
        <Callout tone="info" title="แบบจำลองเพื่อการเรียนรู้">
          <p>
            ขั้นตอนในบทนี้เป็นแบบจำลองของขั้นหลักเพื่อให้เข้าใจหลักการ
            ไม่ใช่รายละเอียดของวงจรบวกเลขในฮาร์ดแวร์ทุกแบบ แต่ผลลัพธ์ทุกบิตตรงกับมาตรฐาน IEEE 754
          </p>
        </Callout>
      </Section>

      <Section id="grs" title="Guard, Round และ Sticky">
        <p>
          ตอนเลื่อน Significand ไปทางขวา บิตบางส่วนจะเลยตำแหน่งสุดท้ายที่เก็บได้
          ถ้าทิ้งไปเลยจะปัดผิด ฮาร์ดแวร์จึงเก็บบิตเพิ่ม 3 ช่อง เรียกว่า <Term k="grs" />:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b>Guard (G)</b>: บิตแรกถัดจากบิตสุดท้ายที่เก็บได้ (มีค่าครึ่งหนึ่งของบิตสุดท้าย)
          </li>
          <li>
            <b>Round (R)</b>: บิตถัดจาก Guard
          </li>
          <li>
            <b>Sticky (S)</b>: OR ของบิตที่เหลือทั้งหมด ถ้ามีบิต 1 หลุดออกไปแม้แต่ตัวเดียว S = 1
          </li>
        </ul>
        <p>3 บิตนี้พอสำหรับปัดเศษให้ได้ผลเหมือนคำนวณแบบแม่นยำแล้วปัดครั้งเดียว</p>
      </Section>

      <Section id="rounding" title="Round to nearest, ties to even">
        <p>
          IEEE 754 ปัดแบบ <Term k="roundEven" /> เป็นค่าเริ่มต้น ดูจาก G, R, S:
        </p>
        <div className="glass-solid scroll-x rounded-xl ring-1 ring-foreground/10">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>G</th>
                <th>R หรือ S</th>
                <th>ความหมาย</th>
                <th>ปัด</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="num font-mono">0</td>
                <td>อะไรก็ได้</td>
                <td>ส่วนที่ทิ้งน้อยกว่าครึ่ง</td>
                <td>ลง (ตัดทิ้ง)</td>
              </tr>
              <tr>
                <td className="num font-mono">1</td>
                <td>มี 1</td>
                <td>ส่วนที่ทิ้งมากกว่าครึ่ง</td>
                <td>ขึ้น (+1 ที่บิตสุดท้าย)</td>
              </tr>
              <tr>
                <td className="num font-mono">1</td>
                <td>0 ทั้งคู่</td>
                <td>กึ่งกลางพอดี (tie)</td>
                <td>เลือกให้บิตสุดท้ายเป็น 0 (เลขคู่)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          ที่ต้องเลือกเลขคู่ตอนเสมอ เพราะถ้าปัดขึ้นทุกครั้ง
          ผลรวมของการคำนวณจำนวนมากจะเอียงไปทางมากขึ้นเรื่อย ๆ การเลือกเลขคู่ทำให้ปัดขึ้นกับปัดลงพอ ๆ
          กัน
        </p>
      </Section>

      <Section id="examples" title="ตัวอย่าง A1–A6">
        <p>
          ตัวเลขทุกตัวด้านล่างคำนวณสดจาก engine (กดตัวอย่างใน Simulator ด้านล่างเพื่อดูทีละขั้น)
          ตัวอย่างที่น่าสนใจที่สุดคือ A2: 0.1 + 0.2 ไม่ได้ 0.3 พอดี ผลแม่นยำของค่าที่เก็บจริงคือ{' '}
          <Num value={a2.ok && a2.result.exact ? fmt(a2.result.exact) : ''} /> แล้วถูกปัดเป็น{' '}
          <Num value={a2.ok ? shortestDecimal(BINARY32, a2.result.bits) : ''} />
        </p>
        <div className="space-y-2">
          {ADD_SUB_EXAMPLES.map((e) => (
            <OpWorked key={e.id} id={e.id} />
          ))}
        </div>
      </Section>

      <Section id="simulator" title="Floating-Point Simulator: บวกและลบ" wide>
        <p className="max-w-[72ch]">
          พิมพ์ตัวเลข 2 ค่าแล้วเลือก + หรือ − เครื่องมือจะเก็บทั้งสองค่าเป็น Single Precision ก่อน
          แล้วคำนวณตามกฎของ Floating-Point ทีละขั้น (ไม่ได้คำนวณคำตอบแม่นยำแล้วค่อยแปลง) กดกล่องใน
          flowchart เพื่อกระโดดไปขั้นนั้นได้ ในขั้นเลื่อนให้ Exponent เท่ากัน ลองกด “เลื่อนทีละบิต”
        </p>
        <ToolBoundary>
          <FpSimulator
            ops={['+', '-']}
            initial={{ op: '+', a: '0.1', b: '0.2' }}
            examples={ADD_SUB_EXAMPLES}
          />
        </ToolBoundary>
      </Section>

      <Summary
        points={[
          <>
            ต้องปรับ Exponent ให้เท่ากันก่อน โดยเลื่อน Significand ของตัวที่ Exponent
            น้อยกว่าไปทางขวา
          </>,
          <>
            Sign เหมือนกันให้บวก Significand ต่างกันให้ลบ ผลใช้ Sign ของตัวที่มีขนาดใหญ่กว่า (A − B
            = A + (−B))
          </>,
          <>
            Normalize: ผล ≥ 2 เลื่อนขวา 1 บิต · ลบกันจนบิตหน้าหาย เลื่อนซ้ายได้หลายบิต แล้วปรับ
            Exponent ตาม
          </>,
          <>ปัดเศษด้วย Guard, Round, Sticky แบบ round to nearest, ties to even</>,
          <>
            ความแม่นยำจำกัดทำให้ผลต่างจากคำตอบแม่นยำได้ เช่น 0.1 + 0.2 ไม่ได้ 0.3 พอดี และ 1 + 1e-8
            ได้ 1 (ตัวเล็กหายไปทั้งตัว)
          </>,
        ]}
      />
    </ChapterLayout>
  );
}
