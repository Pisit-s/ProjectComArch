# WP-3: การหารแบบ MIPS (`/divide`)

> ผู้รับผิดชอบ: เพื่อนในกลุ่ม (ใส่ชื่อในไฟล์ progress) · branch `wp3-divide` · progress `docs/progress/wp3-divide.md` · เขียนเมื่อ 31 ต.ค. 2569
> อ่านคู่กับ `PLAN.md` หัวข้อ 0–6 และ 11 และ `docs/TEAM.md` · เริ่มได้หลัง WP-0 merge แล้ว · ทำพร้อมกับ WP-2 (การคูณ) ได้ เพราะแก้คนละโฟลเดอร์ (ถ้าอยากให้หน้าตาเข้ากัน ให้เปิดดู branch `wp2-multiply` ได้ แต่ห้าม import โค้ดจากโฟลเดอร์ของ WP-2)
> เนื้อหาอ้างอิง: Patterson & Hennessy, *Computer Organization and Design* (4th ed.) หัวข้อ 3.4 Division · คำสั่ง `div`, `divu`, `mfhi`, `mflo` จาก MIPS Reference Data (`EMIPS.pdf`) · **ห้ามคัดลอกรูป ตาราง หรือข้อความจากตำรา** (วาดและเขียนเอง อ้างอิงแค่หมายเลขหัวข้อ)
> golden: `docs/plans/golden/divide-traces.json` · โปรแกรม MIPS ที่เกี่ยวข้อง: `docs/plans/golden/mips/restoring-divide.s`, `div-signs.s`, `mult-div.s`

## สารบัญ
- 0. เป้าหมาย
- 1. ก่อนเริ่ม
- 2. วัตถุประสงค์การเรียนรู้
- 3. โครงหน้าและเนื้อหา
- 4. โมเดล `src/lib/divide/`
- 5. Component
- 6. Golden (ค่าที่ต้องได้)
- 7. Testing
- 8. Phase และ Definition of Done
- 9. คำถามตั้งต้น

---

## 0. เป้าหมาย
- หน้า `/divide` สอนการหารจำนวนเต็มฐานสองแบบที่ฮาร์ดแวร์ของ MIPS ทำ ตามลำดับในตำรา: หารยาวด้วยมือ → ฮาร์ดแวร์รุ่นแรก (restoring) → รุ่นปรับปรุง → เลขมีเครื่องหมาย → ทำให้เร็วขึ้น → คำสั่งของ MIPS
- หัวใจ: **simulator ฮาร์ดแวร์การหารทีละขั้น** ที่ค่าทุกขั้นตรงกับตัวอย่างในตำราทุกบิต และมีคำอธิบาย "ทำอะไร/ทำไม" ที่คนนำเสนออ่านได้ทันที
- อาจารย์ให้คะแนนจากการอธิบายได้ (PLAN.md 1) → ทุกขั้นต้องตอบได้ว่า "ทำไมทำแบบนี้" (เช่น ทำไมต้องบวกคืน, ทำไมรุ่นแรกทำ n + 1 รอบ) และท้ายหน้ามีประเด็นสำหรับอธิบายกับคำถามชวนคิด

## 1. ก่อนเริ่ม
- WP-0 เตรียมไว้ให้แล้ว: `src/app/divide/page.tsx` (ตอนนี้เป็นหน้า "กำลังพัฒนา" → แทนทั้งไฟล์ได้เลย), `src/content/glossary/divide.ts` (ว่าง), `docs/progress/wp3-divide.md`
- component ร่วมที่ต้องใช้ (PLAN.md 6.2 · เปิดดูตัวอย่างทุกชิ้นที่ `/dev/kit` ตอน `npm run dev`): `LessonLayout`, `Section`, `Summary`, `StepPlayer`, `BitRow`, `BitCell`, `TalkingPoints`, `SelfCheck`, `OpenInSim`, ชุด `src/components/hw/`, `Callout`, `Formula`, `Term`, `Glass`, `ToolBoundary`
- สีบทบาท (PLAN.md 6.1): Divisor = `md-operand` · Quotient = `md-step` · Remainder = `md-acc` · ผลของ ALU และบิตเครื่องหมายของผลลบ = `md-alu` · สิ่งที่ control ดูในขั้นนั้น = `md-test` · field ของคำสั่ง MIPS = `mips-*` (ชุดเดียวกับหน้าการคูณ คู่ที่ทำหน้าที่คล้ายกันจึงมีสีเดียวกัน)
- ดูวิธีที่บท Floating-Point ใช้ StepPlayer + engine + ข้อความแต่ละขั้นเป็นแบบอย่าง: `src/app/floating-point/mul-div/page.tsx`, `src/components/tools/fp-simulator.tsx`, `src/content/step-text.ts`
- ไฟล์ที่แก้ได้ (PLAN.md 3.3): `src/app/divide/**`, `src/lib/divide/**`, `src/components/divide/**`, `src/content/divide/**`, `src/content/glossary/divide.ts`, `tests/unit/divide/**`, `tests/e2e/divide.spec.ts`, `docs/progress/wp3-divide.md` + บรรทัด `status` ของ `divide` ใน `src/content/topics.ts` · **ห้ามเพิ่ม dependency** · ห้ามแก้ไฟล์ร่วม (ถ้าจำเป็นทำตาม PLAN.md 3.3)

## 2. วัตถุประสงค์การเรียนรู้ (ใส่ใน `LessonLayout`)
1. อธิบายได้ว่าการหารฐานสองคือการลองลบตัวหารทีละหลัก และความสัมพันธ์ Dividend = Quotient × Divisor + Remainder
2. ไล่ขั้นตอนของฮาร์ดแวร์การหารรุ่นแรก (restoring) ได้ทีละรอบ และอธิบายได้ว่าทำไมต้องบวกคืนเมื่อผลลบติดลบ
3. อธิบายได้ว่ารุ่นปรับปรุงประหยัดฮาร์ดแวร์และรอบอย่างไร
4. หารเลขมีเครื่องหมายได้ และบอกเครื่องหมายของผลหารและเศษได้ถูกต้อง
5. ใช้ `div`, `divu`, `mfhi`, `mflo` ได้ และรู้ว่า MIPS ไม่ตรวจการหารด้วยศูนย์ให้

---

## 3. โครงหน้าและเนื้อหา
หน้าเดียวยาวแบบบทของ Floating-Point (`LessonLayout` + `Section` · eyebrow "หัวข้อที่ 2" · เวลาอ่านประมาณ 20 นาที) · id ของ section ใช้ใน TOC

### 3.1 `intro`: หารยาวฐานสอง
- ทบทวนการหารยาวฐานสิบ แล้วชี้ว่าฐานสองง่ายกว่า: ในแต่ละหลักแค่ถามว่า "ตัวหารลบได้ไหม" ถ้าได้ บิตผลหารเป็น 1 แล้วลบ ถ้าไม่ได้ บิตผลหารเป็น 0
- ความสัมพันธ์ที่ต้องจำ: **Dividend = Quotient × Divisor + Remainder** และ 0 ≤ Remainder < Divisor (เลขไม่มีเครื่องหมาย)
- interactive `LongDivision`: ใส่ Dividend และ Divisor 4 บิต (ค่าเริ่มต้น 13 ÷ 3) → StepPlayer ทีละหลัก: ดึงบิตถัดไปลงมา → เทียบกับ Divisor → เขียนบิตผลหาร → ลบ (ถ้าได้) · ผลเป็นฐานสองและฐานสิบ พร้อมตรวจด้วยสูตรข้างบน · ปุ่มสุ่ม · Divisor = 0 ให้ข้อความ "หารด้วย 0 ไม่ได้ ดูว่า MIPS ทำอะไรในหัวข้อการหารใน MIPS"
- ใช้ `Term` กับ Dividend, Divisor, Quotient, Remainder ครั้งแรกที่เจอ

### 3.2 `hw-v1`: ฮาร์ดแวร์การหารรุ่นแรก (restoring division)
- ภาพฮาร์ดแวร์ (วาดเองด้วย `src/components/hw/`): Divisor (2n บิต เริ่มอยู่ครึ่งซ้าย เลื่อนขวา), ALU (2n บิต), Remainder (2n บิต เริ่มเป็น Dividend), Quotient (n บิต เลื่อนซ้าย), Control test (ดูว่าผลลบติดลบไหม) · บอกว่าของจริงใน MIPS คือ 64/64/64/32 บิต
- flowchart: เริ่ม → **1** Remainder = Remainder − Divisor → ผลติดลบไหม → **2a** ไม่ติดลบ: เลื่อน Quotient ซ้าย ใส่บิตขวาสุดเป็น 1 / **2b** ติดลบ: Remainder = Remainder + Divisor (บวกคืน = restore) แล้วเลื่อน Quotient ซ้าย ใส่ 0 → **3** เลื่อน Divisor ขวา 1 บิต → ครบ n + 1 รอบไหม → จบ
- **ทำไม n + 1 รอบ**: Divisor เริ่มที่ครึ่งซ้าย (เท่ากับ Divisor × 2^n) ซึ่งมากกว่า Dividend n บิตเสมอ รอบแรกจึงลบแล้วติดลบเสมอ บิตแรกของผลหารเป็น 0 เสมอ (รอบที่เสียไปฟรี ๆ ซึ่งรุ่นปรับปรุงตัดออก)
- interactive `DividerV1` (หัวใจของหน้า):
  - input: Dividend และ Divisor 4 บิต (0–15 และ 1–15, ค่าเริ่มต้น) หรือ 8 บิต · พิมพ์ฐานสิบหรือแตะบิต · ปุ่มตัวอย่าง "7 ÷ 2 (ตัวอย่างในตำรา)", "13 ÷ 3", "15 ÷ 1", "สุ่ม"
  - 1 ขั้นของ StepPlayer = 1 แถวของ trace (init แล้วรอบละ 3 ขั้น: 1, 2a หรือ 2b, 3)
  - แสดง: ภาพฮาร์ดแวร์ไฮไลต์ส่วนที่ทำงาน · register ด้วย `BitRow` สีตามบทบาท บิตที่เปลี่ยนไฮไลต์ · ในขั้น 1 แสดงผลของ ALU เป็นค่าฐานสิบมีเครื่องหมายและป้าย "ติดลบ"/"ไม่ติดลบ" (สี `md-test`) · ตาราง trace สะสม (รอบ, ขั้น, Quotient, Divisor, Remainder)
  - คำอธิบายแต่ละขั้นสร้างจากข้อมูลของแถว เช่น "รอบที่ 1 ขั้น 1: Remainder − Divisor = 7 − 32 = −25 ติดลบ แปลว่า Divisor ยังใหญ่เกิน" · ขั้น 2b: "บวก Divisor คืนให้ Remainder กลับเป็น 7 แล้วใส่ 0 เป็นบิตผลหาร" · ขั้น 3: "เลื่อน Divisor ขวา 1 บิต เพื่อลองลบที่หลักถัดไป"
  - **เครื่องหมายของผลลบ**: ฮาร์ดแวร์ต้องรู้เครื่องหมายจริงของผลลบ (ALU ต้องมีบิตเพิ่มอีก 1 บิต) · โมเดลคิดเครื่องหมายจากค่าจริง · มีสวิตช์ขั้นสูง "ดูแค่บิตซ้ายสุดของ Remainder 2n บิต" ที่ทำให้เห็นว่าถ้าไม่มีบิตเพิ่ม บางคู่จะผิด เช่น 7 ÷ 15 ได้ผลหาร 1 เศษ 8 (ที่ถูกคือ 0 เศษ 7) เพราะ 7 − 240 ติดลบเกินช่วงของ 8 บิตแบบมีเครื่องหมาย (ตัวอย่างในตำรา 7 ÷ 2 ไม่เจอปัญหานี้)

### 3.3 `hw-v2`: ฮาร์ดแวร์รุ่นปรับปรุง
- สิ่งที่เปลี่ยน: Divisor และ ALU เหลือ n บิต · ไม่มี register Quotient แยก: Remainder 2n บิตเก็บ "เศษ" ไว้ครึ่งซ้าย และ Dividend ไว้ครึ่งขวา ซึ่งค่อย ๆ กลายเป็น Quotient · เลื่อน Remainder ไปทางซ้ายแทนการเลื่อน Divisor ไปทางขวา · ทำ n รอบ (ไม่เสียรอบแรกแบบรุ่นแรก)
- ลำดับในแต่ละรอบที่แผนนี้ใช้ (ให้ผลเท่ากับลำดับแบบอื่นทุกบิต ถ้าอาจารย์สอนลำดับอื่นให้ปรับข้อความตาม WP3-Q2): **1** เลื่อน Remainder ทั้ง 2n บิตไปทางซ้าย 1 บิต → **2** ครึ่งซ้าย = ครึ่งซ้าย − Divisor → **3a** ไม่ติดลบ: ใส่บิตขวาสุดเป็น 1 / **3b** ติดลบ: บวก Divisor คืนให้ครึ่งซ้าย ใส่บิตขวาสุดเป็น 0 → ครบ n รอบไหม → จบ: ครึ่งซ้าย = Remainder, ครึ่งขวา = Quotient
- ALU ต้องรู้เครื่องหมายจริงของผลลบเหมือนรุ่นแรก (ตำราบอกว่า Remainder ของจริงควรมี 65 บิตเพื่อไม่ให้ตัวทดหาย)
- interactive `DividerV2`: input แบบเดียวกับ v1 · 1 ขั้นของ StepPlayer = 1 แถวของ trace (init แล้วรอบละ 3 ขั้น) · Remainder แสดงด้วย `BitRow` แบบแบ่งครึ่ง (`split`) และระบายครึ่งขวาเป็นสี Quotient ตามจำนวนบิตผลหารที่เกิดแล้ว · ขั้น 2 แสดงผลของ ALU เป็นค่าฐานสิบมีเครื่องหมาย + ป้ายติดลบ · ภาพฮาร์ดแวร์รุ่นปรับปรุง · ตาราง trace สะสม
- ตารางเทียบ v1 กับ v2: ความกว้าง Divisor, ALU, Remainder · จำนวน register · ทิศการเลื่อน · จำนวนรอบ (n + 1 กับ n)

### 3.4 `signed`: หารเลขมีเครื่องหมาย
- วิธีตามตำรา: จำเครื่องหมาย → หารขนาดแบบไม่มีเครื่องหมาย → **ผลหารติดลบเมื่อเครื่องหมายของ Dividend กับ Divisor ต่างกัน** → **เศษมีเครื่องหมายเดียวกับ Dividend เสมอ**
- ทำไมเศษต้องตาม Dividend: เพื่อให้ Dividend = Quotient × Divisor + Remainder ยังจริง และ (−x) ÷ y ได้ผลหารเป็นลบของ x ÷ y พอดี (ผลไม่ขึ้นกับเครื่องหมายแบบแปลก ๆ)
- ตาราง 4 กรณี ±7 ÷ ±2 (ค่าในหัวข้อ 6.4) พร้อมแถวตรวจสูตร
- interactive `SignedDivide`: input 4 บิตแบบ two's complement (Dividend −8..7, Divisor −8..7 ยกเว้น 0) → StepPlayer: เครื่องหมาย → ขนาด → หารแบบไม่มีเครื่องหมาย → ใส่เครื่องหมายผลหารและเศษ → ตรวจสูตร · กรณี (−8) ÷ (−1) = 8 ให้แสดงว่า "ผลหารเกินช่วงของ 4 บิต (overflow)" และเชื่อมไปกรณี 0x80000000 ÷ −1 ของ MIPS

### 3.5 `faster`: หารให้เร็วขึ้น (ภาพรวม)
- หารทำเป็นต้นไม้แบบการคูณไม่ได้ เพราะแต่ละรอบต้องรู้ผล (ติดลบไหม) ของรอบก่อน
- แนวคิดที่ใช้จริง (ย่อหน้าละ 2–3 ประโยค ไม่ต้องมี simulator): **nonrestoring division** ไม่บวกคืนทันทีแต่รอบถัดไปใช้การบวกแทนการลบ (ประหยัดขั้น) · **SRT division** เดาบิตผลหารหลายบิตต่อรอบจากตาราง lookup โดยดูบิตบน ๆ ของ Remainder และ Divisor
- `Callout` เรื่องเล่า: ความผิดพลาดของตาราง lookup ในตัวหาร SRT ของ Intel Pentium (1994) ทำให้การหารบางค่าผิด เป็นตัวอย่างว่าฮาร์ดแวร์คำนวณต้องทดสอบละเอียด (เขียนเอง สั้น ๆ)

### 3.6 `mips`: การหารใน MIPS
- `div rs, rt` (มีเครื่องหมาย) และ `divu rs, rt` (ไม่มีเครื่องหมาย): **LO = Quotient, HI = Remainder** (ใช้ HI/LO ชุดเดียวกับการคูณ) · `mflo rd` / `mfhi rd` ย้ายผลไปไว้ใน register ปกติ
- รหัสเครื่อง: R-format opcode 0 · funct 0x1a (`div`) / 0x1b (`divu`) · rd = shamt = 0 → แสดงด้วย `BitRow` สี `mips-*` โดยคำนวณจากฟังก์ชันใน `src/lib/divide/mips.ts` (ห้ามพิมพ์ bit เอง) · ใช้ `div $t0, $t1` เป็นตัวอย่าง
- **MIPS ไม่ตรวจอะไรให้**: หารด้วยศูนย์ไม่เกิด exception (ผลไม่นิยาม) และ 0x80000000 ÷ −1 ก็ไม่ตรวจ → โปรแกรมต้องตรวจเอง แสดง code ตัวอย่างการตรวจตัวหารก่อนหาร (`beq $t1, $zero, div_by_zero` แล้วค่อย `div`)
- interactive `MipsDivPlayground`: ใส่ 2 จำนวน 32 บิต (ฐานสิบมีเครื่องหมาย หรือ hex) + เลือก `div`/`divu` → แสดง R[rs], R[rt], LO (ผลหาร) และ HI (เศษ) เป็น hex และฐานสิบ พร้อมตรวจสูตร · Divisor = 0 หรือ 0x80000000 ÷ −1 → ป้ายเตือน "ผลไม่นิยามตามสเปก" และบอกว่า MIPS Simulator ของเว็บนี้คง HI/LO เดิมไว้ (กรณีหาร 0) หรือให้ LO = 0x80000000, HI = 0 (กรณีเกินช่วง) · ปุ่มตัวอย่าง (ค่าที่ต้องได้ในหัวข้อ 6.4)
- ปุ่ม `OpenInSim`: `div-signs` ("กฎเครื่องหมายทั้ง 4 กรณีทีละคำสั่ง"), `mult-div` ("div, divu, mfhi, mflo"), `restoring-divide` ("อัลกอริทึมรุ่นปรับปรุงเขียนเป็นโปรแกรม MIPS: ใช้บิตที่ 33 แทน ALU ที่กว้างขึ้น")
- `Callout` เชื่อม Floating-Point: "การหาร Significand ของ Floating-Point (บทที่ 5) ใช้การหารยาวแบบเดียวกับหน้านี้ และเศษที่เหลือกลายเป็น Sticky bit" → ลิงก์ `/floating-point/mul-div`

### 3.7 `talking`: ประเด็นสำหรับอธิบาย (`TalkingPoints`)
1. หารฐานสองคือการลองลบ Divisor ทีละหลัก ลบได้บิตผลหารเป็น 1 ลบไม่ได้เป็น 0 และ Dividend = Quotient × Divisor + Remainder เสมอ
2. รุ่นแรก: Divisor 64 บิตเริ่มที่ครึ่งซ้ายแล้วเลื่อนขวา Remainder เริ่มเป็น Dividend Quotient เลื่อนซ้ายรับบิตใหม่ ทำ 33 รอบ (รอบแรกได้ 0 เสมอ)
3. restoring: ลบไปก่อน ถ้าติดลบค่อยบวกคืน ฮาร์ดแวร์จึงต้องรู้เครื่องหมายจริงของผลลบ (ต้องมีบิตเพิ่ม 1 บิต)
4. รุ่นปรับปรุง: ALU 32 บิต เก็บ Quotient ไว้ครึ่งขวาของ Remainder ทำ 32 รอบ: เลื่อนซ้าย → ลบ → ตั้งบิต
5. เลขมีเครื่องหมาย: หารขนาดแล้วแก้เครื่องหมาย ผลหารติดลบเมื่อเครื่องหมายต่างกัน และเศษมีเครื่องหมายเดียวกับ Dividend
6. MIPS: `div`/`divu` เก็บผลหารใน LO และเศษใน HI โดยไม่ตรวจการหารด้วยศูนย์หรือ overflow โปรแกรมต้องตรวจเอง

### 3.8 `selfcheck`: คำถามชวนคิด (`SelfCheck` · ตัวเลขในเฉลยต้องคำนวณจากโมเดล)
1. หาร 4 บิตด้วยรุ่นแรกต้องทำกี่รอบ ทำไมไม่ใช่ 4 (5 รอบ · รอบแรก Divisor อยู่ครึ่งซ้ายซึ่งใหญ่กว่า Dividend เสมอ บิตแรกของผลหารจึงเป็น 0)
2. ใน 7 ÷ 2 รอบที่ 1 ทำไมต้องบวก Divisor คืน (7 − 32 ติดลบ แปลว่าลบไม่ได้ บิตผลหารเป็น 0 และต้องคืนค่า Remainder เดิม)
3. −7 ÷ 2 ได้ผลหารและเศษเท่าไร และตรวจอย่างไร (ผลหาร −3 เศษ −1 · −3 × 2 + (−1) = −7)
4. ถ้าฮาร์ดแวร์รุ่นแรกดูแค่บิตซ้ายสุดของ Remainder 8 บิต แล้วหาร 7 ÷ 15 จะได้อะไร (ผลหาร 1 เศษ 8 ซึ่งผิด เพราะ 7 − 240 ติดลบเกินช่วง 8 บิตแบบมีเครื่องหมาย)
5. `div $t0, $t1` ตอน `$t1` = 0 MIPS ทำอะไร (ไม่เกิด exception ผลไม่นิยาม โปรแกรมต้องตรวจตัวหารเองก่อนหาร)

### 3.9 `summary`: สรุปท้ายบท (`Summary` · 5 ข้อสั้น ๆ ตามวัตถุประสงค์ข้อ 1–5)

---

## 4. โมเดล `src/lib/divide/`
- ฟังก์ชันล้วน (pure) ใช้ `bigint` ทั้งหมด · UI ใช้ n = 4 และ 8 แต่ฟังก์ชันต้องถูกสำหรับ n = 1..32 · ไม่มี React ในโฟลเดอร์นี้
- **ค่าในแต่ละแถวคือสถานะหลังทำขั้นนั้นแล้ว** (ตรงกับ golden) · register เก็บเป็น bit pattern ตามความกว้าง (ค่าติดลบเก็บเป็น two's complement ของความกว้างนั้น) และเก็บค่าจริงของผล ALU แยกไว้
```ts
export type DivV1Step = 'init' | '1' | '2a' | '2b' | '3';
export interface DivV1Row {
  iteration: number;             // 0 = init, 1..n+1
  step: DivV1Step;
  quotient: bigint;              // n บิต
  divisor: bigint;               // 2n บิต
  remainder: bigint;             // bit pattern 2n บิต
  aluValue?: bigint;             // ค่าจริงของ Remainder − Divisor (เฉพาะขั้น '1')
  negative?: boolean;            // เฉพาะขั้น '1'
}
export function traceDivV1(dividend: bigint, divisor: bigint, n: number, opts?: { signFromMsb?: boolean }): DivV1Row[];

export type DivV2Step = 'init' | '1' | '2' | '3a' | '3b';
export interface DivV2Row {
  iteration: number;             // 0 = init, 1..n
  step: DivV2Step;
  divisor: bigint;               // n บิต
  remLeft: bigint;               // bit pattern n บิต (ขั้น '2' คือผลลบที่เขียนลงไปก่อนตัดสินใจ)
  remRight: bigint;              // n บิต
  aluValue?: bigint;             // ค่าจริงของ ครึ่งซ้าย − Divisor (เฉพาะขั้น '2')
  negative?: boolean;            // เฉพาะขั้น '2'
}
export function traceDivV2(dividend: bigint, divisor: bigint, n: number): DivV2Row[];

export function longDivision(dividend: bigint, divisor: bigint, n: number): { steps: { bringDown: number; partial: bigint; fits: boolean; qBit: 0 | 1; after: bigint }[]; quotient: bigint; remainder: bigint };
export function signedDivide(a: bigint, b: bigint, n: number): {
  negA: boolean; negB: boolean; magA: bigint; magB: bigint;
  quotient: bigint; remainder: bigint; quotientBits: string; remainderBits: string; overflow: boolean;
};
export function mipsDiv(rs: number, rt: number, signed: boolean): { lo: number; hi: number; undefinedReason?: 'divide-by-zero' | 'overflow' };
export function encodeDiv(op: 'div' | 'divu', rs: number, rt: number): number; // R-format
```
- กติกาแต่ละขั้น:
  - **v1** · init: Divisor = divisor << n, Remainder = dividend, Quotient = 0 · ทุกรอบ i = 1..n+1: `1` Remainder = Remainder − Divisor (`negative` จากค่าจริง หรือจากบิตซ้ายสุดของ 2n บิตเมื่อ `signFromMsb: true`) → ไม่ติดลบ `2a` Quotient = ((Quotient << 1) | 1) mod 2^n · ติดลบ `2b` Remainder = Remainder + Divisor, Quotient = (Quotient << 1) mod 2^n → `3` Divisor = Divisor >> 1
  - **v2** · init: ครึ่งซ้าย = 0, ครึ่งขวา = dividend · ทุกรอบ i = 1..n: `1` เลื่อน {ครึ่งซ้าย, ครึ่งขวา} ซ้าย 1 บิต (บิตซ้ายสุดของครึ่งขวาเข้าไปเป็นบิตขวาสุดของครึ่งซ้าย) → `2` diff = ครึ่งซ้าย − Divisor (ครึ่งซ้ายแสดง pattern ของ diff) → ไม่ติดลบ `3a` ครึ่งซ้าย = diff, บิตขวาสุดของครึ่งขวา = 1 · ติดลบ `3b` ครึ่งซ้ายกลับเป็นค่าก่อนลบ, บิตขวาสุด = 0 · จบ: ครึ่งซ้าย = Remainder, ครึ่งขวา = Quotient
  - divisor = 0: `trace*` โยน error ที่มีข้อความไทย (UI กันไว้ก่อนแล้ว)
  - **signedDivide**: ผลหารปัดเข้าหา 0 · เศษมีเครื่องหมายเดียวกับ Dividend · `overflow` เมื่อผลหารไม่อยู่ใน −2^(n−1)..2^(n−1)−1
  - **mipsDiv**: ตาม PLAN/WP-1 3.5 · divisor 0 → `undefinedReason: 'divide-by-zero'` และคืน hi/lo เดิมไม่ได้ (ฟังก์ชันไม่มีสถานะ) จึงให้ UI แสดงคำเตือนแทนตัวเลข · 0x80000000 ÷ −1 → lo = 0x80000000, hi = 0, `undefinedReason: 'overflow'`
- ข้อความแต่ละขั้น (ทำอะไร/ทำไม) อยู่ใน `src/content/divide/step-text.ts` เป็นฟังก์ชันที่รับแถวแล้วคืนข้อความ

---

## 5. Component (`src/components/divide/`)
| component | ใช้ใน | หมายเหตุ |
|---|---|---|
| `operand-inputs.tsx` | ทุก simulator | ช่องฐานสิบ + แถวบิตแตะสลับได้ · สลับ 4/8 บิต · Divisor ห้ามเป็น 0 · ข้อความไทย · ช่องพิมพ์ ≥ 16px บนมือถือ |
| `long-division.tsx` | 3.1 | |
| `hw-v1.tsx` / `hw-v2.tsx` | 3.2 / 3.3 | ภาพฮาร์ดแวร์ SVG รับ `active` ต่อชิ้นจากแถวปัจจุบัน |
| `divider-v1.tsx` / `divider-v2.tsx` | 3.2 / 3.3 | StepPlayer + ภาพ + register + ผล ALU + ตาราง trace + ข้อความ · ครอบด้วย `ToolBoundary` |
| `trace-table.tsx` | 3.2 / 3.3 | แสดงแถวถึงขั้นปัจจุบัน แถวปัจจุบันไฮไลต์ · มือถือเลื่อนแนวนอนในกรอบของตาราง |
| `signed-divide.tsx` | 3.4 | |
| `mips-div-playground.tsx` | 3.6 | |
- StepPlayer: steps มาจากแถวของ trace (id = `${iteration}-${step}`) · `flow` = กล่องใน flowchart · presentation mode และคีย์บอร์ดใช้ได้ทันที
- มือถือ 390px: ภาพฮาร์ดแวร์ย่อตาม `viewBox` · register เรียงลงมา · 8 บิตใช้ `BitRow size="sm"` · ห้ามทั้งหน้าเลื่อนแนวนอน
- Could: จำค่า input ใน URL (`?a=7&b=2&n=4&v=1`)

---

## 6. Golden (ค่าที่ต้องได้ · ไฟล์จริงคือ `docs/plans/golden/divide-traces.json` ตารางนี้เพื่ออ่านง่าย)
ตรวจแล้ว: โมเดลอ้างอิงให้ผลหารและเศษถูกทุกคู่ 4 บิตและ 8 บิต (Divisor ≠ 0) และสุ่ม 20,000 คู่ 32 บิต · ตาราง 6.1 ตรงกับตัวอย่าง 7 ÷ 2 ในตำรา · คอลัมน์ "ติดลบ" คือ `negative` (ใส่เฉพาะขั้นที่ลบ)

### 6.1 รุ่นแรก 7 ÷ 2 (n = 4 · 16 แถว · ผลหาร 0011 เศษ 0001)
| รอบ | ขั้น | Quotient | Divisor | Remainder | ติดลบ |
|---|---|---|---|---|---|
| 0 | init | 0000 | 0010 0000 | 0000 0111 | |
| 1 | 1 | 0000 | 0010 0000 | 1110 0111 | ใช่ |
| 1 | 2b | 0000 | 0010 0000 | 0000 0111 | |
| 1 | 3 | 0000 | 0001 0000 | 0000 0111 | |
| 2 | 1 | 0000 | 0001 0000 | 1111 0111 | ใช่ |
| 2 | 2b | 0000 | 0001 0000 | 0000 0111 | |
| 2 | 3 | 0000 | 0000 1000 | 0000 0111 | |
| 3 | 1 | 0000 | 0000 1000 | 1111 1111 | ใช่ |
| 3 | 2b | 0000 | 0000 1000 | 0000 0111 | |
| 3 | 3 | 0000 | 0000 0100 | 0000 0111 | |
| 4 | 1 | 0000 | 0000 0100 | 0000 0011 | ไม่ |
| 4 | 2a | 0001 | 0000 0100 | 0000 0011 | |
| 4 | 3 | 0001 | 0000 0010 | 0000 0011 | |
| 5 | 1 | 0001 | 0000 0010 | 0000 0001 | ไม่ |
| 5 | 2a | 0011 | 0000 0010 | 0000 0001 | |
| 5 | 3 | 0011 | 0000 0001 | 0000 0001 | |

### 6.2 รุ่นปรับปรุง 7 ÷ 2 (13 แถว)
| รอบ | ขั้น | Divisor | ครึ่งซ้าย | ครึ่งขวา | ติดลบ |
|---|---|---|---|---|---|
| 0 | init | 0010 | 0000 | 0111 | |
| 1 | 1 | 0010 | 0000 | 1110 | |
| 1 | 2 | 0010 | 1110 | 1110 | ใช่ |
| 1 | 3b | 0010 | 0000 | 1110 | |
| 2 | 1 | 0010 | 0001 | 1100 | |
| 2 | 2 | 0010 | 1111 | 1100 | ใช่ |
| 2 | 3b | 0010 | 0001 | 1100 | |
| 3 | 1 | 0010 | 0011 | 1000 | |
| 3 | 2 | 0010 | 0001 | 1000 | ไม่ |
| 3 | 3a | 0010 | 0001 | 1001 | |
| 4 | 1 | 0010 | 0011 | 0010 | |
| 4 | 2 | 0010 | 0001 | 0010 | ไม่ |
| 4 | 3a | 0010 | 0001 | 0011 | |

### 6.3 รุ่นปรับปรุง 13 ÷ 3 (ผลหาร 0100 เศษ 0001)
| รอบ | ขั้น | Divisor | ครึ่งซ้าย | ครึ่งขวา | ติดลบ |
|---|---|---|---|---|---|
| 0 | init | 0011 | 0000 | 1101 | |
| 1 | 1 | 0011 | 0001 | 1010 | |
| 1 | 2 | 0011 | 1110 | 1010 | ใช่ |
| 1 | 3b | 0011 | 0001 | 1010 | |
| 2 | 1 | 0011 | 0011 | 0100 | |
| 2 | 2 | 0011 | 0000 | 0100 | ไม่ |
| 2 | 3a | 0011 | 0000 | 0101 | |
| 3 | 1 | 0011 | 0000 | 1010 | |
| 3 | 2 | 0011 | 1101 | 1010 | ใช่ |
| 3 | 3b | 0011 | 0000 | 1010 | |
| 4 | 1 | 0011 | 0001 | 0100 | |
| 4 | 2 | 0011 | 1110 | 0100 | ใช่ |
| 4 | 3b | 0011 | 0001 | 0100 | |
- golden มี 13 ÷ 3 ของรุ่นแรกด้วย (16 แถว)
- `signFromMsb: true` กับ 7 ÷ 15 ต้องได้ผลหาร 1 เศษ 8 (ผิดโดยตั้งใจ ใช้สอน) · ค่าที่ถูกคือ 0 เศษ 7

### 6.4 เลขมีเครื่องหมาย (n = 4) และ MIPS
| Dividend ÷ Divisor | ผลหาร | เศษ | บิตผลหาร | บิตเศษ | ตรวจ |
|---|---|---|---|---|---|
| 7 ÷ 2 | 3 | 1 | 0011 | 0001 | 3 × 2 + 1 = 7 |
| (−7) ÷ 2 | −3 | −1 | 1101 | 1111 | (−3) × 2 + (−1) = −7 |
| 7 ÷ (−2) | −3 | 1 | 1101 | 0001 | (−3) × (−2) + 1 = 7 |
| (−7) ÷ (−2) | 3 | −1 | 0011 | 1111 | 3 × (−2) + (−1) = −7 |
| (−8) ÷ (−1) | 8 (เกินช่วง 4 บิต) | 0 | - | 0000 | overflow |

| คำสั่ง | R[rs], R[rt] | LO (ผลหาร) | HI (เศษ) | หมายเหตุ |
|---|---|---|---|---|
| `div` | −7, 2 | 0xFFFFFFFD (−3) | 0xFFFFFFFF (−1) | ตรงกับโปรแกรม `mult-div` บน Unicorn |
| `divu` | 7, 2 | 0x00000003 | 0x00000001 | ตรงกับโปรแกรม `mult-div` บน Unicorn |
| `divu` | 0xFFFFFFF9 (บิตเดียวกับ −7), 2 | 0x7FFFFFFC | 0x00000001 | เทียบกับแถวแรก: บิตชุดเดียวกันแต่ไม่มีเครื่องหมาย |
| `divu` | 1000000, 7 | 142857 | 1 | ตรงกับโปรแกรม `restoring-divide` |
| `div` | ±7, ±2 ทั้ง 4 กรณี | ตามตารางบน | ตามตารางบน | ตรงกับโปรแกรม `div-signs` บน Unicorn |
| `div` | x, 0 | - | - | ผลไม่นิยาม (ไม่มี exception) |
| `div` | 0x80000000, −1 | 0x80000000 | 0x00000000 | ผลไม่นิยามตามสเปก (ค่าที่ซิมของเว็บให้) |

---

## 7. Testing
- unit (`tests/unit/divide/`, Vitest · coverage `src/lib/divide/**` ≥ 95%):
  - golden: อ่าน `docs/plans/golden/divide-traces.json` ด้วย `fs` → `traceDivV1`/`traceDivV2` ต้องได้ทุกแถวตรง (iteration, step, ทุก register เป็น bit string, negative) · `signedDivide` ตรงกับรายการ `signed`
  - exhaustive: ทุกคู่ของ n = 4 และ n = 8 (Divisor ≠ 0) → ผลของ v1 และ v2 = (a ÷ b, a mod b) · จำนวนแถว v1 = 1 + 3(n + 1), v2 = 1 + 3n · `signFromMsb: true` ต้องผิดอย่างน้อย 1 คู่ (เช่น 7 ÷ 15) และต้องถูกทุกคู่ที่ Divisor ≤ 2^(n−1)
  - property (fast-check, `numRuns: 1000`): n สุ่ม 1..32 → v1, v2 ถูก · `signedDivide` ทำให้ a = q × b + r, |r| < |b|, r เป็น 0 หรือมีเครื่องหมายเดียวกับ a · `mipsDiv` ตรงกับ BigInt (ปัดเข้าหา 0) ทั้ง signed/unsigned · `encodeDiv('div', 8, 9)` = 0x0109001A (ตรงกับ `div $t0, $t1` ใน `encodings.json`)
- e2e (`tests/e2e/divide.spec.ts`, pixel7 + iphone13 + desktop):
  1. `/divide` ไม่มีข้อความ "กำลังพัฒนา" · TOC มีทุก section ใน 3.1–3.9
  2. v1 กดตัวอย่าง 7 ÷ 2 → เล่นจนจบ → Quotient 0011, Remainder 0000 0001 และตาราง trace 16 แถว · รอบ 1–3 ขึ้น "ติดลบ" · ← → ใช้ได้
  3. v2 13 ÷ 3 → ผลหาร 0100 เศษ 0001 · สวิตช์ `signFromMsb` ใน v1 กับ 7 ÷ 15 แสดงผลผิดพร้อมคำอธิบาย
  4. signed (−7) ÷ 2 → ผลหาร 1101 เศษ 1111 · (−8) ÷ (−1) ขึ้น overflow
  5. MIPS playground `div` −7, 2 → LO 0xFFFFFFFD, HI 0xFFFFFFFF · Divisor 0 ขึ้นคำเตือน
  6. ปุ่ม `OpenInSim`: ถ้า `mips` ready ต้องลิงก์ `/mips?example=div-signs`, `mult-div`, `restoring-divide` ถ้ายังไม่ ready ต้อง disabled (อ่านสถานะจาก `TOPICS` ห้าม hardcode)
  7. `SelfCheck` เปิดเฉลยได้ด้วยคีย์บอร์ด · โหมดนำเสนอของ StepPlayer ใช้ได้
  8. ไม่มี console error · axe ไม่มี serious/critical · มือถือไม่เลื่อนแนวนอนทั้งหน้า

---

## 8. Phase และ Definition of Done
| phase | งาน | DoD |
|---|---|---|
| 3A โมเดล | `src/lib/divide/` + `src/content/divide/step-text.ts` + unit test ทั้งหมด | golden, exhaustive, property ผ่าน · coverage ≥ 95% |
| 3B หน้า + รุ่นแรก | `src/app/divide/page.tsx` (metadata title "การหารแบบ MIPS"), `LessonLayout`, 3.1 และ 3.2 ครบ (ภาพ, simulator, ตาราง, ข้อความ, สวิตช์บิตเครื่องหมาย) | e2e ข้อ 1–2 ผ่าน · screenshot 390/1440 เปิดดูแล้ว |
| 3C รุ่นปรับปรุง ถึง MIPS | 3.3–3.6 + `OpenInSim` + ลิงก์ Floating-Point | e2e ข้อ 3–6 ผ่าน |
| 3D ปิดหัวข้อ | 3.7–3.9, ศัพท์ใน `src/content/glossary/divide.ts`, ตรวจภาษา · เปลี่ยน `divide` เป็น `ready` ใน `topics.ts` | e2e ทั้งหมดผ่าน (รวม `tests/e2e/hub.spec.ts` ของ WP-0) · build static · review 3 รอบ (PLAN.md 11) · PR เปิดแล้ว |

---

## 9. คำถามตั้งต้น (ใส่ในไฟล์ progress แล้วทำต่อด้วยค่าที่สมมติ)
| # | ระดับ | คำถาม | ค่าที่ใช้ไปก่อน |
|---|---|---|---|
| WP3-Q1 | ยืนยันค่าเริ่มต้น | simulator ใช้ 4 บิตเป็นค่าเริ่มต้น เลือก 8 บิตได้ (32 บิตใช้เฉพาะส่วน MIPS) | ตามนั้น |
| WP3-Q2 | ยืนยันค่าเริ่มต้น | ลำดับขั้นของรุ่นปรับปรุง (เลื่อนซ้าย → ลบ → ตั้งบิต) ตามหัวข้อ 3.3 ตรงกับที่อาจารย์สอนไหม | ตามนั้น (ผลเท่ากับแบบอื่นทุกบิต) |
| WP3-Q3 | ไม่ด่วน | ต้องการ simulator ของ nonrestoring division ไหม | ไม่ทำ มีแค่คำอธิบาย |
