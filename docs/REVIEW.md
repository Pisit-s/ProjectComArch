> ประวัติระยะที่ 1 (Floating-Point) · งานระยะที่ 2 ดู docs/progress/

# Review notes

## Phase 2 — design system + StepPlayer (30 ต.ค. 2569)
- หน้าแรก 390px: กระจกขาวบนพื้นฟ้า-ขาว + grid blueprint ให้ความรู้สึกเดียวกับ coekku.shop · header แคปซูล + ปุ่มเมนู drawer · footer เครดิตครบ 4 คน + อาจารย์ (รหัสใช้ mono)
- StepPlayer 390px: flowchart ย่อเป็นแถบแนวนอน, steps indicator เลื่อนแนวนอน, register 32 บิตแบ่ง 2 แถว (S+Exponent / Fraction) ตอนแรก Fraction ล้นเป็น 2 บรรทัด → แก้เป็น grid 23 คอลัมน์พอดีความกว้าง
- StepPlayer 1280px: flowchart อยู่ด้านซ้าย กล่องปัจจุบันเป็นสีน้ำเงิน + BeamRing · partial products เรียงตรงจุดทศนิยม · แถวแรกเคยแสดง `00.011010` → เปลี่ยนเป็นเว้นวรรคแทนเลข 0 นำหน้า
- ข้อสังเกต: แถบควบคุมเป็น sticky bottom จึงลอยตามตอนเลื่อนผ่าน player (ตั้งใจ ให้กดถัดไปได้ตลอด)

## Phase 3 — บทที่ 1–2
- Integer Explorer 390px: บิต 8 ตัวแบ่ง 4+4 แถว ปุ่ม 44px ขึ้นไป (จอ ≥ 420px เป็นแถวเดียว) · ค่าฐานสิบใหญ่ อ่านง่าย
- Fraction Converter: ช่องบิตเติมทีละช่องตามขั้น · ผลแสดงวงซ้ำด้วยเส้นด้านบนสีชมพู
- ข้อสังเกต (ไว้ดูรอบ 2): แถบควบคุมของ StepPlayer เป็น sticky bottom ตอน player เพิ่งโผล่จากขอบล่างจอ แถบจะทับตัวบอกขั้น/ชื่อขั้นชั่วครู่

## Milestone — accessibility (axe) ที่แก้แล้ว
- ปุ่มเมนูมือถือเคยเป็น `<label aria-label>` (aria-prohibited-attr) → เปลี่ยนเป็น `<button aria-expanded>` ควบคุม drawer
- หัวตาราง daisyUI สี 60% contrast ไม่พอ → ตั้งเป็นสี muted · ตัวเลข `text-muted/60` → `text-muted` · tab ที่ไม่ได้เลือก `text-ink/80`
- กล่องตารางที่เลื่อนแนวนอนได้ใส่ `tabIndex={0}` ให้ใช้คีย์บอร์ดเลื่อนได้

## Phase 7 — Lighthouse (mobile, production build, 30 ต.ค. 2569)
| หน้า | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 93 | 98 → แก้ heading-order แล้ว | 100 | 100 |
| `/learn/add-sub` | 99 | 100 | 100 | 100 |
| `/learn/mul-div` | 99 | 100 | 100 | 100 |
- ผ่านเป้า (≥ 90 / ≥ 95 / ≥ 95 / ≥ 90) ทุกหน้า · ไฟล์ผลอยู่ที่ `test-results/lh-*.json` (gitignore)
- หน้าแรก: ชื่อขั้นใน player เป็น h3 อยู่ก่อน h2 → เปลี่ยนหัวข้อ "ตัวอย่างสด" เป็น h2
- OG image: register 32 บิตเคยตกบรรทัด → ลดความกว้างช่องให้อยู่แถวเดียว · ภาษาไทยแสดงถูก (โหลด Chakra Petch subset thai)

## Phase 9 — Review รอบ 1: ใช้งานจริง
**นักศึกษา (WebKit 390px)** ลองค่าผิด ๆ ในตัวแปลงและ simulator:
- ว่าง → "กรุณาพิมพ์ตัวเลข" · `1,5` → "ใช้จุด (.) เป็นจุดทศนิยม ไม่ใช้ลูกน้ำ (,)" · `abc` → บอกรูปแบบที่ใช้ได้พร้อมตัวอย่าง · `1e999` → แจ้งว่าใหญ่เกินช่วงจึงเป็น ∞ · ไม่มี page error
- เจอแล้วแก้: (1) ใน simulator ถ้า operand ใหญ่เกินจนเป็น ∞ (เช่น `1e999`) ไม่มีคำเตือน → เพิ่มข้อความใต้ register (2) encode `-0`/`0` ไม่มีคำอธิบาย → เพิ่ม alert ว่าศูนย์เก็บแบบพิเศษ (3) ตารางหารยาวบนมือถือ "ไม่ → ไม่ลบ" ตกบรรทัด → เปลี่ยนเป็น "ใช่ ลบ" / "ไม่ลบ" ไม่ตัดบรรทัด
**อาจารย์ (1920px, คีย์บอร์ดล้วน)**: Tab ไปช่อง A พิมพ์ 1, Tab ไป B พิมพ์ 3, เลือก ÷ ด้วย Enter, โฟกัส player แล้วกด → 7 ครั้ง → URL เป็น `/lab?tab=calc&op=div&a=1&b=3&step=round` (เปิดลิงก์นี้บนมือถือได้ขั้นเดียวกัน — ตรวจด้วย e2e lab.spec)
- เจอแล้วแก้: บนจอ 1920 ตัวอักษรและบิตเล็กไปสำหรับท้ายห้อง → ขยาย root font เป็น 112.5% (≥1536px) และ 125% (≥1800px) ทั้งเว็บใช้ rem จึงใหญ่ขึ้นทั้งหมด
- Lab เคยเขียน `step=decode-a` ลง URL ทันทีที่เปิด → ขั้นแรกไม่ใส่ใน URL

## Phase 9 — Review รอบ 2: ความสวยและ interface
- ตรวจ horizontal scroll อัตโนมัติ: 7 หน้า × 6 ความกว้าง (360/390/430/768/1280/1920) × Chromium + WebKit → ไม่มีหน้าไหนล้นแนวนอน
- 1920: เนื้อหาอ่านง่าย ระยะห่างพอดี · 360 WebKit: partial products เรียงตรงจุด ข้อความไทยไม่โดนตัด
- เจอแล้วแก้: flowchart แนวนอนบนมือถือไม่เลื่อนตามกล่องปัจจุบัน → เลื่อนให้กล่องที่ active อยู่กลางแถบเสมอ
- ไม่มี emoji ในทุกไฟล์ (สแกน unicode) · ไม่มีสำนวนต้องห้าม · ใช้คำ mantissa เฉพาะในคำอธิบาย Fraction ตาม PLAN.md 7.9
- สีบิตเหมือนกันทุกบท (ใช้ `FIELD_STYLE` ตัวเดียว) · reduced motion: e2e เปลี่ยนขั้นได้ครบ
- ข้อสังเกตที่ไม่แก้: แถบควบคุม player เป็น sticky bottom บนมือถือจึงบังท้ายภาพของขั้นที่ยาวจนกว่าจะเลื่อนลง — ตั้งใจเพื่อให้กด "ถัดไป" ได้ตลอด

## Phase 9 — Review รอบ 3: ความถูกต้อง (30 ต.ค. 2569)
- `npm test` 160 ผ่าน · `npm run test:long` 1,008,000 กรณีผ่าน (7.0 s) · coverage engine: statements 99.1% / branches 98.7% / functions 98% / lines 99.7%
- e2e 65 ผ่าน + 1 skip (ทดสอบ clipboard เฉพาะ Chromium) บน pixel7 + iphone13 + desktop กับ production build · ไม่มี console error · axe ไม่มี serious/critical
- `npm run build` ผ่าน ทุก route static (13 รายการรวม icon, OG image, sitemap, robots)
- grep หา hex/บิตที่พิมพ์เองใน `src/app`, `src/content`, `src/components`: เหลือแค่ค่าเริ่มต้นของเครื่องมือและ input ของตัวอย่าง I1–I3 (ไม่ใช่ค่าที่เก็บจริงของ float) · ช่วงค่า 8 บิตในบทที่ 1 เปลี่ยนเป็น render จาก helper แล้ว
- ยังไม่ได้ทำ: ไล่อ่านเนื้อหาทุกบทเทียบ requirement อีกรอบแบบละเอียด (ทำตอนเขียน FINAL_REPORT)

## หลังได้คำตอบคำถาม (Q7 / Q8 / Q9)
- **Half / Single / Double ใน Lab**: ก่อนเปิดให้ใช้ เพิ่ม oracle test — binary64 เทียบกับ double ของ JS ตรง ๆ และ binary16 เทียบกับ `Math.f16round` (ปัดสองครั้งปลอดภัยเพราะ 53 ≥ 2·11 + 2) ผ่านทั้ง 4 operation · ข้อความทุกขั้นเปลี่ยนตาม format (Bias, จำนวนบิต, Exponent ต่ำสุด) · register 64 บิตบนมือถือแบ่ง Fraction 52 บิตเป็น 2 แถว · ตัวอย่างใน e2e: Double ได้ 0.1 + 0.2 = 0.30000000000000004 (`0x3FD3333333333334`)
- **โหมดนำเสนอ**: ปุ่ม "นำเสนอ" ในแถบควบคุมทุก player → เต็มจอ (ถ้า browser รองรับ) ตัวอักษรใหญ่ขึ้น ← → Space Home ใช้ได้ทั้งหน้า Esc ออก · เจอแล้วแก้: overlay แบบ `fixed` ถูกขังอยู่ในการ์ดกระจก (backdrop-filter สร้าง containing block ใหม่) หน้าเดิมจึงโผล่ที่ขอบล่าง → render ผ่าน portal ไปที่ `<body>` และเว้นช่องแทนที่ไว้ในหน้า
- **Web Analytics**: โหลดเฉพาะบน Vercel (ในเครื่อง/e2e ไม่ยิง script ที่ไม่มี จึงไม่มี console error) · ป้ายมุมขวาล่างของ footer เขียนตาม docs ของ Vercel ว่าไม่ใช้ cookie และเก็บข้อมูลแบบไม่ระบุตัวตน
- test: unit 172 ผ่าน · e2e 71 ผ่าน + 1 ข้าม บน pixel7 + iphone13 + desktop
