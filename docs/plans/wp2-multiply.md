# WP-2: การคูณแบบ MIPS (`/multiply`)

> ผู้รับผิดชอบ: เพื่อนในกลุ่ม (ใส่ชื่อในไฟล์ progress) · branch `wp2-multiply` · progress `docs/progress/wp2-multiply.md` · เขียนเมื่อ 31 ต.ค. 2569
> อ่านคู่กับ `PLAN.md` หัวข้อ 0–6 และ 11 และ `docs/TEAM.md` · เริ่มได้หลัง WP-0 merge แล้ว
> เนื้อหาอ้างอิง: Patterson & Hennessy, *Computer Organization and Design* (4th ed.) หัวข้อ 3.3 Multiplication · คำสั่ง `mult`, `multu`, `mfhi`, `mflo` จาก MIPS Reference Data (`EMIPS.pdf`) · **ห้ามคัดลอกรูป ตาราง หรือข้อความจากตำรา** (วาดและเขียนเอง อ้างอิงแค่หมายเลขหัวข้อ)
> golden: `docs/plans/golden/multiply-traces.json` · โปรแกรม MIPS ที่เกี่ยวข้อง: `docs/plans/golden/mips/shift-add-multiply.s`, `mult-div.s`

## สารบัญ
- 0. เป้าหมาย
- 1. ก่อนเริ่ม
- 2. วัตถุประสงค์การเรียนรู้
- 3. โครงหน้าและเนื้อหา
- 4. โมเดล `src/lib/multiply/`
- 5. Component
- 6. Golden (ค่าที่ต้องได้)
- 7. Testing
- 8. Phase และ Definition of Done
- 9. คำถามตั้งต้น

---

## 0. เป้าหมาย
- หน้า `/multiply` สอนการคูณจำนวนเต็มฐานสองแบบที่ฮาร์ดแวร์ของ MIPS ทำ ตามลำดับในตำรา: คูณด้วยมือ → ฮาร์ดแวร์รุ่นแรก → รุ่นปรับปรุง → เลขมีเครื่องหมาย → ทำให้เร็วขึ้น → คำสั่งของ MIPS
- หัวใจ: **simulator ฮาร์ดแวร์การคูณทีละขั้น** (register + ALU + control) ที่ค่าทุกขั้นตรงกับตัวอย่างในตำราทุกบิต และมีคำอธิบาย "ทำอะไร/ทำไม" ที่คนนำเสนออ่านได้ทันที
- อาจารย์ให้คะแนนจากการอธิบายได้ (PLAN.md 1) → ทุกขั้นต้องตอบได้ว่า "ทำไมทำแบบนี้" และท้ายหน้ามีประเด็นสำหรับอธิบายกับคำถามชวนคิด

## 1. ก่อนเริ่ม
- WP-0 เตรียมไว้ให้แล้ว: `src/app/multiply/page.tsx` (ตอนนี้เป็นหน้า "กำลังพัฒนา" → แทนทั้งไฟล์ได้เลย), `src/content/glossary/multiply.ts` (ว่าง), `docs/progress/wp2-multiply.md`
- component ร่วมที่ต้องใช้ (PLAN.md 6.2 · เปิดดูตัวอย่างทุกชิ้นที่ `/dev/kit` ตอน `npm run dev`): `LessonLayout`, `Section`, `Summary`, `StepPlayer`, `BitRow`, `BitCell`, `TalkingPoints`, `SelfCheck`, `OpenInSim`, ชุด `src/components/hw/` (`HwRegister`, `HwAlu`, `HwControl`, `HwWire`), `Callout`, `Formula`, `Term`, `Glass`, `ToolBoundary`
- สีบทบาท (PLAN.md 6.1): Multiplicand = `md-operand` · Multiplier = `md-step` · Product = `md-acc` · ผลของ ALU และ carry = `md-alu` · บิตที่ control ดูในขั้นนั้น = `md-test` · field ของคำสั่ง MIPS = `mips-*`
- ดูวิธีที่บท Floating-Point ใช้ StepPlayer + engine + ข้อความแต่ละขั้นเป็นแบบอย่าง: `src/app/floating-point/mul-div/page.tsx`, `src/components/tools/fp-simulator.tsx`, `src/content/step-text.ts`
- ไฟล์ที่แก้ได้ (PLAN.md 3.3): `src/app/multiply/**`, `src/lib/multiply/**`, `src/components/multiply/**`, `src/content/multiply/**`, `src/content/glossary/multiply.ts`, `tests/unit/multiply/**`, `tests/e2e/multiply.spec.ts`, `docs/progress/wp2-multiply.md` + บรรทัด `status` ของ `multiply` ใน `src/content/topics.ts` · **ห้ามเพิ่ม dependency** · ห้ามแก้ไฟล์ร่วม (ถ้าจำเป็นทำตาม PLAN.md 3.3)

## 2. วัตถุประสงค์การเรียนรู้ (ใส่ใน `LessonLayout`)
1. อธิบายได้ว่าการคูณฐานสองคือการบวก partial product ที่เป็น 0 หรือ Multiplicand ที่ถูกเลื่อน และทำไมผลคูณ n บิต × n บิตต้องใช้ 2n บิต
2. ไล่ขั้นตอนของฮาร์ดแวร์การคูณรุ่นแรกได้ทีละรอบ
3. อธิบายได้ว่ารุ่นปรับปรุงประหยัดฮาร์ดแวร์อย่างไร และทำไมต้องมีบิต carry เพิ่ม
4. คูณเลขมีเครื่องหมายด้วยวิธีคูณขนาดแล้วกลับเครื่องหมาย
5. ใช้ `mult`, `multu`, `mfhi`, `mflo` ได้ และตรวจได้ว่าผลเกิน 32 บิตหรือไม่จาก HI

---

## 3. โครงหน้าและเนื้อหา
หน้าเดียวยาวแบบบทของ Floating-Point (`LessonLayout` + `Section` · eyebrow "หัวข้อที่ 1" · เวลาอ่านประมาณ 20 นาที) · id ของ section ใช้ใน TOC

### 3.1 `intro`: คูณฐานสองด้วยมือ
- เทียบกับการคูณฐานสิบแบบตั้งหลัก: ในฐานสองแต่ละหลักของ Multiplier เป็น 0 หรือ 1 → partial product ของหลักนั้นคือ 0 หรือ Multiplicand ที่เลื่อนไปทางซ้ายตามตำแหน่งหลัก → การคูณจึงเหลือแค่ "เลื่อน" กับ "บวก"
- ผลยาวขึ้น: n บิต × m บิต ได้ผลยาวสุด n + m บิต (4 × 4 → 8 บิต, 32 × 32 → 64 บิต) เป็นเหตุผลที่ MIPS ต้องมี HI กับ LO (เชื่อมไป 3.6)
- interactive `LongMultiplication`: ใส่ 2 ค่า 4 บิต (ค่าเริ่มต้น 13 × 11) → StepPlayer แสดง partial product ทีละแถว (แถวที่บิตของ Multiplier เป็น 0 แสดง 0 แบบจาง) แล้วบวกรวม · ผลเป็นฐานสองและฐานสิบ · ปุ่มสุ่ม
- ใช้ `Term` กับ Multiplicand, Multiplier, Product, Partial product ครั้งแรกที่เจอ

### 3.2 `hw-v1`: ฮาร์ดแวร์การคูณรุ่นแรก
- ภาพฮาร์ดแวร์ (วาดเองด้วย `src/components/hw/`): Multiplicand (2n บิต เลื่อนซ้าย), ALU (2n บิต), Product (2n บิต เขียนผล), Multiplier (n บิต เลื่อนขวา), Control test (ดูบิตขวาสุดของ Multiplier) · ป้ายความกว้างตาม n ที่เลือก และบอกว่าของจริงใน MIPS คือ 64/64/64/32 บิต
- flowchart (ส่ง `flow` ให้ StepPlayer): เริ่ม → **1** ทดสอบ Multiplier0 → **1a** Product = Product + Multiplicand (เมื่อบิตเป็น 1) → **2** เลื่อน Multiplicand ซ้าย 1 บิต → **3** เลื่อน Multiplier ขวา 1 บิต → ครบ n รอบไหม → จบ
- interactive `MultiplierV1` (หัวใจของหน้า):
  - input 2 ค่า: 4 บิต (0–15, ค่าเริ่มต้น) หรือ 8 บิต (0–255) · พิมพ์ฐานสิบหรือแตะบิตเพื่อสลับ · ปุ่มตัวอย่าง "2 × 3 (ตัวอย่างในตำรา)", "13 × 11", "15 × 15", "สุ่ม"
  - 1 ขั้นของ StepPlayer = 1 แถวของ trace (init แล้วรอบละ 3 ขั้น: 1 หรือ 1a, 2, 3)
  - แสดง: ภาพฮาร์ดแวร์ที่ไฮไลต์ส่วนที่ทำงาน (ขั้น 1a: ALU และเส้นเข้า/ออก · ขั้น 2, 3: ลูกศร shift) · register ทุกตัวด้วย `BitRow` สีตามบทบาท บิตที่เปลี่ยนไฮไลต์ บิต Multiplier0 เป็นสี `md-test` · ตาราง trace ที่เพิ่มแถวตามขั้นปัจจุบัน (รอบ, ขั้น, Multiplier, Multiplicand, Product) ทำให้เหมือนกระดาษทดของนักศึกษา
  - คำอธิบายแต่ละขั้นสร้างจากข้อมูลของแถว (ห้ามพิมพ์ตัวเลขเอง) เช่น "รอบที่ 1 ขั้น 1a: บิตขวาสุดของ Multiplier เป็น 1 จึงบวก Multiplicand เข้า Product: 0000 0000 + 0000 0010 = 0000 0010" · ทำไม: "บิตนี้บอกว่า partial product ของหลักนี้คือ Multiplicand ที่เลื่อนมาแล้ว" · ขั้น 1 (บิตเป็น 0): "ไม่บวก เพราะ partial product ของหลักนี้เป็น 0"
  - จบ: Product = a × b (ฐานสิบ) และสรุปจำนวนขั้น (n รอบ × 3 ขั้น) → ชี้ว่าทำไมรุ่นนี้ช้าและเปลือง (ALU กับ register กว้าง 64 บิต)

### 3.3 `hw-v2`: ฮาร์ดแวร์รุ่นปรับปรุง
- สิ่งที่เปลี่ยน: Multiplicand และ ALU เหลือ n บิต (ครึ่งเดียว) · ไม่มี register Multiplier แยก เพราะใส่ Multiplier ไว้ครึ่งขวาของ Product · ทุกรอบเลื่อน Product ไปทางขวาแทนการเลื่อน Multiplicand ไปทางซ้าย · บวกกับเลื่อนทำในรอบเดียวกันได้ (รอบละ 2 ขั้นในภาพนี้)
- **ทำไมต้องมีบิต carry**: ครึ่งซ้ายของ Product + Multiplicand อาจทดเกิน n บิต → ต้องเก็บบิตทดไว้แล้วเลื่อนเข้าเป็นบิตซ้ายสุดตอนเลื่อนขวา (ตำราบอกว่า Product ของจริงควรมี 65 บิต) · ใช้ 13 × 11 เป็นตัวอย่าง: รอบ 2 และ 4 มี carry = 1 · ถ้าไม่มีบิตนี้จะได้ 111 แทน 143 (ค่าจากโมเดลตอนปิด carry)
- interactive `MultiplierV2`: input แบบเดียวกับ v1 (ตัวอย่างเดียวกัน) · 1 ขั้นของ StepPlayer = 1 แถวของ trace (init แล้วรอบละ 2 ขั้น: 1 หรือ 1a, 2) · Product แสดงด้วย `BitRow` แบบแบ่งครึ่ง (`split`) + ช่อง carry เส้นประด้านซ้าย (`extraBit`) · บิต Product0 เป็นสี `md-test` · ภาพฮาร์ดแวร์รุ่นปรับปรุง · ตาราง trace สะสม · สวิตช์ "ปิดบิต carry" (สำหรับอธิบายว่าทำไมต้องมี) แสดงผลที่ผิดพร้อมคำอธิบาย
- ตารางเทียบ v1 กับ v2: ความกว้าง Multiplicand, ALU, Product · จำนวน register · ทิศการเลื่อน · ขั้นต่อรอบ

### 3.4 `signed`: คูณเลขมีเครื่องหมาย
- วิธีตามตำรา: จำเครื่องหมายของทั้งสองตัว → แปลงเป็นค่าบวก → คูณแบบไม่มีเครื่องหมาย → ถ้าเครื่องหมายตั้งต้นต่างกัน ให้กลับเครื่องหมายผล (two's complement ของ 2n บิต)
- interactive `SignedMultiply`: input 4 บิตแบบ two's complement (-8 ถึง 7) → StepPlayer: เครื่องหมาย → ขนาด → ผลคูณไม่มีเครื่องหมาย → กลับเครื่องหมาย (ถ้าต้อง) → ผล 8 บิต (บิต + ฐานสิบ) · ตัวอย่าง: (-2) × 3, 7 × (-8), (-8) × (-8), (-1) × (-1)
- `Callout` "รู้ไว้": Booth's algorithm คูณเลขมีเครื่องหมายได้โดยตรงโดยดูบิตทีละคู่ (1 ย่อหน้า ไม่ต้องมี simulator)

### 3.5 `faster`: คูณให้เร็วขึ้น (ภาพรวม)
- แทนที่จะใช้ adder ตัวเดียววน 32 รอบ ให้ใช้ adder หลายตัวบวก partial product พร้อมกันเป็นต้นไม้: 32 ตัวใช้ log2(32) = 5 ชั้น แทน 32 ครั้งต่อกัน · ภาพต้นไม้วาดเองแบบ 8 partial product (3 ชั้น) ให้อ่านง่าย + StepPlayer 3 ขั้นเห็นการบวกทีละชั้น
- ข้อแลกเปลี่ยน: ใช้ hardware มากขึ้นมาก (adder 31 ตัว) แต่เร็วขึ้นและทำเป็น pipeline ได้

### 3.6 `mips`: การคูณใน MIPS
- MIPS มี register พิเศษ HI และ LO (รวม 64 บิต) · `mult rs, rt` (มีเครื่องหมาย) และ `multu rs, rt` (ไม่มีเครื่องหมาย): {HI, LO} = R[rs] × R[rt] · `mfhi rd` / `mflo rd` ย้ายผลไปไว้ใน register ปกติ
- รหัสเครื่อง: R-format opcode 0 · funct 0x18 (`mult`) / 0x19 (`multu`) · rd = shamt = 0 → แสดงด้วย `BitRow` สี `mips-*` โดยคำนวณจากฟังก์ชันใน `src/lib/multiply/mips.ts` (ห้ามพิมพ์ bit เอง) · ใช้ `mult $t0, $t1` เป็นตัวอย่าง
- ทำไมไม่มี overflow exception: ผล 64 บิตใส่ HI/LO ได้ครบเสมอ · ถ้าโปรแกรมจะใช้แค่ LO ต้องตรวจเอง: `multu` ไม่ล้นถ้า HI = 0 · `mult` ไม่ล้นถ้าทุกบิตของ HI เท่ากับบิต 31 ของ LO
- interactive `MipsMultPlayground`: ใส่ 2 จำนวน 32 บิต (ฐานสิบมีเครื่องหมาย หรือ hex) + เลือก `mult`/`multu` → แสดง R[rs], R[rt] (`BitRow` 32 บิต), ผล 64 บิตแบ่งเป็น HI | LO, ค่า HI/LO เป็น hex และฐานสิบ, ผลตรวจ "ใช้แค่ LO ได้ไหม" พร้อมเหตุผล · ปุ่มตัวอย่าง (ค่าที่ต้องได้อยู่ในหัวข้อ 6.4)
- ปุ่ม `OpenInSim`: `mult-div` ("ดู mult, multu, mfhi, mflo ทำงานทีละคำสั่ง") และ `shift-add-multiply` ("อัลกอริทึมรุ่นปรับปรุงเขียนเป็นโปรแกรม MIPS: ใช้ sltu หา carry")
- `Callout` เชื่อม Floating-Point: "การคูณ Significand ของ Floating-Point (บทที่ 5) ใช้ shift-and-add แบบเดียวกับหน้านี้" → ลิงก์ `/floating-point/mul-div`

### 3.7 `talking`: ประเด็นสำหรับอธิบาย (`TalkingPoints`)
1. คูณฐานสองคือการบวก partial product ที่เป็น 0 หรือ Multiplicand ที่เลื่อนแล้ว ฮาร์ดแวร์จึงใช้แค่ adder กับ shifter
2. n บิต × n บิต ได้ผลยาวสุด 2n บิต MIPS จึงเก็บผลใน HI และ LO รวม 64 บิต
3. รุ่นแรกใช้ register และ ALU กว้าง 64 บิต ทำ 32 รอบ รอบละ 3 ขั้น: ทดสอบและบวก เลื่อน Multiplicand ซ้าย เลื่อน Multiplier ขวา
4. รุ่นปรับปรุงใช้ ALU 32 บิต เก็บ Multiplier ไว้ครึ่งขวาของ Product แล้วเลื่อน Product ไปทางขวา ต้องมีบิต carry เพิ่มอีก 1 บิต
5. เลขมีเครื่องหมาย: คูณขนาดแบบไม่มีเครื่องหมาย แล้วกลับเครื่องหมายถ้าเครื่องหมายตั้งต้นต่างกัน
6. `mult`/`multu` ไม่ตรวจ overflow: ถ้าจะใช้ผลแค่ 32 บิตต้องตรวจ HI เอง

### 3.8 `selfcheck`: คำถามชวนคิด (`SelfCheck` · ตัวเลขในเฉลยต้องคำนวณจากโมเดล)
1. คูณ 4 บิต × 4 บิตด้วยฮาร์ดแวร์รุ่นแรก ต้องทำกี่รอบ และ Product ต้องกว้างกี่บิต (4 รอบ, 8 บิต)
2. ใน 2 × 3 รอบที่ 3 ทำไม Product ไม่เปลี่ยน (บิตขวาสุดของ Multiplier เป็น 0 จึงไม่บวก)
3. ทำไมรุ่นปรับปรุงไม่ต้องมี register Multiplier แยก (บิตของ Multiplier ถูกใช้แล้วเลื่อนออกทางขวาทีละบิต ที่ว่างตรงนั้นพอดีกับบิตของผลคูณที่เลื่อนเข้ามา)
4. 13 × 11 ด้วยรุ่นปรับปรุง ถ้าไม่มีบิต carry จะได้เท่าไร และผิดเพราะอะไร (111 แทน 143 เพราะบิตที่ทดออกจากครึ่งซ้ายหายไป)
5. `mult $t0, $t1` เมื่อ `$t0` = `$t1` = 100000 ใช้ `mflo` อย่างเดียวได้ไหม (ไม่ได้: HI = 2 ไม่ใช่ 0 แปลว่าผลเกิน 32 บิต)

### 3.9 `summary`: สรุปท้ายบท (`Summary` · 5 ข้อสั้น ๆ ตามวัตถุประสงค์ข้อ 1–5)

---

## 4. โมเดล `src/lib/multiply/`
- ฟังก์ชันล้วน (pure) ใช้ `bigint` ทั้งหมด · ความกว้าง n ที่ UI ใช้คือ 4 และ 8 แต่ฟังก์ชันต้องถูกสำหรับ n = 1..32 · ไม่มี React ในโฟลเดอร์นี้
- **ค่าในแต่ละแถวคือสถานะหลังทำขั้นนั้นแล้ว** (ตรงกับ golden)
```ts
export type MulV1Step = 'init' | '1' | '1a' | '2' | '3';
export interface MulV1Row {
  iteration: number;            // 0 = init, 1..n
  step: MulV1Step;              // '1' = บิตเป็น 0 ไม่บวก, '1a' = บวก
  multiplier: bigint;           // n บิต
  multiplicand: bigint;         // 2n บิต
  product: bigint;              // 2n บิต
  testBit: 0 | 1;               // Multiplier0 ที่ control ใช้ในรอบนี้
  changed: Array<'multiplier' | 'multiplicand' | 'product'>;
}
export function traceMulV1(multiplicand: bigint, multiplier: bigint, n: number): MulV1Row[];

export type MulV2Step = 'init' | '1' | '1a' | '2';
export interface MulV2Row {
  iteration: number;
  step: MulV2Step;
  multiplicand: bigint;         // n บิต
  product: bigint;              // 2n บิต (ครึ่งซ้าย = ผลบวกสะสม, ครึ่งขวา = Multiplier ที่เหลือ + บิตผลคูณที่เลื่อนเข้ามา)
  carry: 0 | 1;                 // carry ที่ ALU ทดออกในขั้น 1a (ขั้นอื่นเป็น 0)
  testBit: 0 | 1;               // Product0 ที่ control ใช้ในรอบนี้
}
export function traceMulV2(multiplicand: bigint, multiplier: bigint, n: number, opts?: { keepCarry?: boolean }): MulV2Row[];

export function longMultiplication(a: bigint, b: bigint, n: number): { partials: { bit: number; used: boolean; value: bigint }[]; product: bigint };
export function signedMultiply(a: bigint, b: bigint, n: number): {
  negA: boolean; negB: boolean; magA: bigint; magB: bigint;
  unsignedProduct: bigint; negate: boolean; product: bigint; productBits: string; // 2n บิต
};
export function mipsMult(rs: number, rt: number, signed: boolean): { hi: number; lo: number; fitsInLo: boolean };
export function encodeMult(op: 'mult' | 'multu', rs: number, rt: number): number; // R-format
```
- กติกาแต่ละขั้น:
  - **v1** · init: Multiplicand = ตัวตั้ง (อยู่ครึ่งขวาของ 2n บิต), Multiplier = ตัวคูณ, Product = 0 · ทุกรอบ i = 1..n: ถ้า Multiplier0 = 1 → `1a` Product = (Product + Multiplicand) mod 2^(2n) ไม่งั้น `1` (ไม่เปลี่ยน) → `2` Multiplicand = (Multiplicand << 1) mod 2^(2n) → `3` Multiplier = Multiplier >> 1
  - **v2** · init: Product = {n บิต 0, ตัวคูณ}, carry = 0 · ทุกรอบ: ถ้า Product0 = 1 → `1a` sum = ครึ่งซ้าย + Multiplicand, carry = บิตที่ n ของ sum, ครึ่งซ้าย = sum mod 2^n ไม่งั้น `1` → `2` Product = (carry << (2n - 1)) | (Product >> 1), carry = 0 · `keepCarry: false` ทิ้ง carry (ใช้สอนว่าทำไมต้องมี)
  - **signed**: ขนาดของ -8 ใน 4 บิตคือ 8 (ต้องคิดด้วย bigint ไม่ใช่ตัด n บิต) · ผล = ±(magA × magB) เขียนเป็น two's complement 2n บิต
  - **mipsMult**: signed ใช้ `BigInt.asIntN(32, …)` ก่อนคูณ · ผล 64 บิต → hi = บิตบน 32, lo = บิตล่าง 32 · `fitsInLo`: signed → ผลอยู่ใน -2^31..2^31-1 (เทียบเท่า HI เท่ากับบิตเครื่องหมายของ LO ขยายเต็ม) · unsigned → HI = 0
- ข้อความแต่ละขั้น (ทำอะไร/ทำไม) อยู่ใน `src/content/multiply/step-text.ts` เป็นฟังก์ชันที่รับแถวแล้วคืนข้อความ

---

## 5. Component (`src/components/multiply/`)
| component | ใช้ใน | หมายเหตุ |
|---|---|---|
| `operand-inputs.tsx` | ทุก simulator | ช่องฐานสิบ + แถวบิตแตะสลับได้ · สลับ 4/8 บิต · ตรวจช่วง ข้อความไทย "ใส่จำนวนเต็ม 0 ถึง 15" · ช่องพิมพ์ ≥ 16px บนมือถือ |
| `long-multiplication.tsx` | 3.1 | |
| `hw-v1.tsx` / `hw-v2.tsx` | 3.2 / 3.3 | ภาพฮาร์ดแวร์ SVG รับ `active` ต่อชิ้นจากแถวปัจจุบัน |
| `multiplier-v1.tsx` / `multiplier-v2.tsx` | 3.2 / 3.3 | StepPlayer + ภาพ + register + ตาราง trace + ข้อความ · ครอบด้วย `ToolBoundary` |
| `trace-table.tsx` | 3.2 / 3.3 | แสดงแถวถึงขั้นปัจจุบัน แถวปัจจุบันไฮไลต์ · มือถือเลื่อนแนวนอนในกรอบของตาราง |
| `signed-multiply.tsx` | 3.4 | |
| `adder-tree.tsx` | 3.5 | |
| `mips-mult-playground.tsx` | 3.6 | |
- StepPlayer: steps มาจากแถวของ trace (id = `${iteration}-${step}`) · `flow` = กล่องใน flowchart · presentation mode ใช้ได้ทันที (ของเดิม) · คีย์บอร์ด ← → Space
- มือถือ 390px: ภาพฮาร์ดแวร์ย่อตาม `viewBox` · register เรียงลงมา · 8 บิตใช้ `BitRow size="sm"` · ห้ามทั้งหน้าเลื่อนแนวนอน
- Could: จำค่า input ใน URL (`?a=13&b=11&n=4&v=2`) ให้แชร์ลิงก์ได้

---

## 6. Golden (ค่าที่ต้องได้ · ไฟล์จริงคือ `docs/plans/golden/multiply-traces.json` ตารางนี้เพื่ออ่านง่าย)
ตรวจแล้ว: โมเดลอ้างอิงให้ผลคูณถูกทุกคู่ 4 บิตและ 8 บิต และสุ่ม 20,000 คู่ 32 บิต · ตาราง 6.1 ตรงกับตัวอย่าง 2 × 3 ในตำรา

### 6.1 รุ่นแรก 2 × 3 (n = 4 · 13 แถว)
| รอบ | ขั้น | Multiplier | Multiplicand | Product |
|---|---|---|---|---|
| 0 | init | 0011 | 0000 0010 | 0000 0000 |
| 1 | 1a | 0011 | 0000 0010 | 0000 0010 |
| 1 | 2 | 0011 | 0000 0100 | 0000 0010 |
| 1 | 3 | 0001 | 0000 0100 | 0000 0010 |
| 2 | 1a | 0001 | 0000 0100 | 0000 0110 |
| 2 | 2 | 0001 | 0000 1000 | 0000 0110 |
| 2 | 3 | 0000 | 0000 1000 | 0000 0110 |
| 3 | 1 | 0000 | 0000 1000 | 0000 0110 |
| 3 | 2 | 0000 | 0001 0000 | 0000 0110 |
| 3 | 3 | 0000 | 0001 0000 | 0000 0110 |
| 4 | 1 | 0000 | 0001 0000 | 0000 0110 |
| 4 | 2 | 0000 | 0010 0000 | 0000 0110 |
| 4 | 3 | 0000 | 0010 0000 | 0000 0110 |

### 6.2 รุ่นปรับปรุง 2 × 3 (9 แถว)
| รอบ | ขั้น | Multiplicand | carry | Product |
|---|---|---|---|---|
| 0 | init | 0010 | 0 | 0000 0011 |
| 1 | 1a | 0010 | 0 | 0010 0011 |
| 1 | 2 | 0010 | 0 | 0001 0001 |
| 2 | 1a | 0010 | 0 | 0011 0001 |
| 2 | 2 | 0010 | 0 | 0001 1000 |
| 3 | 1 | 0010 | 0 | 0001 1000 |
| 3 | 2 | 0010 | 0 | 0000 1100 |
| 4 | 1 | 0010 | 0 | 0000 1100 |
| 4 | 2 | 0010 | 0 | 0000 0110 |

### 6.3 รุ่นปรับปรุง 13 × 11 (มี carry · ผล 1000 1111 = 143)
| รอบ | ขั้น | Multiplicand | carry | Product |
|---|---|---|---|---|
| 0 | init | 1101 | 0 | 0000 1011 |
| 1 | 1a | 1101 | 0 | 1101 1011 |
| 1 | 2 | 1101 | 0 | 0110 1101 |
| 2 | 1a | 1101 | 1 | 0011 1101 |
| 2 | 2 | 1101 | 0 | 1001 1110 |
| 3 | 1 | 1101 | 0 | 1001 1110 |
| 3 | 2 | 1101 | 0 | 0100 1111 |
| 4 | 1a | 1101 | 1 | 0001 1111 |
| 4 | 2 | 1101 | 0 | 1000 1111 |
- ถ้าปิด carry (`keepCarry: false`) 13 × 11 ได้ 111 (ผิด) · golden มี 13 × 11 ของรุ่นแรกด้วย (ผลสุดท้าย 1000 1111)

### 6.4 เลขมีเครื่องหมาย (n = 4 → ผล 8 บิต) และ MIPS
| a × b | ผล | บิต |
|---|---|---|
| (-2) × 3 | -6 | 1111 1010 |
| 7 × (-8) | -56 | 1100 1000 |
| (-8) × (-8) | 64 | 0100 0000 |
| (-1) × (-1) | 1 | 0000 0001 |

| คำสั่ง | R[rs], R[rt] | HI | LO | ใช้แค่ LO ได้ไหม |
|---|---|---|---|---|
| `mult` | -3, 5 | 0xFFFFFFFF | 0xFFFFFFF1 | ได้ (-15) |
| `multu` | 0xFFFFFFFF, 2 | 0x00000001 | 0xFFFFFFFE | ไม่ได้ (HI ≠ 0) |
| `mult` | 0xFFFFFFFF (= -1), 2 | 0xFFFFFFFF | 0xFFFFFFFE | ได้ (-2) |
| `mult` | 100000, 100000 | 0x00000002 | 0x540BE400 | ไม่ได้ (ผล 10,000,000,000 เกิน 32 บิต) |
- 2 แถวแรกตรงกับผลของโปรแกรม `mult-div` บน Unicorn (`$s0`–`$s3`) · 2 แถวหลังคำนวณด้วย BigInt · ตัวอย่าง `multu` กับ `mult` บนบิตชุดเดียวกัน (0xFFFFFFFF × 2) ใช้อธิบายว่ามี/ไม่มีเครื่องหมายต่างกันอย่างไร

---

## 7. Testing
- unit (`tests/unit/multiply/`, Vitest · coverage `src/lib/multiply/**` ≥ 95%):
  - golden: อ่าน `docs/plans/golden/multiply-traces.json` ด้วย `fs` → `traceMulV1`/`traceMulV2` ต้องได้ทุกแถวตรง (iteration, step, ทุก register เป็น bit string, carry) · `signedMultiply` ตรงกับรายการ `signed`
  - exhaustive: ทุกคู่ของ n = 4 และ n = 8 → ผลสุดท้ายของ v1 และ v2 = a × b · จำนวนแถว v1 = 1 + 3n, v2 = 1 + 2n · v2 ที่ `keepCarry: false` ต้องผิดอย่างน้อย 1 คู่ (เช่น 13 × 11 = 111)
  - property (fast-check, `numRuns: 1000`): n สุ่ม 1..32, a และ b สุ่มใน 0..2^n-1 → v1, v2 ถูก · `signedMultiply` ถูกทุกค่าใน -2^(n-1)..2^(n-1)-1 · `mipsMult` ตรงกับ BigInt ทั้ง signed/unsigned และ `fitsInLo` ตรงนิยาม · `encodeMult` ตรงกับ `0x01090018` สำหรับ `mult $t0, $t1` (ค่านี้ใช้ได้เพราะ rs = 8, rt = 9, funct = 0x18)
- e2e (`tests/e2e/multiply.spec.ts`, pixel7 + iphone13 + desktop):
  1. `/multiply` ไม่มีข้อความ "กำลังพัฒนา" · TOC มีทุก section ใน 3.1–3.9
  2. v1 กดตัวอย่าง 2 × 3 → เล่นจนจบ → Product แสดง 0000 0110 และตาราง trace มี 13 แถว · ← → ใช้ได้
  3. v2 13 × 11 → รอบ 2 ขั้น 1a carry = 1 · ปิด carry แล้วผลเป็น 111
  4. signed (-2) × 3 → 1111 1010
  5. MIPS playground `mult` -3, 5 → HI 0xFFFFFFFF, LO 0xFFFFFFF1
  6. ปุ่ม `OpenInSim`: ถ้า `mips` ready ต้องลิงก์ `/mips?example=mult-div` และ `/mips?example=shift-add-multiply` ถ้ายังไม่ ready ต้อง disabled (อ่านสถานะจาก `TOPICS` ห้าม hardcode)
  7. `SelfCheck` เปิดเฉลยได้ด้วยคีย์บอร์ด · โหมดนำเสนอของ StepPlayer ใช้ได้
  8. ไม่มี console error · axe ไม่มี serious/critical · มือถือไม่เลื่อนแนวนอนทั้งหน้า

---

## 8. Phase และ Definition of Done
| phase | งาน | DoD |
|---|---|---|
| 2A โมเดล | `src/lib/multiply/` + `src/content/multiply/step-text.ts` + unit test ทั้งหมด | golden, exhaustive, property ผ่าน · coverage ≥ 95% |
| 2B หน้า + รุ่นแรก | `src/app/multiply/page.tsx` (metadata title "การคูณแบบ MIPS"), `LessonLayout`, 3.1 และ 3.2 ครบ (ภาพ, simulator, ตาราง, ข้อความ) | e2e ข้อ 1–2 ผ่าน · screenshot 390/1440 เปิดดูแล้ว |
| 2C รุ่นปรับปรุง ถึง MIPS | 3.3–3.6 + `OpenInSim` + ลิงก์ Floating-Point | e2e ข้อ 3–6 ผ่าน |
| 2D ปิดหัวข้อ | 3.7–3.9, ศัพท์ใน `src/content/glossary/multiply.ts`, ตรวจภาษา · เปลี่ยน `multiply` เป็น `ready` ใน `topics.ts` | e2e ทั้งหมดผ่าน (รวม `tests/e2e/hub.spec.ts` ของ WP-0) · build static · review 3 รอบ (PLAN.md 11) · PR เปิดแล้ว |

---

## 9. คำถามตั้งต้น (ใส่ในไฟล์ progress แล้วทำต่อด้วยค่าที่สมมติ)
| # | ระดับ | คำถาม | ค่าที่ใช้ไปก่อน |
|---|---|---|---|
| WP2-Q1 | ยืนยันค่าเริ่มต้น | simulator ใช้ 4 บิตเป็นค่าเริ่มต้น เลือก 8 บิตได้ (32 บิตใช้เฉพาะส่วน MIPS) | ตามนั้น |
| WP2-Q2 | ไม่ด่วน | ต้องการ Booth's algorithm แบบมี simulator ไหม | ไม่ทำ มีแค่กล่อง "รู้ไว้" |
| WP2-Q3 | ไม่ด่วน | อาจารย์อยากให้มีแบบฝึกหัดให้นักศึกษากรอกตาราง trace เองไหม | ไม่ทำ (Could) |
