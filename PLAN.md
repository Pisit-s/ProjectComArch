# comkrub: แผนปรับเว็บเป็นสื่อการสอน "บวก ลบ เลข Floating-Point" แบบหน้าเดียว

> แผนนี้เขียนให้ **Claude Code** ของ Pisit ทำงานแบบ autonomous · เขียนเมื่อ 2 พ.ย. 2569
> repo `Pisit-s/ProjectComArch` (private) · เว็บจริง https://comkrub.mypisit.com บน Vercel (Pisit deploy เอง)
> **แผนนี้แทน PLAN.md ระยะที่ 2 ฉบับเดิมทั้งหมด**: หน้า hub, MIPS Simulator, หัวข้อการคูณ และหัวข้อการหาร **ยกเลิกแล้ว** (แผนเดิมดูได้จาก git history ที่ commit `6d87a64`)
> แผนรอบแรกยังใช้อ้างอิงเรื่อง engine, StepPlayer, ธีม และ testing ได้ที่ `docs/plans/stage1-floating-point.md` (ในไฟล์นี้เรียกว่า "stage1 x.y")
> วิธีเริ่ม: Pisit วาง prompt ในภาคผนวก A.1 ลงใน Claude Code ที่เปิดในโฟลเดอร์โปรเจกต์

## สารบัญ
- 0. สรุปงาน
- 1. หลักการ "เห็นก่อนอ่าน"
- 2. แหล่งเนื้อหาและศัพท์ (สไลด์อาจารย์ก่อน)
- 3. โครงเรื่องหน้าเดียว (storyboard ทุกบท)
- 4. หน้าเว็บและ component
- 5. Engine และโมเดล
- 6. ลบ ย้าย และเก็บกวาด
- 7. เปลี่ยนชื่อเป็น comkrub
- 8. โครงสร้างไฟล์หลังปรับ
- 9. กติกาการทำงาน
- 10. Phases และ Definition of Done
- 11. Testing และ review 4 รอบ
- 12. งานของ Pisit และทีม
- 13. คำถามตั้งต้น
- ภาคผนวก A: prompt สำหรับ Claude Code
- ภาคผนวก B: `CLAUDE.md` ฉบับใหม่
- ภาคผนวก C: ข้อความทั้งหน้า (copy)
- ภาคผนวก D: Golden vectors ใหม่ (ตรวจแล้ว)
- ภาคผนวก E: สรุปเนื้อหาจากสไลด์อาจารย์

---

## 0. สรุปงาน

### 0.1 คำติชมจากอาจารย์ (จุดตั้งต้นของงานรอบนี้)
- ข้อความเยอะเกินไป
- อยากได้ animation ที่ดูแล้วเข้าใจง่าย กดเล่นได้จริง
- เน้นเรื่องเดียว: **การบวกและการลบเลข Floating-Point** · เอาเรื่องคูณ/หารออก
- เพิ่มเติมจาก Pisit: animation เดิมยังต้องอ่านเยอะ อยากให้ "เห็นภาพ" และมีคำอธิบายนิดเดียว · อาจารย์สอนการแปลงเลขในคาบแล้ว ให้อิงสไลด์อาจารย์ก่อน (หัวข้อ 2)
- ตัวเลขเทียบ: หน้า `/learn/add-sub` เดิมมีข้อความในส่วนเนื้อหาประมาณ 4,800 ตัวอักษร (วัดจากเว็บจริง 2 พ.ย. 2569) · งบใหม่ต่อบทไม่เกิน 600 ตัวอักษร (หัวข้อ 1.3)

### 0.2 เป้าหมาย
เว็บ **comkrub** เป็นหน้าเดียว เลื่อนลงเรียนทีละบท จากความรู้วิชา Digital (บวก/ลบเลขฐานสอง) ไปจนบวกและลบเลข Floating-Point ได้จริง และเห็นว่าวงจรทำงานอย่างไรแบบ black box · ทุกบทเริ่มด้วยคำศัพท์ แล้วเป็นภาพเคลื่อนไหวที่กดเล่นได้ มีข้อความสั้นที่สุดเท่าที่จำเป็น และลองใส่ตัวเลขเองได้

### 0.3 ก่อน / หลัง
| ส่วน | ตอนนี้ (Binary Lab) | หลังปรับ (comkrub) |
|---|---|---|
| โครงเว็บ | หน้าแรก + 5 บทแยกหน้า (`/learn/*`) + `/lab` | หน้าเดียว `/` มี 7 บท + สรุป · URL เก่า redirect มาหัวข้อที่ตรงกัน |
| เนื้อหา | เลขฐาน, เศษส่วนฐานสอง, IEEE 754, บวก/ลบ, คูณ/หาร | ทบทวนบวกลบฐานสอง → ทศนิยมในภาษา C → IEEE 754 → แปลงเลข → บวก/ลบ/ปัดเศษ → วงจร → ลองเอง |
| ข้อความ | ย่อหน้ายาว บทละ 10–18 นาที | งบข้อความต่อบท + caption ไม่เกิน 2 บรรทัดต่อขั้น · เหตุผลซ่อนหลังปุ่ม "ทำไม?" |
| animation | การ์ดข้อความ/ตัวเลขเปลี่ยนทีละขั้น ต้องอ่าน | ของเคลื่อนที่จริง: บิตไหล, จุดกระโดด, ตัวทดวิ่ง, ข้อมูลไหลในวงจร · ป้ายสั้นติดกับของที่ขยับ |
| คูณ/หาร | บทที่ 5 + Lab | ลบออกทั้งหมด รวม engine |
| วงจร | ไม่มี | บทที่ 6: block diagram ของวงจรบวก floating-point แบบ black box ข้อมูลไหลตามขั้น |
| คำศัพท์ | `Term` แทรกในย่อหน้า | แถบคำศัพท์ต้นบททุกบท |
| ชื่อ | Binary Lab | comkrub |
| engine | BigInt ครบ + − × ÷ | เก็บ + − (และ encode/decode) · ลบ × ÷ |
| แผนระยะที่ 2 เดิม | hub + MIPS Sim + คูณ + หาร | ยกเลิก ลบไฟล์แผนและ golden ที่เกี่ยวข้อง |

### 0.4 เกณฑ์ว่างานทั้งหมดเสร็จ
1. `/` เป็นหน้าเดียว มีบทที่ 1–7 และสรุปตามหัวข้อ 3 · บทที่ 1–6 ทุกบทมี: แถบคำศัพท์ → scene ที่กดเล่นได้อย่างน้อย 1 อัน → สรุป 1 บรรทัด → คำถามเช็ก 1 ข้อ
2. ข้อความทุกบทอยู่ในงบ (1.3) และ test งบข้อความผ่าน
3. ไม่มีเนื้อหา เครื่องมือ หรือ engine ของการคูณ/หาร Floating-Point เหลืออยู่
4. ชื่อ comkrub ครบทุกที่ (UI, metadata, OG image, README, package, ธีม daisyUI)
5. URL เก่าทุกอันพาไปหัวข้อที่ตรงกันบนหน้าเดียว (หัวข้อ 4.1)
6. unit + e2e ผ่าน (pixel7, iphone13, desktop) · build ผ่านและทุก route static · Lighthouse ผ่านเป้า · screenshot 390 / 1440 / 1920 เปิดดูแล้ว
7. review 4 รอบ (หัวข้อ 11) เสร็จ · PR เข้า `main` เปิดแล้ว · รายงานในแชทครบ

---

## 1. หลักการ "เห็นก่อนอ่าน" (ใช้ทุกบท)

### 1.1 กติกาการสอน
1. **1 ความคิด = 1 ภาพเคลื่อนไหว**: อธิบายด้วยการเคลื่อนที่ของบิต ตัวเลข และกล่องวงจร ข้อความเป็นแค่ป้ายสั้น ๆ ที่ติดกับของที่ขยับ ไม่ใช่การ์ดข้อความ
2. **คำศัพท์ก่อนเริ่มบท**: แถบคำศัพท์ 3–6 คำต้นบท (ชื่อ + ความหมาย 1 บรรทัด) · ศัพท์ที่ใช้ในบทต้องมาจากแถบของบทนั้นหรือบทก่อนหน้า
3. **ตัวอย่างเดิมตลอดเรื่อง**: `6.5 + 3.75 = 10.25` เป็นตัวอย่างหลักตั้งแต่บทที่ 2 ถึง 6 (ผู้เรียนเห็นตัวเลขเดิมในรูปต่าง ๆ: โค้ด C → 32 บิต → การแปลง → การบวก → วงจร) · การลบใช้ `0.5 − 0.4375` (ตัวอย่างในตำรา P&H ที่สไลด์สั่งอ่าน) · การปัดเศษใช้ `0.1 + 0.2`
4. **ต่อยอดจาก Digital**: ภาพในบทที่ 1 (ตัวทดวิ่ง, ALU ที่มี Binvert/CarryIn, shifter) กลับมาเป็นชิ้นส่วนในบทที่ 5–6 ให้เห็นว่าวงจรบวก floating-point ประกอบจากของที่รู้จักแล้ว
5. **กดเล่นได้จริง**: ทุกกระบวนการหลายขั้นใช้ StepPlayer (ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด/โหมดนำเสนอ/reduced motion) · ก่อนเล่นครั้งแรกมีปุ่มเล่นใหญ่กลางภาพ · ไม่เล่นเองตอนเลื่อนถึง (ยกเว้น hero teaser) · ค่านี้ตั้งได้ที่ `src/content/lesson/config.ts`
6. **ลองเอง**: scene หลักรับตัวเลขของผู้เรียน และมี chip ตัวอย่างให้กดเปลี่ยนเร็ว ๆ
7. **รายละเอียดซ่อนไว้ให้กดดู**: เหตุผลยาวอยู่หลังปุ่ม "ทำไม?" ใต้ caption (เปิดทีละข้อ) ไม่วางเป็นย่อหน้า · ห้ามมีรายการ "วัตถุประสงค์" "เวลาอ่าน" หรือ TOC ยาว ๆ แบบเว็บเดิม
8. **ถูกทุกบิต**: ผลลัพธ์ บิต hex ค่าที่เก็บจริง ผล printf และตำแหน่งบนเส้นจำนวน มาจาก engine หรือโมเดลเสมอ · ค่าที่เป็น input ของตัวอย่าง (เช่น 6.5, 3.75, 7 + 6, 0.002 × 10⁴) เขียนใน content ได้
9. **อิงสไลด์อาจารย์ก่อน**: ศัพท์ สัญลักษณ์ และตัวอย่างตามสไลด์ · เรื่องที่สไลด์ไม่มีใช้ตำรา P&H 5e ที่สไลด์สั่งให้อ่าน (หัวข้อ 2)

### 1.2 ภาษาภาพ (ใช้แบบเดียวกันทั้งเว็บ)
| ความหมาย | ภาพ |
|---|---|
| ส่วนของ float | สีเดิม stage1 9.4: Sign `#D55E00`, Exponent `#009E73`, Significand `#2563EB`, hidden bit = สี significand ขอบเส้นประ, G/R/S `#CC79A7` · มีป้ายชื่อกำกับเสมอ (สีไม่ใช่สิ่งเดียวที่บอกความหมาย) |
| ตัวทด (carry) | ลูกศรโค้งวิ่งจากหลักขวาไปหลักซ้าย สี token ใหม่ `carry` = `#E69F00` (ตัวอักษร `carry-ink` = `#8A5A00` ตรวจ contrast ≥ 4.5:1) |
| เลื่อนบิต (shift) | บิตทั้งแถวไหลไปซ้าย/ขวาทีละช่อง บิตที่ตกขอบขวาหล่นลง "ถัง S" (Sticky) |
| normalize | จุดฐานสอง "กระโดด" ทีละช่อง ป้าย `× 2ᵉ` นับขึ้น/ลงตามจังหวะกระโดด |
| ปัดเศษ | เส้นจำนวนสั้น ๆ มีค่าที่เก็บได้ 2 ค่า (ซ้าย/ขวา) จุดของผลจริง และลูกศรไปค่าที่เลือก |
| เปลี่ยนในขั้นนี้ | วงแหวนฟ้า `#38B6FF` + glow (ของเดิม) |
| เกินช่วง/ผิด | สี `error` ของ daisyUI + ไอคอน `TriangleAlert` + คำว่า "overflow" |
| วงจร | สัญลักษณ์แบบที่วิชาใช้ (สไลด์ w04a หน้า 12): ALU/Adder ทรงคางหมูมีรอยบาก, MUX ทรงแคปซูล, register สี่เหลี่ยม · สายข้อมูลสีตามชนิด: exponent เขียว, significand น้ำเงิน, sign ส้ม, control เทาเส้นประ · ส่วนที่ทำงานในขั้นนั้นสว่าง ส่วนอื่นจาง (แบบเส้นทางเน้นสีในสไลด์ w04a หน้า 7) · วาดเองทั้งหมด |
| 4 ขั้นของการบวก | `StepBar` ไอคอน 4 อันเรียงเสมอ: ① Align ② บวก/ลบ ③ Normalize ④ ปัดเศษ · ใช้ทั้งบทที่ 5 และ 6 สีและไอคอนเดียวกัน |

### 1.3 งบข้อความ (บังคับด้วย test)
- ข้อความที่ผู้ใช้เห็นทั้งหมดอยู่ใน `src/content/lesson/**` · ใน component มีได้แค่ป้ายสั้นไม่เกิน 20 ตัวอักษร (เช่น "เล่น", "ถัดไป") และ `aria-label`
- นับเป็น grapheme ด้วย `Intl.Segmenter('th', { granularity: 'grapheme' })` (ภาษาไทยมีสระ/วรรณยุกต์ซ้อน ห้ามใช้ `.length`)

| ชนิดข้อความ | งบ (grapheme) |
|---|---|
| ชื่อบท | ≤ 30 |
| hook ใต้ชื่อบท | ≤ 90 และเป็น 1 ประโยค |
| ความหมายคำศัพท์ | ≤ 80 ต่อคำ · 3–6 คำต่อบท |
| caption ของแต่ละขั้น | ≤ 70 (ตรวจกับข้อความที่ render จริงของทุก chip ตัวอย่าง) |
| "ทำไม?" | ≤ 160 ต่อข้อ |
| สรุปท้ายบท | ≤ 100 · 1 บรรทัด |
| ข้อความอื่นในบท | ≤ 2 ก้อน ก้อนละ ≤ 120 |
| รวมต่อบท (hook + คำศัพท์ + สรุป + ข้อความอื่น + คำถามเช็ก) | ≤ 600 |

- `tests/unit/content/text-budget.test.ts` ตรวจทุกแถว และ `tests/unit/content/no-thai-in-components.test.ts` สแกน `src/components/**`, `src/app/**` หา string ภาษาไทยที่ยาวเกิน 20 grapheme แล้ว fail
- สคริปต์ `npm run text:report` พิมพ์ตารางจำนวนตัวอักษรต่อบท ใส่ผลใน `docs/REVIEW.md` ทุกรอบ review

---

## 2. แหล่งเนื้อหาและศัพท์ (สไลด์อาจารย์ก่อน)

### 2.1 ลำดับแหล่งข้อมูล
1. **สไลด์อาจารย์** ใน `Slide/` (สรุปในภาคผนวก E): `w03c.pdf` (บวก/ลบจำนวนเต็ม, overflow, ALU, barrel shifter), `w03c_mult.pdf` (Floating Point หน้า 13–22), `w04a.pdf` (สัญลักษณ์วงจรและการเน้นเส้นทางข้อมูล)
2. **Patterson & Hennessy, Computer Organization and Design 5th ed.** หัวข้อ 3.2 (บวก/ลบ) และ 3.5 (Floating Point: การบวก, block diagram ของวงจรบวก, Accurate Arithmetic: guard/round/sticky) · สไลด์ w03c_mult หน้า 23 สั่งอ่าน P&H5e 3.3–3.5 จึงเป็นแหล่งรองที่ตรงกับวิชา
3. **IEEE Std 754-2019** สำหรับกติกาปัด round to nearest, ties to even (ค่าเริ่มต้นของมาตรฐาน)
- ห้ามใช้ข้อมูลจากแหล่งอื่นที่ขัดกับสไลด์ ถ้าเจอที่ขัดกันให้จดใน `docs/QUESTIONS.md`

### 2.2 สไลด์ที่ใช้ในแต่ละบท (เลขหน้าเป็นหน้า PDF)
| ไฟล์ · หน้า | เรื่อง | ใช้ในบท |
|---|---|---|
| w03c · 3, 10 | Integer Addition: 7 + 6 พร้อมแถวตัวทด | บท 1 (ฉาก 1.1) |
| w03c · 4–5 | ช่วงค่าของ word 4/8/32 บิตแบบ two's complement | บท 1 (ฉาก 1.3) |
| w03c · 6–9 | Four-Bit Additions 8 กรณี (3 + 2 … −4 + −5) และผลที่ผิด (overflow) | บท 1 (ฉาก 1.3, chip) |
| w03c · 10–11 | กติกา overflow ของการบวก/ลบ · ลบ = บวกค่าติดลบ (7 − 6 = 7 + (−6)) | บท 1 (ฉาก 1.2–1.3) |
| w03c · 12 | ภาษา C ไม่สนใจ overflow ของจำนวนเต็ม | บท 2 (ทำไม? ของฉาก 2.1) |
| w03c · 29 | One-Bit Full Adder (ตารางความจริง) | บท 1 (กล่อง full adder ใต้หลักที่กำลังบวก) |
| w03c · 30–33 | One-Bit ALU, 32-Bit ALU: x + y และ x − y ด้วย Binvert = 1, CarryIn[0] = 1 | บท 1 (ฉาก 1.2), บท 6 (Big ALU) |
| w03c · 36–37 | Barrel Shifter, shift คือการต่อสายใหม่ | บท 1 (ฉาก 1.4), บท 6 (Shifter) |
| w03c_mult · 13 | Floating Point: scientific notation, normalized/not normalized, ±1.xxx × 2ʸʸʸʸ, float/double ในภาษา C | 2 |
| w03c_mult · 14 | IEEE Std 754-1985, single 32 บิต / double 64 บิต | 3 |
| w03c_mult · 15 | รูปแบบ single precision 1/8/23, ตารางความหมายของ exponent (0x00, 0x01–0xFE, 0xFF) และสูตร | 3, 4 |
| w03c_mult · 16–18 | ตัวอย่างบิตของ ±0, subnormal, normalized ที่เล็ก/ใหญ่สุด, ±∞, NaN · ช่วงค่า | บท 3 (ฉาก 3.3) |
| w03c_mult · 19–20 | double precision 1/11/52, bias 1023, ตัวอย่าง C ที่ล้นเป็น inf | บท 3 (แถบเทียบ double) |
| w03c_mult · 21–22 | Fun Fact: `1e17 + 20` และ `-x + x + 20` เทียบ `-x + (x + 20)` | บท 5 (ฉาก 5.5) |
| w04a · 5, 7, 12 | MUX เป็นตัวควบคุมเส้นทาง, เส้นทางข้อมูลที่ถูกเน้นสี, สัญลักษณ์ AND/Adder/MUX/ALU | บท 6 (หน้าตาของวงจร) |

### 2.3 เรื่องที่สไลด์ไม่มี และแหล่งที่ใช้แทน
| เรื่อง | ใช้จาก |
|---|---|
| วิธีแปลงเศษส่วนเป็นฐานสองด้วยการคูณ 2 ซ้ำ และการ normalize | วิธีมาตรฐาน (ตรงกับ engine `fraction.ts`, `encode.ts`) + ตัวอย่างแปลง −0.75 และถอดรหัส `0xC0A00000` = −5.0 จาก P&H 3.5 |
| ขั้นตอนการบวก floating-point 4 ขั้น (align → บวก significand → normalize + ตรวจ overflow/underflow → ปัด แล้ว normalize ซ้ำถ้าจำเป็น) | P&H 3.5 |
| ตัวอย่างฐานสิบ `9.999 × 10¹ + 1.610 × 10⁻¹` (เก็บได้ 4 หลัก) และฐานสอง `0.5 + (−0.4375)` | P&H 3.5 |
| block diagram วงจรบวก floating-point: Small ALU → MUX 3 ตัว → shift right → Big ALU → normalize (เลื่อน + เพิ่ม/ลด exponent) → rounding hardware → normalize ซ้ำ | P&H 3.5 (วาดใหม่เองด้วยสัญลักษณ์แบบสไลด์ ห้ามคัดลอก figure) |
| guard, round, sticky และ ulp | P&H 3.5 (Accurate Arithmetic) |
| round to nearest, ties to even | IEEE 754-2019 + P&H 3.5 |
| การบวก floating-point ในฮาร์ดแวร์ใช้หลาย clock cycle และทำแบบ pipeline ได้ | P&H 3.5 (1 บรรทัดใน "ทำไม?" ของบทที่ 6) |

### 2.4 ศัพท์และสัญลักษณ์ (ตามสไลด์)
- ช่อง 23 บิตเรียกว่า **Significand** ตามสไลด์ (w03c_mult หน้า 15) · ตัวเต็ม 24 บิตเขียนว่า **1.significand** ตามสูตรในสไลด์ · บอกครั้งเดียวในคำศัพท์ว่าตำรา P&H เรียกช่อง 23 บิตว่า fraction (เปลี่ยนป้าย "Fraction" เดิมทั้งเว็บเป็น "Significand" · ชื่อตัวแปรใน engine เช่น `frac` ไม่ต้องเปลี่ยน)
- **Exponent** = ค่าในช่อง 8 บิต (มี bias) · เลขชี้กำลังจริง = Exponent − 127 · สูตร normalized: `(−1)ˢ × (1.significand) × 2^(Exponent − 127)` · subnormal: `(−1)ˢ × (0.significand) × 2^(−126)`
- ฐานสองเขียนตัวห้อย `₂` (เช่น `1.101₂ × 2²`) · hex เขียน `0x40D00000`
- คำที่ใช้: sign, exponent, significand, bias, hidden bit, normalize, align, shift, carry, overflow, underflow, guard / round / sticky (G R S), LSB, ALU, MUX, shifter · ใช้ศัพท์อังกฤษตามที่สไลด์และวิชาใช้ ไม่แปลตรงตัว ถ้าอยากให้คำไทยใส่ในวงเล็บครั้งแรกครั้งเดียว
- รายการคำศัพท์ทั้งหมดและความหมายอยู่ในภาคผนวก C.4 (เป็น source of truth แทน `glossary.ts` เดิม)

### 2.5 กติกาการใช้สไลด์และตำรา
- โฟลเดอร์ `Slide/` เป็นเอกสารของอาจารย์ **ห้าม commit** (เพิ่มใน `.gitignore`) ห้ามนำไฟล์หรือรูปจากสไลด์ไปไว้ใน `public/` หรือแสดงบนเว็บ
- วาดภาพและเขียนข้อความเองทั้งหมด ใช้ข้อเท็จจริงและตัวอย่างตัวเลขจากสไลด์/ตำราได้ และอ้างอิงที่มาเป็นชื่อเอกสาร + หน้า/หัวข้อ (component `SourceNote` ท้ายบท ตัวเล็ก)
- Claude Code เปิดอ่าน PDF ได้เมื่อต้องการตรวจรายละเอียด (Read รองรับ PDF ระบุหน้า) แต่ใช้ภาคผนวก E เป็นหลักเพื่อประหยัด token

---

## 3. โครงเรื่องหน้าเดียว (storyboard ทุกบท)

### 3.0 ภาพรวม
| # | id (anchor) | บท | คำถามที่บทนี้ตอบ | scene หลัก |
|---|---|---|---|---|
| - | `top` | Hero | เว็บนี้สอนอะไร | teaser 6.5 + 3.75 กลายเป็น 32 บิต + แผนที่ 7 บท |
| 1 | `binary` | บวกและลบเลขฐานสอง | คอมพิวเตอร์บวก/ลบจำนวนเต็มยังไง | ฉาก 1.1 บวกทีละหลัก · 1.2 ลบด้วย ALU · 1.3 วงล้อ overflow · 1.4 เลื่อนบิต |
| 2 | `float-in-c` | เลขทศนิยมในโปรแกรม | แล้วเลขทศนิยมล่ะ | ฉาก 2.1 โค้ด C · 2.2 จุดที่เลื่อนได้ |
| 3 | `ieee754` | มาตรฐาน IEEE 754 | 32 บิตเก็บเลขทศนิยมยังไง | ฉาก 3.1 แบ่ง 32 บิต + สูตร · 3.2 กดบิตเล่น · 3.3 ค่าพิเศษ |
| 4 | `convert` | แปลงเลขทศนิยมเป็น IEEE 754 | แปลง 6.5 เป็นบิตยังไง | ฉาก 4.1 แปลงทีละขั้น · 4.2 ถอดกลับ |
| 5 | `fp-add` · `fp-sub` · `rounding` | บวกและลบเลข Floating-Point | บวก/ลบ float ทำยังไง ทำไม 0.1 + 0.2 ไม่ได้ 0.3 | ฉาก 5.1 ฐานสิบ 4 หลัก · 5.2 บวก · 5.3 ลบ · 5.4 ปัดเศษ · 5.5 ตัวอย่างในสไลด์ |
| 6 | `circuit` | วงจรบวก/ลบ Floating-Point | ฮาร์ดแวร์ทำ 4 ขั้นนั้นยังไง | ฉาก 6.1 ข้อมูลไหลผ่านวงจร |
| 7 | `playground` | ลองเอง | ลองเลขของตัวเอง | เครื่องคิดเลขแบบเห็นทุกขั้น (บิต/วงจร) + แชร์ลิงก์ |
| - | `summary` | สรุป | จำอะไรกลับไป | สรุป 6 ข้อ + อ้างอิง |

- ความสำคัญของ scene: **Must** ต้องมีก่อนส่ง · **Should** ทำถ้าไม่ติดอะไร · **Could** ทำเมื่อทุกอย่างเสร็จแล้ว · ถ้า phase ไหนกินเวลานานผิดปกติ ให้ทำ Must ของทุกบทให้ครบก่อน แล้วเก็บ Should/Could ที่ค้างไว้ทำใน Phase 8 (จดใน PROGRESS)
- ข้อความทุกตัวในหัวข้อนี้อ้างถึง key ในภาคผนวก C · ตัวเลขในวงเล็บเหลี่ยม `[ ]` คือค่าที่ต้อง render จาก engine/โมเดล
- ทุก scene ที่เป็น StepPlayer: แต่ละเฟรม render สถานะของตัวเองครบ (ย้อนกลับได้โดยไม่ replay) และ motion animate ระหว่างเฟรมทั้งไปและกลับ (stage1 8.1)

### 3.1 Hero (`#top`)
- ข้อความ C.2 · ปุ่ม "เริ่มเรียน" (ไป `#binary`) และ "ข้ามไปลองเอง" (ไป `#playground`) · ป้าย "ควรรู้มาก่อน"
- **HeroTeaser (Must)**: `6.5 + 3.75 = 10.25` ตัวใหญ่ → ตัวเลขทั้งสามพลิกเป็น register 32 บิตสีตามส่วน พร้อม hex `[0x40D00000] + [0x40700000] = [0x41240000]` → ลูกศรชี้ลง "ข้างในเกิดอะไรขึ้น เลื่อนลงไปดู" · เล่นเองครั้งเดียวหลังโหลด (reduced motion: แสดงสถานะสุดท้ายทันที) · มีปุ่มเล่นซ้ำ · H1 และข้อความต้อง render จาก server ก่อน (ไม่ให้ animation ถ่วง LCP)
- **JourneyMap (Must)**: chip 7 อันตามลำดับบท กดแล้วเลื่อนไปบทนั้น (มือถือเลื่อนแนวนอนได้)

### 3.2 บทที่ 1 บวกและลบเลขฐานสอง (`#binary`)
- เป้าหมาย: ทบทวนสิ่งที่ใช้ต่อในบทที่ 5–6: ตัวทด, ลบ = บวกค่าติดลบผ่าน ALU, overflow, เลื่อนบิต = หาร 2
- คำศัพท์: Carry, Full adder, Two's complement, Overflow, ALU, Shift (C.4)
- **ฉาก 1.1 บวกทีละหลัก (Must)** · โมเดล `int/adder.ts` · default `7 + 6` แบบ 8 บิต (สไลด์ w03c หน้า 3) · input A, B (0–255) + สลับ 4/8 บิต
  | เฟรม | ภาพ | caption |
  |---|---|---|
  | เริ่ม | แถว A, B, แถวตัวทดว่างด้านบน, แถวผลว่าง | `int.add.start` |
  | หลักที่ i (ไล่จากขวา) | หลัก i สว่าง · กล่อง full adder เล็ก ๆ ใต้หลักนั้นรับ a, b, carry in → บิตผลหล่นลงแถวผล · ตัวทดออกเป็นลูกศรโค้งไปช่องตัวทดของหลักถัดไป | `int.add.column` |
  | หลักที่เหลือ | ถ้าหลักที่เหลือเป็น 0 ทั้งหมดและไม่มีตัวทด รวบเป็นเฟรมเดียว | `int.add.rest` |
  | จบ | แถวผล + ค่าฐานสิบ · ถ้ามีตัวทดหลุดหลักซ้ายสุดจะตกลงกล่องเส้นประนอก register | `int.add.end` / `int.add.carryOut` |
- **ฉาก 1.2 ลบด้วย ALU ตัวเดิม (Must)** · default `7 − 6` แบบ 4 บิต (สไลด์ w03c หน้า 11, 33) · ภาพหลักคือ ALU black box ที่มีขา `Binvert` และ `CarryIn` (แบบสไลด์ w03c หน้า 30–33)
  | เฟรม | ภาพ | caption |
  |---|---|---|
  | 1 | สมการ `[A] − [B]` เปลี่ยนเป็น `[A] + (−[B])` | `int.sub.rewrite` |
  | 2 | ขา Binvert สว่างเป็น 1 · บิตของ B พลิกทีละบิต (flip) | `int.sub.invert` |
  | 3 | ขา CarryIn สว่างเป็น 1 · เลข 1 ไหลเข้าหลักขวาสุด | `int.sub.carryIn` |
  | 4 | ตัวทดวิ่งเร็ว ๆ แบบฉาก 1.1 (ไม่แยกเฟรมรายหลัก) | `int.sub.add` |
  | 5 | ผล + ค่าฐานสิบ · ตัวทดที่หลุดซ้ายสุดจางหายไป | `int.sub.end` |
- **ฉาก 1.3 วงล้อ overflow (Should)** · วงกลม 16 ช่องของเลข 4 บิตแบบ two's complement (−8 ถึง 7 ตามสไลด์ w03c หน้า 4) แต่ละช่องมีบิตกำกับ · chip 8 กรณีของสไลด์ w03c หน้า 6–9
  | เฟรม | ภาพ | caption |
  |---|---|---|
  | 1 | ช่วง −8 ถึง 7 สว่างรอบวง · รอยต่อระหว่าง 7 กับ −8 เป็นเส้นแดง | `int.wheel.range` |
  | 2 | หมุดที่ A | `int.wheel.start` |
  | 3 | หมุดเดิน B ช่อง (บวก = ตามเข็ม, ลบ = ทวนเข็ม) | `int.wheel.walk` |
  | 4 | ถ้าข้ามรอยต่อ: วงกระพริบสี error + ป้าย overflow · ไม่ข้าม: ป้ายถูกต้อง | `int.wheel.ok` / `int.wheel.overflow` |
  - ใต้วงมีกติกา 1 บรรทัด `int.wheel.rule`
- **ฉาก 1.4 เลื่อนบิต (Must)** · โมเดล `shiftRight` · ค่า 8 บิต default 104 · slider "เลื่อนขวา s ตำแหน่ง" (0–4) ไม่ใช่ StepPlayer · บิตทั้งแถวไหลไปทางขวา 0 เติมซ้าย บิตที่ตกขอบขวาหล่นลงถาด · ค่าฐานสิบใต้ register เปลี่ยนเป็น ÷2 ทุกครั้ง (`[104] → [52] → [26] → [13]`) · chip "13" ให้เห็นบิต 1 หล่นทิ้ง (ค่าไม่ตรง ÷2 พอดี → ปูไปเรื่อง sticky ในบทที่ 5) · caption สดบรรทัดเดียว `int.shift.live`
- สรุปท้ายบท `takeaway.binary` · ประโยคส่งต่อ `bridge.binary` · คำถามเช็ก `quiz.binary`

### 3.3 บทที่ 2 เลขทศนิยมในโปรแกรม (`#float-in-c`)
- เป้าหมาย: เห็นว่าโปรแกรมจริงใช้เลขทศนิยม และ float เก็บแบบ scientific notation ฐานสอง
- คำศัพท์: float, double, Scientific notation, Normalized, Floating point, FPU
- **ฉาก 2.1 โค้ด C (Must)** · `CodeCard` แสดงโค้ด (ข้อความโค้ดอยู่ใน content) · ผลที่พิมพ์คำนวณจาก engine + `format-c.ts`
  ```c
  int   i = 7 + 6;
  float f = 6.5f + 3.75f;
  printf("%d %f\n", i, f);
  ```
  | เฟรม | ภาพ | caption |
  |---|---|---|
  | 1 | บรรทัด `int` สว่าง → ลูกศรเข้า chip "ALU" (ไอคอนเดียวกับบทที่ 1) → `[13]` | `c.int` |
  | 2 | บรรทัด `float` สว่าง → ลูกศรเข้า chip "FPU ?" (กล่องเครื่องหมายคำถาม) → `[10.250000]` | `c.float` |
  | 3 | แถบ output พิมพ์ทีละตัวอักษร `[13 10.250000]` | `c.print` |
  - chip "0.1f + 0.2f": โค้ด `float g = 0.1f + 0.2f; printf("%.9f\n", g);` → output `[0.300000012]` สั่นเบา ๆ + ป้าย `c.teaser` ลิงก์ไป `#rounding`
  - (Could) ป้ายเล็ก "คำสั่งเครื่อง: `add` (int) · `add.s` (float)" ตาม MIPS ในตำรา P&H
  - "ทำไม?" `why.c.overflow`: ภาษา C ไม่สนใจ overflow ของ int (สไลด์ w03c หน้า 12)
- **ฉาก 2.2 จุดที่เลื่อนได้ (Must)** · โมเดล `sci/decimal.ts` (`normalizeDecimal`) · chip ตัวอย่างจากสไลด์ w03c_mult หน้า 13: `0.002 × 10⁴`, `987.02 × 10⁹`, `2.34 × 10⁵⁶` และ chip ฐานสอง `110.1₂` (6.5 จาก engine)
  | เฟรม | ภาพ | caption |
  |---|---|---|
  | 1 | ตัวเลขพร้อมป้าย "ยังไม่ normalized" (ถ้าใช่) | `point.not` / `point.already` |
  | 2…k | จุดกระโดดทีละหลัก ป้าย `× 10ⁿ` นับตาม | `point.hopLeft` / `point.hopRight` |
  | สุดท้าย | ป้ายถูก "normalized" | `point.done` |
  - chip ฐานสอง: `110.1₂ → [1.101₂ × 2²]` caption `point.binary`
- สรุป `takeaway.float` · คำถามเช็ก `quiz.float`

### 3.4 บทที่ 3 มาตรฐาน IEEE 754 (`#ieee754`)
- เป้าหมาย: รู้ว่า 32 บิตแบ่งยังไง แต่ละส่วนหมายถึงอะไร และใช้สูตรตามสไลด์ได้
- คำศัพท์: IEEE 754, Sign, Exponent, Bias, Significand, Hidden bit
- ป้ายข้อเท็จจริงสั้น ๆ ต้นบท (ไม่ใช่ scene): "IEEE Std 754-1985 (ฉบับปัจจุบัน 754-2019)" · "float = single 32 บิต · double = 64 บิต" (สไลด์ w03c_mult หน้า 14)
- **ฉาก 3.1 แบ่ง 32 บิต + สูตร (Must)** · `Register32` · default 6.5 · input: ทศนิยมหรือ hex
  | เฟรม | ภาพ | caption |
  |---|---|---|
  | 1 | 32 ช่องสีเทา มีเลขตำแหน่ง 31…0 | `layout.bits` |
  | 2 | บิต 31 เป็นสีส้ม + วงเล็บ "Sign 1 บิต" | `layout.sign` |
  | 3 | บิต 30–23 เป็นสีเขียว + "Exponent 8 บิต" | `layout.exp` |
  | 4 | บิต 22–0 เป็นสีน้ำเงิน + "Significand 23 บิต" | `layout.sig` |
  | 5 | สูตรประกอบทีละชิ้น แต่ละชิ้นสีตรงกับส่วนของมัน | `layout.formula` |
  | 6 | แทนค่า sign: `[0] → +` | `layout.plugSign` |
  | 7 | แทนค่า exponent: `[10000001₂] = [129] → 2^[129 − 127] = 2^[2]` | `layout.plugExp` |
  | 8 | hidden bit `1.` โผล่หน้า significand: `1.[101]₂ = [1.625]` | `layout.plugSig` |
  | 9 | `[1.625] × [4] = [6.5]` | `layout.value` |
- **ฉาก 3.2 กดบิตเล่น (Should)** · ไม่ใช่ StepPlayer · register กดบิตได้ (เป้ากด ≥ 44px บนมือถือ: แถวที่ 2 แยก significand) + **เส้นช่วง (exponent window)**: เส้นจำนวนแบบ log แบ่งเป็นช่วง `[2ᵉ, 2ᵉ⁺¹)` ช่วงปัจจุบันสว่าง (exponent เลือกช่วง) และหมุดในช่วง (significand เลือกตำแหน่งในช่วง) · กดบิต exponent → ช่วงกระโดด (×2 หรือ ÷2) · กดบิตบนสุดของ significand → หมุดเลื่อนครึ่งช่วง · chip: 1, 1.5, 2, 3, 6.5, 0.75 · caption สด `bitplay.live`
- **ฉาก 3.3 ค่าพิเศษ (Should)** · แถบ exponent 3 โซน (0 · 1–254 · 255) ตามตารางสไลด์ w03c_mult หน้า 15 · กดโซน → โหลดตัวอย่างจากสไลด์หน้า 16–17 (`0x00000000`, `0x80000000`, `0x00000001`, `0x00800000`, `0x7F7FFFFF`, `0x7F800000`, `0xFF800000`, `0x7FC00000`) แสดง register + ค่า (decode จาก engine) · caption `special.zone0` / `special.zoneNormal` / `special.zone255` · ช่วงค่า `special.range` (ค่าเล็ก/ใหญ่สุดจาก engine)
- **แถบเทียบ double (Could)**: แท่ง 1/8/23 เทียบ 1/11/52 และ bias 127 เทียบ 1023 (คำนวณจาก `format.ts`) · caption `double.compare`
- สรุป `takeaway.ieee754` · คำถามเช็ก `quiz.ieee754`

### 3.5 บทที่ 4 แปลงเลขทศนิยมเป็น IEEE 754 (`#convert`)
- เป้าหมาย: แปลง 6.5 และ 3.75 (ตัวที่จะใช้บวกในบทที่ 5) เป็น 32 บิตเองได้
- คำศัพท์: Binary point, คูณ 2 ซ้ำ, Normalize, Biased exponent, Hex
- **ฉาก 4.1 แปลงทีละขั้น (Must)** · frames จาก `encodeDecimal` steps · default 6.5 · input ทศนิยม · chip: 6.5, 3.75, −0.75 (P&H), 0.1, 10.25
  | เฟรม | ภาพ | caption |
  |---|---|---|
  | แยก | ตัวเลขแตกเป็นส่วนเต็มกับส่วนเศษ (ลอยแยกกัน) | `enc.split` |
  | ส่วนเต็ม | chip ค่าประจำหลัก …8 4 2 1 สว่างเฉพาะที่ใช้ → `[110]₂` | `enc.int` |
  | คูณ 2 (1 เฟรมต่อรอบ) | "เครื่องคูณ 2": เศษเข้า → ×2 → เลขหน้าจุดหล่นลงช่องบิต | `enc.times2` |
  | วนซ้ำ (ถ้ามี) | รอบที่เศษซ้ำเดิมไฮไลต์ + ขีดบนส่วนที่วน แสดงไม่เกิน 8 รอบ | `enc.loop` |
  | รวม | `[110.1]₂` | `enc.join` |
  | normalize | จุดกระโดดทีละช่องจนเหลือ `1.` ป้าย `× 2ᵉ` นับ | `enc.normalize` |
  | sign | บิต 31 เติม | `enc.sign` |
  | exponent | `[2] + 127 = [129]` แล้วบิต `[10000001]` ไหลเข้าช่อง | `enc.exp` |
  | significand | บิตหลังจุดบินเข้าช่อง 23 บิต 0 เติมที่เหลือ · `1` หน้าจุดจางเป็นเงา "hidden bit" | `enc.sig` / `enc.hidden` |
  | ปัด (ถ้าเกิน 23 บิต) | `GrsLens` ที่ท้าย significand + ป้ายค่าที่เก็บจริง | `enc.round` |
  | hex | 32 บิตจับกลุ่มละ 4 → hex ทีละหลัก | `enc.hex` |
  - ถ้าค่าที่เก็บไม่เท่าค่าที่พิมพ์ แสดง `alert-warning` สั้น ๆ `enc.inexact`
- **ฉาก 4.2 ถอดกลับ (Should)** · frames จาก `decode` steps · input hex · chip: `0xC0A00000` (ตัวอย่าง P&H = −5), `0x41240000`, `0x3DCCCCCD`
  | เฟรม | caption |
  |---|---|
  | แยก 3 ส่วน (วงเล็บสี) | `dec.fields` |
  | Exponent − 127 | `dec.exp` |
  | 1.significand | `dec.sig` |
  | แทนสูตร → ค่า | `dec.value` |
- สรุป `takeaway.convert` · คำถามเช็ก `quiz.convert`

### 3.6 บทที่ 5 บวกและลบเลข Floating-Point (`#fp-add`, `#fp-sub`, `#rounding`)
- เป้าหมาย: บวก/ลบได้ครบ 4 ขั้น และอธิบายได้ว่าทำไมผลบางครั้งไม่ตรงค่าจริง
- คำศัพท์ (แสดงครั้งเดียวต้นบท): Align, Guard / Round / Sticky, Round to nearest even, LSB, Overflow / Underflow
- `StepBar` 4 ไอคอนอยู่เหนือ stage ของทุก scene ในบทนี้และบทที่ 6 (ขั้นปัจจุบันสว่าง)
- **ฉาก 5.1 ฐานสิบเก็บได้ 4 หลัก (Must)** · โมเดล `sci/decimal.ts` (`decimalAdd`, p = 4) · ตัวอย่าง P&H `9.999 × 10¹ + 1.610 × 10⁻¹` · ช่องตัวเลข 4 ช่องต่อแถว
  | เฟรม | ภาพ | ขั้นใน StepBar | caption |
  |---|---|---|---|
  | 1 | สองแถว `x.xxx × 10ᵉ` · ป้าย "เก็บได้ 4 หลัก" | - | `dec4.start` |
  | 2 | เทียบเลขชี้กำลัง ต่างกัน `[2]` | ① | `dec4.compare` |
  | 3 | แถวล่างไหลขวา `[2]` ช่อง หลักที่เลยช่องที่ 4 หล่นทิ้ง (เทา) | ① | `dec4.align` |
  | 4 | บวกตามหลัก ตัวทดวิ่ง → `[10.015]` | ② | `dec4.add` |
  | 5 | จุดกระโดดซ้าย 1 → `[1.0015] × 10^[2]` | ③ | `dec4.normalize` |
  | 6 | ปัดให้เหลือ 4 หลัก → `[1.002] × 10^[2]` | ④ | `dec4.round` |
  - ประโยคส่งต่อ `bridge.dec4`: ฐานสองทำ 4 ขั้นเดียวกัน
- **ฉาก 5.2 บวก (Must)** · `FpOpScene` · frames จาก `addSub` steps ผ่าน `lesson/fp-frames.ts` · default `6.5 + 3.75` · input A, B, ปุ่ม + / − · chip ตัวอย่างทั้งหมดในภาคผนวก D.1
  | เฟรม | ภาพ | StepBar | caption |
  |---|---|---|---|
  | แยกส่วน | register ของ A และ B แตกเป็นการ์ด: sign, `× 2ᵉ` (ค่าจริง), significand · `1` หน้าจุดโผล่แบบเส้นประ (hidden bit) | - | `fp.unpack` |
  | เทียบ exponent | ป้าย `2ᵉ` ของสองตัวเด้งเข้าหากัน แสดงผลต่าง `[d]` | ① | `fp.compare` / `fp.compareZero` |
  | align (1 เฟรมต่อการเลื่อน 1 ตำแหน่ง สูงสุด 4 เฟรม) | แถวของตัวที่ exponent น้อยกว่าไหลขวา 1 ช่อง ป้าย `× 2ᵉ` ของมัน +1 · บิตที่เลยบิตสุดท้ายเข้าช่อง G R แล้วหล่นลงถัง S | ① | `fp.alignStep` |
  | align เร่ง (ถ้า d > 4) | ไหลต่อรวดเดียว ถัง S รับบิตที่หลุดทั้งหมด | ① | `fp.alignFast` |
  | บวก significand | แถวผลโผล่ ตัวทดวิ่งเร็ว ๆ แบบบทที่ 1 | ② | `fp.add` |
  | normalize | จุดกระโดด (ขวา 1 เมื่อได้ 2 หลักหน้าจุด / ซ้าย k เมื่อหน้าจุดเป็น 0) ป้าย exponent นับตาม · มาตรวัด exponent เล็ก ๆ ขึ้นเครื่องหมายถูก (ถ้า engine มี step range ที่ไม่ใช่ ok ให้แสดงเฟรม overflow/underflow แยก) | ③ | `fp.normRight` / `fp.normLeft` / `fp.normNone` · `fp.overflow` / `fp.underflow` |
  | ปัด | `GrsLens` ซูมท้าย significand: LSB · G · R · S + ไอคอนการตัดสิน (ลง/ขึ้น/เสมอ→คู่) · ถ้าขึ้น +1 ที่ LSB (ถ้าตัวทดล้นให้จุดกระโดดอีกครั้ง) | ④ | `fp.roundExact` / `fp.roundDown` / `fp.roundUp` / `fp.tieDown` / `fp.tieUp` / `fp.roundCarry` |
  | ประกอบผล | การ์ดกลับเป็น register 32 บิต + hex + ค่าฐานสิบ · ถ้าไม่ตรงค่าจริงแสดง `≈` | - | `fp.pack` |
  - "ทำไม?" `why.bigFirst` (ขั้นเทียบ exponent) และ `why.align` (ขั้น align)
  - ค่าพิเศษ (inf, nan, 0) แสดงเฟรมเดียว `fp.special` ตามกฎของ engine แล้วจบ
  - การแสดง significand (`BitTrack`): **compact** (default) แสดงถึงบิต 1 ตัวสุดท้ายที่มีของทุกแถวแล้วรวบที่เหลือเป็น chip "+ 0 อีก n ตัว" · **tail** (อัตโนมัติเมื่อมีการปัดหรือ d > 8) แสดง `1.` + 2 บิตแรก + "…" + 6 บิตท้าย + G R S · **full** (ปุ่ม "แสดงครบ 24 บิต") เลื่อนแนวนอนได้ในกล่อง
- **ฉาก 5.3 ลบ (Must)** (`#fp-sub`) · component เดียวกับฉาก 5.2 ตั้ง op = − · default `0.5 − 0.4375` · เพิ่มเฟรม `fp.negate` หลังแยกส่วน (บิต sign ของ B พลิก) และ caption ของขั้น ② เป็น `fp.sub` (ภาพ: กล่อง ALU เล็กมุมขวาโชว์ Binvert = 1, CarryIn = 1 แบบบทที่ 1 แล้วผลโผล่) · chip `3.75 − 6.5` แสดงการสลับตัว (`fp.swap`) ผลใช้ sign ของตัวที่ใหญ่กว่า · chip `1.0000001 − 1` แสดงหักล้างแล้ว normalize ซ้าย 23 ตำแหน่ง
- **ฉาก 5.4 ปัดเศษ (Must)** (`#rounding`) · default `0.1 + 0.2` · chip `16777216 + 1`, `16777216 + 3`, `1 + 1e-8`, `100 + 0.1`
  | เฟรม | ภาพ | caption |
  |---|---|---|
  | 1 | ผลหลัง normalize ใน `BitTrack` แบบ tail · บิตที่เกิน 24 บิตเป็นสีชมพู (G R S) | `round.overflowBits` |
  | 2 | `RoundLine`: ค่าที่เก็บได้สองค่า (ลง = `[kept]`, ขึ้น = `[kept + 1 ulp]`) + จุดผลจริงที่ตำแหน่ง `[pos]` (จาก exact ของ engine) | `round.line` |
  | 3 | ตารางกติกา 3 แถว (ไอคอน ลง/ขึ้น/เสมอ) แถวที่ใช้สว่าง | `round.rule.*` |
  | 4 | ลูกศรจากจุดไปค่าที่เลือก · ผลสุดท้าย | `round.result` |
  | 5 | เทียบค่าที่พิมพ์ (`0.3`) กับผล `[0.300000011920928955078125]` ผลต่าง `[…]` | `round.compare` |
  - "ทำไม?" `why.grs` (ทำไม 3 บิตพอ), `why.even` (ทำไมเลือกเลขคู่)
- **ฉาก 5.5 ตัวอย่างในสไลด์ (Should)** · การ์ดเล็ก "ลองตัวอย่างในสไลด์ (double)" · คำนวณด้วย engine `BINARY64`: `x = 1e17`, `y = x + 20` → `y − x = [16]` · `(−x + x) + 20 = [20]` แต่ `−x + (x + 20) = [16]` · ภาพ: เส้นจำนวนรอบ 1e17 มีขีดทุก `[16]` (ulp) จุด 1e17 + 20 ดูดเข้าขีดที่ใกล้ที่สุด · caption `slide.funfact1`, `slide.funfact2`
- สรุป `takeaway.fp` · คำถามเช็ก `quiz.fp`

### 3.7 บทที่ 6 วงจรบวก/ลบ Floating-Point (`#circuit`)
- เป้าหมาย: เห็นว่า 4 ขั้นในบทที่ 5 คือกล่องวงจรอะไร ข้อมูลไหลผ่านยังไง (black box ไม่ลงระดับ gate)
- คำศัพท์: Small ALU, MUX, Shifter, Big ALU, Control, Rounding hardware
- **ฉาก 6.1 ข้อมูลไหลผ่านวงจร (Must)** · `FpAdderDiagram` (SVG วาดเอง ข้อมูลตำแหน่งกล่อง/สายใน `src/content/lesson/circuit.ts`) · ใช้ frames ชุดเดียวกับฉาก 5.2/5.3 (`fp-frames.ts`) + `lesson/circuit-map.ts` บอกว่าแต่ละเฟรมกล่อง/สายไหนสว่าง และป้ายค่าบนสายคืออะไร · chip: `6.5 + 3.75`, `0.5 − 0.4375`, `0.1 + 0.2` · input A, B, op
  - กล่อง (บนลงล่าง ตามโครงใน P&H 3.5): register A, B (s | exponent | significand) → **Small ALU** (Exponent A − Exponent B) → **Control** (ดูผลต่างและ sign, สั่ง MUX/shift/บวกหรือลบ) → **MUX** 3 ตัว (exponent ที่ใหญ่กว่า · significand ของตัวเล็ก · significand ของตัวใหญ่) → **Shift right** (เลื่อน d ตำแหน่ง เหมือน barrel shifter ในสไลด์) → **Big ALU** (บวก/ลบ significand: Binvert/CarryIn เหมือนบทที่ 1) → **Normalize** (เลื่อนซ้าย/ขวา) คู่กับ **Inc/Dec** (เพิ่ม/ลด exponent) → **Round** (G R S) → ถ้าปัดแล้วล้นมีสายเส้นประย้อนกลับไป Normalize → register ผลลัพธ์
  | เฟรม (id เดียวกับฉาก 5.2) | กล่อง/สายที่สว่าง | ป้ายบนสาย | caption |
  |---|---|---|---|
  | แยกส่วน | register A, B และสายออก | `[129]`, `[1.101]`… | `hw.unpack` |
  | (ลบ) กลับ sign | Control + สาย sign ของ B | `op = −` | `hw.negate` |
  | เทียบ exponent | Small ALU → Control | `[129] − [128] = [1]` | `hw.compare` |
  | align | MUX 3 ตัว + Shift right | `>> [1]` | `hw.align` |
  | บวก/ลบ | Big ALU | `[10.1001]` | `hw.add` / `hw.sub` |
  | normalize | Normalize + Inc/Dec | `>> [1]`, `exp +[1]` | `hw.normalize` |
  | ปัด | Round (+ สายย้อนถ้าล้น) | `G R S = [000]` | `hw.round` |
  | ประกอบผล | register ผลลัพธ์ | `[0x41240000]` | `hw.pack` |
  - กดกล่องได้ (button): popover บอกหน้าที่ 1 บรรทัด (จากคำศัพท์) + ค่าเข้า/ออกของเฟรมนี้
  - ข้าง stage บน desktop มีแถบ "เทียบกับบทที่ 5" แสดง `BitTrack` ย่อของเฟรมเดียวกัน (Could)
  - "ทำไม?" `why.cycles`: วงจรจริงใช้หลาย clock cycle และทำแบบ pipeline ได้ (P&H 3.5)
- สรุป `takeaway.circuit` · คำถามเช็ก `quiz.circuit`

### 3.8 บทที่ 7 ลองเอง (`#playground`)
- **Playground (Must)**: input A, B, ปุ่ม + / −, chip ตัวอย่างทั้งหมด · สลับมุมมอง "บิต" (`FpOpScene`) / "วงจร" (`FpAdderDiagram`) ใช้ frames เดียวกันและ index ขั้นเดียวกัน · การ์ดผล: ค่าที่เก็บจริง, ผลจริงของค่าที่พิมพ์, ผลต่าง, hex, flag (inexact/overflow) · ปุ่ม "คัดลอกลิงก์" (query `?a=&b=&op=` + `#playground` เปิดแล้วได้ state เดิม · ดัดแปลง `src/lib/url-state.ts` ให้เหลือ single precision) · โหมดนำเสนอ
- ไม่มีแถบคำศัพท์และคำถามเช็ก (เป็นเครื่องมือ)

### 3.9 สรุปท้ายหน้า (`#summary`)
- สรุป 6 ข้อ (C.9) คู่กับไอคอน · ปุ่ม "กลับไปบทที่…" เล็ก ๆ ต่อข้อ
- อ้างอิง (C.10) + เครดิตใน footer เดิม

---

## 4. หน้าเว็บและ component

### 4.1 Route, redirect และ metadata
- route เดียวสำหรับเนื้อหา: `/` (static) · หน้าอื่นที่เหลือ: `not-found`, `error`, `opengraph-image`, `icon`, `sitemap.xml`, `robots.txt` และ `/dev/kit` (เฉพาะ dev: production เรียก `notFound()` ไม่อยู่ใน sitemap)
- ลบ `src/app/learn/**` และ `src/app/lab/**` · เพิ่ม redirect ถาวร (308) ใน `next.config.ts` → `redirects()` (ตรวจวิธีเขียนกับ docs ของ Next.js 16 ใน `node_modules/next/dist/docs` และ Context7 ก่อน):
  | จาก | ไป |
  |---|---|
  | `/learn` | `/` |
  | `/learn/number-systems` | `/#binary` |
  | `/learn/binary-fractions` | `/#convert` |
  | `/learn/ieee-754` | `/#ieee754` |
  | `/learn/add-sub` | `/#fp-add` |
  | `/learn/mul-div` | `/` |
  | `/lab` (มี query) | `/?<query เดิม>#playground` |
- **ระวัง**: redirect ของ Next.js ส่ง query ต่อให้ปลายทาง ถ้าปลายทางมี `#` อาจได้ URL ผิดรูป (`/#playground?a=…`) → ทดสอบด้วย e2e จริง ถ้าผิดให้ redirect `/lab` → `/` แล้วให้ playground ตรวจ query ตอนโหลดและเลื่อนไป `#playground` เอง
- ลิงก์ภายในหน้าใช้ `<a href="#id">` (ไม่ใช้ `Link` กับ hash เพราะ `typedRoutes`) · ทุก section มี `scroll-margin-top` เท่าความสูง header
- metadata: title `comkrub · บวก ลบ Floating-Point แบบเห็นทุกบิต` · description = `site.description` · OG image ใหม่ (หัวข้อ 7) · sitemap มีแค่ `/`

### 4.2 โครงหน้าและการนำทาง
- `src/app/page.tsx` (server component) วาง section ตาม registry `src/content/lesson/sections.ts` (แหล่งข้อมูลเดียวของลำดับ id ชื่อ hook คำศัพท์ และอ้างอิงของแต่ละบท)
- **Header** (glass เดิม): โลโก้ comkrub · desktop ≥ 1024px มี `ProgressNav` = จุด 7 จุดพร้อมชื่อสั้น (scrollspy ด้วย IntersectionObserver ไฮไลต์บทที่อยู่) · มือถือแสดง pill "บทที่ n · ชื่อสั้น" + ปุ่มเมนู → drawer เดิมแสดงรายการบท (กดแล้วเลื่อนไปและปิด drawer)
- แถบความคืบหน้าบาง ๆ ใต้ header (สัดส่วนการเลื่อนทั้งหน้า) · ไม่แก้ hash ใน URL ตอนเลื่อน (ไม่สแปม history)
- ห้าม scroll-jacking หรือ pin section ตามการเลื่อน (ใช้ยากบนมือถือและไม่ accessible) · เลื่อนปกติ แล้วกดเล่นที่ stage
- ท้ายทุกบทมีปุ่ม `NextUp` "ไปต่อ: บทที่ n+1 …"
- footer เดิม: คำอธิบายใหม่ (C.11), รายการบทจาก registry, อ้างอิง, เครดิตผู้จัดทำและอาจารย์ (ห้ามแก้), ป้าย Analytics · ซ่อนลิงก์ GitHub เมื่อ `site.githubUrl === null`

### 4.3 Template ของบท (`LessonSection`)
ลำดับในทุกบท (บทที่ 1–6): eyebrow "บทที่ n" → ชื่อบท → hook 1 บรรทัด → `VocabStrip` → scene ตามลำดับ (แต่ละ scene มีหัวเรื่องสั้น) → `Takeaway` → `QuickCheck` → `SourceNote` → `NextUp`
- `VocabStrip`: การ์ดคำศัพท์ (คำ, ป้ายไทยสั้นถ้ามี, ความหมาย 1 บรรทัด) · มือถือเป็นแถวเลื่อนแนวนอน (scroll-snap, เห็นการ์ดถัดไปโผล่ครึ่งใบ) · ≥ 768px เป็น grid 2–3 คอลัมน์ · `Term` เดิมเปลี่ยนให้อ่านจาก `vocab.ts` (แตะคำในป้าย/caption แล้วเห็นความหมาย)
- `QuickCheck`: คำถาม 1 ข้อ ตัวเลือก 3 ข้อ (radio) กด "ตรวจ" แล้วบอกถูก/ผิด + เหตุผล 1 บรรทัด · ใช้คีย์บอร์ดได้ · ไม่เก็บคะแนน · ตัวเลือกที่เป็นบิต/hex คำนวณจากโมเดล
- `SourceNote`: "อ้างอิง: สไลด์ w03c หน้า 3, 10–11 · P&H 3.2" ตัวเล็กสีจาง

### 4.4 StepPlayer แบบ stage-first (ปรับของเดิม ไม่สร้างใหม่ซ้ำ)
- คง `usePlayer`, ความเร็ว, คีย์บอร์ด (เฉพาะเมื่อโฟกัสอยู่ใน player), โหมดนำเสนอ, `aria-live`, reduced motion และ API `steps` + `render(index)` · ปรับหน้าตาให้ภาพเป็นพระเอก:
  1. **Stage** ใหญ่ด้านบน (`glass-solid`) จองความสูงด้วย `minHeight` ต่อ scene กัน layout shift
  2. **Caption** 1–2 บรรทัดใต้ stage (`aria-live="polite"`) + ปุ่ม "ทำไม?" ท้ายบรรทัดถ้าขั้นนั้นมี detail
  3. **แถบควบคุม** แถวเดียว: ย้อน · เล่น/หยุด · ถัดไป · จุดบอกขั้น (กดกระโดดได้ ขั้นปัจจุบันเป็นแคปซูลยาว มือถือเลื่อนได้) · ความเร็ว · เริ่มใหม่ · นำเสนอ · ตัวนับ "3/8" ตัวเล็ก
  4. ตัวบอกขั้นแบบชื่อยาว (daisyUI `steps`) ของเดิม **เอาออก** (เป็นข้อความเยอะ) · `flow` เปลี่ยนเป็น `StepBar` 4 ไอคอนสำหรับ scene บวก/ลบ
  5. **ปุ่มเล่นใหญ่** ทับกลาง stage ก่อนกดครั้งแรก (`poster`) · กดแล้วเล่นอัตโนมัติจากขั้นแรก
- `PlayerStep` เพิ่ม `caption: string` และ `detail?: string` (ข้อความจาก content) · `title` สั้นใช้เป็น `aria-label` ของจุดบอกขั้น
- จังหวะ: ขั้นละ `STEP_MS` เดิม (2400 ms ที่ 1×) · animation ย่อยในขั้นใช้เวลาไม่เกิน 60% ของขั้นและหารด้วยความเร็ว (`PlayerSpeedContext`)
- แก้ `tests/e2e/player.spec.ts` ให้ตรงหน้าตาใหม่ (ปุ่ม, จุดบอกขั้น, คีย์บอร์ด, reduced motion, โหมดนำเสนอ)

### 4.5 ชิ้นส่วนภาพ (`src/components/stage/`)
| component | ใช้ทำอะไร | หมายเหตุ |
|---|---|---|
| `BitTrack` | แถวเลขฐานสองหลายแถวเรียงคอลัมน์ตรงกันที่จุดฐานสอง (คอลัมน์: ตัวทด 2¹, hidden 2⁰, significand 2⁻¹…2⁻²³, G, R, S) · โหมด compact / tail / full · แต่ละบิตเป็น `motion` element ที่มี key คงที่ (แถว + ตำแหน่งเดิม) ให้ `layout` เลื่อนเองตอน align | ฉาก 5.x, 6.1 (ย่อ), 4.1 |
| `BinaryPoint` | จุดฐานสองเป็น element แยก กระโดดด้วย `layoutId` | มีอยู่แล้วใน `viz/bit-line.tsx` ยกมาใช้ |
| `ExponentTag` | ป้าย `× 2ᵉ` ตัวเลขนับขึ้น/ลง (`AnimatedNumber` เดิม) | |
| `CarryArc` | ลูกศรโค้งตัวทด (SVG path + `pathLength`) | ฉาก 1.1, 5.1, 5.2 |
| `StickyBucket` | ถังเล็กใต้คอลัมน์ S รับบิตที่หล่น ค่า S เปลี่ยนเป็น 1 เมื่อมีบิต 1 ตกลงมา | |
| `GrsLens` | กรอบแว่นขยายรอบ LSB, G, R, S + ไอคอนการตัดสิน | |
| `RoundLine` | เส้นจำนวน 2 ขีด + จุดผลจริง + ลูกศร | ฉาก 5.4 · ตำแหน่งจาก `lesson/round-line.ts` |
| `Register32` | register กดบิตได้ แตกเป็น 2 แถวบนมือถือ | ยกจาก `bits/register.tsx` + `bit-cell.tsx` เดิม · เปลี่ยนป้าย Fraction → Significand |
| `FieldBrackets` | วงเล็บปีกกา + ป้ายใต้กลุ่มบิต | |
| `NumberWheel` | วงล้อ 16 ช่อง (SVG) หมุดเดิน | ฉาก 1.3 |
| `TimesTwo` | "เครื่องคูณ 2" ของการแปลงเศษ | ฉาก 4.1 |
| `CodeCard` | โค้ด C ไฮไลต์บรรทัด + แถบ output พิมพ์ทีละตัว | ฉาก 2.1 (เขียน highlight เองด้วย span ไม่เพิ่ม library) |
| `StepBar` | ไอคอน 4 ขั้น (ตรวจชื่อไอคอนใน lucide-react ก่อนใช้) | บทที่ 5, 6, 7 |
| `ExponentWindow` | เส้นช่วง `[2ᵉ, 2ᵉ⁺¹)` + หมุด | ฉาก 3.2 |
| `MiniAlu` | ALU black box มีขา Binvert, CarryIn | ฉาก 1.2, 5.3 |
- เทคนิค motion (stage1 8.3): animate เฉพาะ `transform` / `opacity` · spring บิต `{ type: 'spring', stiffness: 420, damping: 36 }` · motion รายบิตไม่เกิน ~100 บิตต่อจอ · `MotionConfig reducedMotion="user"`
- สีใหม่: token `carry` / `carry-ink` ใน `@theme` ของ `globals.css` (ตรวจ contrast ด้วย axe)

### 4.6 วงจร black box (`src/components/hw/`)
- primitive: `HwRegister` (ช่อง s | exponent | significand สีตามส่วน), `HwAlu` (ทรงคางหมูมีรอยบากแบบสไลด์), `HwMux` (ทรงแคปซูล มีขา select จาก Control), `HwBox` (Shift right, Normalize, Inc/Dec, Round, Control), `HwWire` (path มีหัวลูกศร สีตามชนิดข้อมูล · active = เส้นทึบสว่าง + ขีดวิ่งตามทิศ (ปิดเมื่อ reduced motion) · มี chip ค่าบนสาย)
- `FpAdderDiagram`: อ่าน layout จาก `src/content/lesson/circuit.ts` (`blocks[]` มี id, ชนิด, ป้าย, x, y, w, h · `wires[]` มี id, from, to, ชนิดข้อมูล, จุดหักมุม) · `viewBox` แนวตั้ง ~360 × 760 ใช้ได้ทั้งมือถือและ desktop (desktop วางคู่แผงข้อมูลด้านขวา)
- ทุกกล่องเป็น `button` (โฟกัสได้, `aria-label` = ชื่อกล่อง + สถานะ) · SVG ทั้งรูปมี `role="img"` + `aria-label` สรุปเฟรมปัจจุบัน
- ห้ามคัดลอก figure จากตำรา: จัดวางเองให้อ่านง่ายบนจอ 390px

### 4.7 จอมือถือ / desktop / โปรเจกเตอร์
- ออกแบบที่ 390 × 844 ก่อน แล้วไล่ 360, 430, 768, 1440, 1920 · ห้ามมี horizontal scroll ทั้งหน้า (โหมด full ของ `BitTrack` เลื่อนได้เฉพาะในกล่องตัวเอง)
- stage กว้างเต็มจอบนมือถือ (ขอบ 16px) · desktop กว้างสุด ~960px ข้อความกว้างสุด ~60ch
- 1920 (นำเสนอในห้อง): บิตและตัวเลขใหญ่พออ่านจากท้ายห้อง (`clamp()`) · โหมดนำเสนอเต็มจอ
- ภาษาไทย: line-height เนื้อหา ≥ 1.5, หัวข้อ ≥ 1.35 · ห้าม `leading-none` กับข้อความไทย · input 16px กัน iOS ซูม

### 4.8 Accessibility และ reduced motion
- คีย์บอร์ดใช้ได้ทุกอย่าง focus ring ชัด · ทุก scene มี caption ใน `aria-live` เป็นข้อความแทนภาพ
- reduced motion: ไม่เล่นเอง (รวม hero) · เปลี่ยนขั้นแบบตัดภาพทันทีแต่ครบทุกขั้น · ปิดขีดวิ่งบนสาย
- contrast ≥ 4.5:1 · axe ต้องไม่มี serious/critical

### 4.9 Performance
- หน้าเดียวมีหลาย scene: `SceneShell` (client) จองพื้นที่ด้วยความสูงคงที่ แสดงโครงจาง ๆ แล้วค่อยโหลดโค้ด scene ด้วย `next/dynamic` เมื่ออยู่ห่างจอไม่เกิน ~1 จอ (`useInView` ของ motion · ตรวจ docs ของ Next.js 16 และ motion ก่อนใช้)
- hero: ข้อความจาก server, animation หลัง hydrate · ฟอนต์เดิม
- เป้า Lighthouse มือถือที่ `/`: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90 (วิธีวัด stage1 10.4) · ถ้า Performance ไม่ถึงให้จดสาเหตุและสิ่งที่ลองแล้วใน REVIEW

---

## 5. Engine และโมเดล

### 5.1 `src/lib/fp` (เก็บ / ลบ)
- **เก็บ**: `format`, `bits`, `rational`, `parse`, `decode`, `round`, `encode`, `add`, `special` (เฉพาะกฎบวก/ลบ), `format-number`, `fraction`, `integer`, `bit-info`, `steps`, `simulate` · ห้ามเปลี่ยน algorithm (stage1 4.3)
- **ลบ**: `mul.ts`, `div.ts`, กฎค่าพิเศษของคูณ/หาร, step kind `sig-mul`/`sig-div`, `MulRow`/`DivRow`, `Op` เหลือ `'+' | '-'`, test และ golden ของคูณ/หาร (M*, D*), ส่วนคูณ/หารใน `scripts/test-long.mts`
- test ของบวก/ลบ **ห้ามลด `numRuns`** (การลบ test ของคูณ/หารทำได้เพราะลบ feature ออก) · exhaustive MINI8 เหลือ 2 operation · `test:long` ยังรวม ≥ 1,000,000 กรณี (เป็นบวก/ลบทั้งหมด)
- `BINARY64` เก็บไว้ (ใช้ในฉาก 5.5 และ test) · `BINARY16` ลบออกจาก UI (ใน `format.ts` เก็บไว้ได้)
- อัปเดต `docs/ENGINE.md`

### 5.2 โมเดลใหม่ (pure TypeScript, ไม่แตะ React)
| ไฟล์ | API (แนวทาง) | ใช้ใน |
|---|---|---|
| `src/lib/int/adder.ts` | `addBits(width: 4 \| 8, a, b, carryIn = 0)` → `{ columns: { i, a, b, cin, sum, cout }[], result, carryOut, signedOverflow, unsignedOverflow }` · `subBits(width, a, b)` → `{ inverted, plusOne, add: addBits(...) , ... }` · `shiftRight(width, v, s)` → `{ value, lost: bit[] }` · `toSigned`, `toBits` | บทที่ 1, quiz |
| `src/lib/sci/decimal.ts` | `normalizeDecimal(digits: string, exp: number)` → hops ทีละหลัก · `decimalAdd(a, b, p = 4)` → steps `align` (หลักที่หลุด), `add`, `normalize`, `round` (half-even) ตามตัวอย่าง P&H (ตัดหลักที่เกิน p ตอน align) · ใช้ BigInt กับหลักทศนิยม ห้ามใช้ `Number` | ฉาก 2.2, 5.1 |
| `src/lib/fp/format-c.ts` | `printfFixed(fmt, bits, decimals)` = ผลของ `printf("%.Nf")` จากค่าที่เก็บจริงแบบ exact (Rational) ปัด half-even · `%f` = 6 ตำแหน่ง · ห้ามใช้ `toFixed` | ฉาก 2.1 และบทที่ 7 |

### 5.3 Frame adapters (`src/lib/lesson/`)
ทำหน้าที่แปลงผลของ engine/โมเดลเป็น "เฟรม" ที่ scene วาดได้ทันที (UI ห้ามคำนวณเอง · stage1 4.4)
| ไฟล์ | ทำอะไร |
|---|---|
| `fp-frames.ts` | `buildFpFrames(sim)` → เฟรมของฉาก 5.2, 5.3, 6.1 และบทที่ 7: `{ id, stage, bigStep: 0–4, rows, exponentTags, grs?, decision?, captionKey, params }` · ขยาย `align` เป็นเฟรมรายการเลื่อนจาก `stages` ของ engine (สูงสุด 4 + เฟรมเร่ง) · เลือกโหมดแสดง (compact/tail) |
| `bit-window.ts` | เลือกคอลัมน์ที่แสดงในโหมด compact/tail ให้ครอบทุกบิต 1 ของทุกแถวในทุกเฟรมของ scene (คอลัมน์ไม่กระโดดระหว่างเฟรม) |
| `round-line.ts` | จาก step `round` + `exact`: ค่าลง, ค่าขึ้น, ulp และตำแหน่ง `pos = (exact − down) / ulp` เป็น Rational (แปลงเป็น Number ได้เฉพาะตอนวาดพิกเซล) |
| `circuit-map.ts` | แต่ละ `stage` ของเฟรม → กล่อง/สายที่สว่าง + ป้ายค่าบนสาย (ค่ามาจากเฟรม) |
| `encode-frames.ts` / `decode-frames.ts` | เฟรมของฉาก 4.1, 4.2 และ 3.1 จาก steps ของ `encodeDecimal` / `decode` |
| `int-frames.ts` | เฟรมของฉาก 1.1–1.3 (รวมการรวบหลักที่เป็น 0 ท้าย ๆ) |
| `window.ts` | ค่าของ `ExponentWindow`: ช่วง `[2ᵉ, 2ᵉ⁺¹)` และตำแหน่งในช่วง = significand / 2²³ |
- ข้อความ caption ไม่อยู่ในไฟล์เหล่านี้ (อยู่ใน `src/content/lesson/captions/`) · adapter ส่งแค่ `captionKey` + ค่าที่ต้องเติม

### 5.4 Golden และ test
- golden ใหม่ทั้งหมดในภาคผนวก D (ตรวจแล้วด้วย Python 3 ทาง: algorithm อ้างอิง / numpy float32 / Fraction) + ของเดิม stage1 ภาคผนวก C (ยกเว้น C.4 คูณ/หาร)
- test ใหม่: `tests/unit/int/adder.test.ts` (exhaustive ทุกคู่ 4 และ 8 บิตเทียบเลขคณิต mod 2ⁿ และกติกา overflow ของสไลด์ + golden D.2) · `tests/unit/sci/decimal.test.ts` (golden D.3 + property: ผลของ `decimalAdd` เท่ากับค่าที่คำนวณด้วย BigInt แล้วตัด/ปัดตามกติกา) · `tests/unit/fp/format-c.test.ts` (D.4) · `tests/unit/lesson/*.test.ts` (invariant: เฟรมสุดท้ายมีบิตเท่าผลของ engine, ทุกบิต 1 อยู่ในหน้าต่างที่แสดง, `0 ≤ pos ≤ 1` และตรง D.5, ทุกเฟรมของ add/sub มีกล่องสว่าง ≥ 1 กล่องใน `circuit-map`)
- coverage ≥ 95% ที่ `src/lib/**`

---

## 6. ลบ ย้าย และเก็บกวาด

### 6.1 ยกเลิกแผนระยะที่ 2 เดิม
- `git rm`: `docs/plans/wp1-mips-sim.md`, `docs/plans/wp2-multiply.md`, `docs/plans/wp3-divide.md`, `docs/plans/golden/` ทั้งโฟลเดอร์ (mips, multiply-traces, divide-traces)
- `EMIPS.pdf` (MIPS Reference Data มีลิขสิทธิ์ ใช้เฉพาะ MIPS Sim ที่ยกเลิกแล้ว): `git rm --cached EMIPS.pdf` แล้วเพิ่มใน `.gitignore` (ไฟล์ในเครื่อง Pisit ยังอยู่)
- requirement ใน `floating_website_requirement/` เป็นประวัติ ไม่ใช้เป็น source of truth แล้ว (ห้ามแก้ 2 ไฟล์เดิมของเพื่อน)

### 6.2 โค้ดที่ลบ (หลังหน้าใหม่ใช้งานได้แล้ว ใน Phase 2)
- หน้า `src/app/learn/**`, `src/app/lab/**`
- `src/content/chapters.ts` (→ `lesson/sections.ts`), `src/content/glossary.ts` (→ `lesson/vocab.ts`), `src/content/examples.ts` (→ `lesson/examples.ts`), `src/content/step-text.ts` (→ `lesson/captions/`)
- `src/components/layout/chapter-layout.tsx`, `chapter-icon.tsx`, `nav-links.tsx`
- `src/components/tools/*` และ `src/components/viz/*` ที่ไม่ถูกใช้แล้ว (ย้ายชิ้นที่ยังใช้ เช่น `BinaryPoint`, `operand-input`, `tool-boundary` ไปที่ใหม่ก่อน) · ตรวจด้วย grep ว่าไม่มี import ค้าง
- e2e `ch1-2.spec.ts`, `ch3.spec.ts`, `ch4.spec.ts`, `ch5.spec.ts`, `lab.spec.ts` (แทนด้วยชุดใหม่ หัวข้อ 11) · `site.spec.ts` ปรับหรือรวมเข้า `lesson.spec.ts`
- `not-found.tsx` และ `error.tsx`: ลิงก์กลับ `/` และใช้ชื่อใหม่ (ไม่มีลิงก์ไป `/learn` หรือ `/lab`)

### 6.3 เอกสาร
- `git mv` เอกสารรอบแรกไป `docs/history/stage1/`: `PROGRESS.md`, `QUESTIONS.md`, `REVIEW.md`, `FINAL_REPORT.md`
- สร้างใหม่: `docs/PROGRESS.md` (checklist ตาม Phase ในหัวข้อ 10), `docs/QUESTIONS.md` (คำถามหัวข้อ 13 รูปแบบเดิม: `### Q<n> [ด่วน | ยืนยันค่าเริ่มต้น | ไม่ด่วน] หัวข้อ` + คำถาม + ค่าที่สมมติ + ถ้าคำตอบต่างต้องแก้อะไร + สถานะ), `docs/REVIEW.md`
- comment ในโค้ดที่อ้าง `PLAN.md x.y` (grep ใน `src/`, `tests/`, `scripts/`) เปลี่ยนเป็น `docs/plans/stage1-floating-point.md x.y` หรือหัวข้อในแผนนี้ให้ถูก
- `README.md` เขียนใหม่ (หัวข้อ 7) · `docs/DEPLOY.md` เพิ่มเรื่อง preview ของ branch และ redirect ที่ต้องตรวจหลัง merge

### 6.4 `.gitignore` และ Tailwind
- เพิ่ม `Slide/` และ `EMIPS.pdf` ใน `.gitignore`
- `globals.css`: คง `@source not` เดิม และเพิ่ม `@source not '../../Slide'`

---

## 7. เปลี่ยนชื่อเป็น comkrub
- `src/lib/site.ts` ตามภาคผนวก C.1 (`name`, `tagline`, `description`, `ogSubtitle`, `githubUrl: null`, `references`) · **เครดิตผู้จัดทำ 4 คนและอาจารย์ห้ามแก้**
- `package.json` `"name": "comkrub"` แล้ว `npm install --package-lock-only`
- ธีม daisyUI `binarylab` → `comkrub` (`globals.css` + `data-theme` ใน `layout.tsx`)
- โลโก้: เก็บ `LogoMark` 3 แถบสีเดิม (Sign/Exponent/Significand ยังตรงกับเรื่องที่สอน) เปลี่ยนแค่ wordmark เป็น comkrub · `aria-label` ใช้ `site.name` · `icon.tsx` ใช้ของเดิม
- `opengraph-image.tsx`: "comkrub" + register 32 บิตของ `[6.5]` 3 สี + `site.ogSubtitle` (ฟอนต์ไทยเดิม)
- README: comkrub คืออะไร, โครงเรื่อง 7 บท, วิธีรัน, คำสั่ง (เพิ่ม `text:report`), โครงสร้างโฟลเดอร์, แหล่งอ้างอิง, ผู้จัดทำ (เหมือนเดิม)
- DoD: grep `Binary Lab|binarylab|binary-lab` ต้องไม่เจอใน `src/`, `tests/`, `scripts/`, `README.md`, `package.json` (ยกเว้น `docs/history/` และ `docs/plans/stage1-floating-point.md`)

---

## 8. โครงสร้างไฟล์หลังปรับ (เฉพาะส่วนที่เกี่ยวกับงานนี้)
```
src/
  app/
    page.tsx                 หน้าเดียว (server) วาง section จาก registry
    layout.tsx               theme comkrub, metadata
    dev/kit/page.tsx         ดู component ทีละชิ้น (dev เท่านั้น)
    sitemap.ts robots.ts opengraph-image.tsx icon.tsx not-found.tsx error.tsx
  content/lesson/
    sections.ts              ลำดับบท id ชื่อ hook คำศัพท์ อ้างอิง
    vocab.ts                 คำศัพท์ทั้งหมด (C.4)
    copy.ts                  hero, takeaway, bridge, summary, footer (C.2, C.7–C.11)
    captions/                caption + "ทำไม?" ของแต่ละ scene (C.5–C.6) เป็นฟังก์ชันรับ params
    quiz.ts                  คำถามเช็ก (C.8) ตัวเลือกที่เป็นบิต/hex คำนวณจากโมเดล
    examples.ts              chip ตัวอย่าง (ภาคผนวก D)
    circuit.ts               ตำแหน่งกล่องและสายของวงจร
    config.ts                AUTOPLAY_ON_VIEW = false ฯลฯ
  lib/
    fp/                      engine (ลบ mul/div) + format-c.ts
    int/adder.ts
    sci/decimal.ts
    lesson/                  frame adapters (5.3)
  components/
    lesson/                  LessonSection VocabStrip SceneShell Takeaway QuickCheck SourceNote NextUp ProgressNav JourneyMap ExampleChips WhyChip
    stage/                   ชิ้นส่วนภาพ (4.5)
    hw/                      วงจร (4.6)
    scenes/                  hero-teaser int-add int-sub overflow-wheel shift c-code point layout bit-play special encode decode decimal-add fp-op round slide-fun-fact circuit playground
    player/                  StepPlayer (ปรับ) usePlayer speed
    bits/ glass/ layout/ ui/ content/   ของเดิมที่ยังใช้
tests/
  unit/fp/ unit/int/ unit/sci/ unit/lesson/ unit/content/
  e2e/lesson.spec.ts e2e/scenes.spec.ts e2e/redirects.spec.ts e2e/player.spec.ts e2e/a11y.spec.ts
```

---

## 9. กติกาการทำงาน
- กติกาถาวรอยู่ใน `CLAUDE.md` (ภาคผนวก B) · เรื่องที่ไม่ได้เขียนใหม่ในแผนนี้ใช้ตาม stage1 (2.x กติกา, 8 StepPlayer, 9 ธีม, 10 testing)
- **Git**: ทำงานบน branch `addsub-redesign` · commit แบบ Conventional Commits ภาษาอังกฤษ ทุกงานย่อยที่ผ่าน quality gate · push branch ทุกครั้งที่จบ phase (Vercel สร้าง preview ให้เองจาก commit ของ Pisit: ไม่ถือว่า deploy เอง) · **ห้าม commit/push เข้า `main` ห้าม merge** · ห้าม `push --force`, `reset --hard`, rebase branch ที่ push แล้ว · ก่อน push: `git fetch` ถ้า `main` มี commit ใหม่ให้ `git merge origin/main`
- **Quality gates**: ก่อน commit `npm run lint` · `npm run typecheck` · `npm test` ผ่าน · งานที่แตะ UI: e2e ที่เกี่ยวข้อง (ระหว่างทำใช้ project `pixel7`) + screenshot 390 × 844 และ 1440 × 900 แล้ว**เปิดดูรูปจริงด้วย Read** · จบ phase: `npm run build` ผ่านและทุก route static
- **Context7**: query ก่อนใช้ library ทุกครั้ง (ID ในภาคผนวก B) · **ห้ามเพิ่ม dependency** (ของที่มีพอแล้ว: motion, lucide-react, daisyUI, Tailwind) ถ้าคิดว่าจำเป็นจริงให้จดคำถามก่อน
- **autonomous**: ห้ามใช้ AskUserQuestion และห้ามหยุดถาม · จดคำถามใน `docs/QUESTIONS.md` พร้อมค่าที่สมมติ แล้วทำต่อ
- อัปเดต `docs/PROGRESS.md` ทุกครั้งที่จบงานย่อย เพื่อให้ session ใหม่ทำต่อได้ทันที
- **screenshot**: ขยาย `scripts/shot.mts` ให้รับ `--el <css selector>` (ถ่ายเฉพาะ element) และ `--steps <n>` (โฟกัส player ใน element แล้วกดลูกศรขวา n ครั้ง) เพื่อถ่ายเฟรมสำคัญของแต่ละ scene · เก็บที่ `test-results/shots/` (gitignore)
- ประหยัด token: Vitest dot, Playwright line, log ดูแค่ `tail`/`grep`, แผนนี้อ่านเฉพาะหัวข้อที่ใช้ (`grep -n "^## \|^### " PLAN.md`) · เครื่อง Pisit RAM 8 GB เปิด dev server ตัวเดียว
- ข้อห้ามเดิม: ห้ามแตะ `/Users/pisit/Documents/Development/CoE-Shop` · ห้าม emoji · ห้ามรัน `vercel` CLI หรือแก้ settings บน Vercel · ห้าม `curl | bash`

---

## 10. Phases และ Definition of Done
ทำตามลำดับ ห้ามข้าม DoD · แต่ละ phase commit แยกตามงานย่อย · จบ phase: build + push branch + อัปเดต PROGRESS

### Phase 0 — เริ่มงานและยกเลิกแผนเดิม
1. `git fetch` → `git switch -c addsub-redesign origin/main` (PLAN.md ฉบับใหม่ที่ยังไม่ commit ติดมาด้วย) → commit แรก `docs: plan for comkrub add/sub single-page redesign` (PLAN.md อย่างเดียว)
2. แทน `CLAUDE.md` ทั้งไฟล์ด้วยภาคผนวก B
3. หัวข้อ 6.1, 6.3, 6.4 (ยกเลิกแผนเดิม, ย้ายเอกสาร, สร้าง PROGRESS/QUESTIONS/REVIEW ใหม่, แก้ comment ที่อ้าง PLAN.md, `.gitignore`, `@source not`) → `chore: cancel stage 2 plan, new rules and progress files`
- DoD: lint/typecheck/test/build ผ่าน · `git status` สะอาด · `Slide/` ไม่ถูก track

### Phase 1 — โมเดลและ frame adapters (ยังไม่มี UI)
1. `int/adder.ts` + test → `feat(int): ripple adder, subtract and shift model`
2. `sci/decimal.ts` + test → `feat(sci): decimal normalize and 4-digit add model`
3. `fp/format-c.ts` + test → `feat(fp): exact printf formatting`
4. `lesson/*` adapters + test (รวม golden D.1, D.5) → `feat(lesson): frame adapters for scenes`
- DoD: test ผ่าน · coverage ≥ 95% ที่ไฟล์ใหม่ · ไม่มีการเปลี่ยน algorithm ใน engine

### Phase 2 — โครงหน้าเดียว ชุด component เปลี่ยนชื่อ และลบของเก่า
1. เปลี่ยนชื่อ (หัวข้อ 7) → `feat: rename site to comkrub`
2. registry + content (`sections.ts`, `vocab.ts`, `copy.ts`, โครง `captions/`, `quiz.ts`) จากภาคผนวก C + test งบข้อความ (1.3) → `feat(content): lesson registry, vocabulary and copy`
3. `page.tsx` หน้าเดียว + `LessonSection`, `VocabStrip`, `Takeaway`, `QuickCheck`, `SourceNote`, `NextUp`, `JourneyMap`, `ProgressNav`, header/drawer/footer ใหม่ · scene ที่ยังไม่ทำแสดงกล่องจางว่าง ๆ (ไม่มีข้อความ "กำลังพัฒนา" ยาว ๆ) → `feat(page): single-page lesson skeleton and navigation`
4. StepPlayer แบบ stage-first (4.4) + `SceneShell` + ชิ้นส่วนใน `stage/` และ `hw/` + หน้า `/dev/kit` → `feat(ui): stage-first player and scene building blocks`
5. ลบหน้าและโค้ดเก่า (6.2) + redirect (4.1) + sitemap → `refactor: remove chapter pages and lab, add redirects`
6. ลบคูณ/หารออกจาก engine (5.1) → `refactor(fp): drop multiplication and division`
- DoD: `/` แสดงครบทุกบท (มีโครงแล้ว) · redirect ทุกแถวผ่าน e2e · screenshot 390/1440 ของหน้าเต็มและ `/dev/kit` เปิดดูแล้ว · build static

### Phase 3 — บทที่ 5 (แกนหลักที่อาจารย์ต้องการ)
- ฉาก 5.1 ฐานสิบ 4 หลัก → 5.2 บวก → 5.3 ลบ → 5.4 ปัดเศษ → 5.5 ตัวอย่างในสไลด์ (Should) · คำศัพท์ สรุป คำถามเช็กของบท
- commit ต่อ scene เช่น `feat(fp-add): binary addition scene`
- DoD: e2e ของบทที่ 5 (หัวข้อ 11) ผ่าน · screenshot เฟรม align / normalize / round ของ `6.5 + 3.75`, `0.5 − 0.4375`, `0.1 + 0.2` ที่ 390 / 1440 / 1920 เปิดดูแล้ว · งบข้อความผ่าน · push → **Milestone A: แกนหลักพร้อมให้ดูผ่าน preview** (เขียนลงแชทว่าพร้อมแล้วพร้อม path screenshot แล้วทำต่อ ไม่ต้องรอ)

### Phase 4 — บทที่ 6 วงจร
- `circuit.ts` layout + `FpAdderDiagram` + `circuit-map` + ฉาก 6.1 + คำศัพท์/สรุป/คำถามเช็ก → `feat(circuit): floating-point adder block diagram`
- DoD: ทุกเฟรมของตัวอย่างในภาคผนวก D.1 มีกล่องสว่างและป้ายค่าตรงกับ engine · อ่านออกที่ 390px · screenshot เปิดดูแล้ว

### Phase 5 — บทที่ 3 และ 4
- ฉาก 3.1 (Must), 3.2 และ 3.3 (Should), แถบเทียบ double (Could) · ฉาก 4.1 (Must), 4.2 (Should)
- DoD: e2e ของบทที่ 3–4 ผ่าน · ป้าย "Significand" แทน "Fraction" ทั้งเว็บ · screenshot เปิดดูแล้ว

### Phase 6 — Hero บทที่ 1 และ 2
- HeroTeaser, JourneyMap · ฉาก 1.1, 1.2, 1.4 (Must), 1.3 (Should) · ฉาก 2.1, 2.2 (Must)
- DoD: e2e ของบทที่ 1–2 ผ่าน · hero ไม่ถ่วง LCP · screenshot เปิดดูแล้ว

### Phase 7 — ลองเอง และสรุป
- Playground (หัวข้อ 3.8) + แชร์ลิงก์ + redirect `/lab` ที่มี query · สรุปท้ายหน้า (หัวข้อ 3.9)
- DoD: ลิงก์ที่คัดลอกเปิดแล้วได้ state เดิม · ลิงก์ `/lab?…` เก่าเปิดแล้วได้ตัวอย่างเดียวกัน

### Phase 8 — ขัดเกลา review และส่ง
1. a11y, reduced motion, Lighthouse (4.9), OG image, README, `docs/ENGINE.md`, `docs/DEPLOY.md`
2. Review 4 รอบ (หัวข้อ 11) จดผลใน `docs/REVIEW.md` และแก้จนจบ
3. push → เปิด PR `addsub-redesign` → `main` ด้วย `gh pr create` (ถ้าไม่มี gh ให้บอกลิงก์ compare บน GitHub) ใส่สรุป, ผล test, path screenshot, ตารางงบข้อความต่อบท, คำถามที่รอคำตอบ
4. **หยุดและรายงานในแชท** (Pisit merge เอง)

---

## 11. Testing และ review 4 รอบ

### 11.1 Unit (Vitest + fast-check)
- engine เดิม (บวก/ลบ, encode, decode) ตาม stage1 4.5 · ห้ามลด `numRuns`
- โมเดลและ adapter ใหม่ (5.4)
- content: id ของ section ไม่ซ้ำและเรียงตาม `number` · ทุกบท 1–6 มีคำศัพท์ 3–6 คำและทุก id มีใน `vocab.ts` · ทุก `captionKey` ที่ adapter ส่งออกมี caption · งบข้อความ (1.3) โดย render caption ของทุก chip ตัวอย่าง · ไม่มีภาษาไทยยาวใน component · คำตอบของ `quiz.ts` ตรงกับโมเดล

### 11.2 E2E (Playwright: `pixel7`, `iphone13`, `desktop`)
1. `/` มี section ครบตามลำดับ registry · ทุกบท 1–6 มี `VocabStrip` เป็นสิ่งแรกหลัง hook
2. ProgressNav/drawer กดแล้วเลื่อนไปบทที่ถูก · scrollspy ไฮไลต์ถูกบท · `NextUp` ใช้ได้
3. ทุก scene แบบ StepPlayer: ปุ่มเล่นใหญ่ → เล่นจนขั้นสุดท้าย · ย้อน/ถัดไป/จุดบอกขั้น/คีย์บอร์ดใช้ได้
4. ค่าที่ต้องเห็น (ทุกค่ามาจาก engine/โมเดล):
   - ฉาก 1.1: `7 + 6` (8 บิต) → `00001101` และ 13 · ฉาก 1.2: `7 − 6` → `0001` · ฉาก 1.3: `4 + 5` → `1001` = −7 พร้อมป้าย overflow · ฉาก 1.4: 104 เลื่อน 3 → 13
   - ฉาก 2.1: output `13 10.250000` · chip → `0.300000012`
   - ฉาก 3.1: 6.5 → Exponent 129, `0x40D00000`, ค่า 6.5
   - ฉาก 4.1: 6.5 → `0x40D00000` · −0.75 → `0xBF400000` · 0.1 → ขึ้น warning ค่าที่เก็บไม่ตรง · ฉาก 4.2: `0xC0A00000` → −5
   - ฉาก 5.1: ได้ `1.002 × 10²` · ฉาก 5.2: `6.5 + 3.75` → `0x41240000`, normalize ขวา 1 · ฉาก 5.3: `0.5 − 0.4375` → `0x3D800000`, normalize ซ้าย 3 · `3.75 − 6.5` → `0xC0300000` · ฉาก 5.4: `0.1 + 0.2` → `0x3E99999A`, G=1 R=1 S=0 ปัดขึ้น · `16777216 + 1` → `0x4B800000` (เสมอ → คู่) · ฉาก 5.5: 16 / 20 / 16
   - ฉาก 6.1: กดถัดไปจนจบ กล่องที่สว่างเรียงเป็น Small ALU → MUX + Shift right → Big ALU → Normalize → Round → ผลลัพธ์
   - บทที่ 7: ใส่ค่า → ผลตรง engine · คัดลอกลิงก์แล้วเปิดใหม่ได้ state เดิม
5. redirect ทุกแถวใน 4.1 (ตรวจ URL ปลายทาง, hash และ query ของ `/lab`)
6. reduced motion (`reducedMotion: 'reduce'`): ไม่มีอะไรเล่นเอง เปลี่ยนขั้นได้ครบ
7. ไม่มี console error · axe ไม่มี serious/critical ทั้งหน้า · ไม่มี horizontal scroll ที่ 360 และ 390 (`scrollWidth ≤ innerWidth`)
8. เลื่อนถึง section แล้ว scene โหลดขึ้นมา (ไม่ค้างเป็นกล่องว่าง)

### 11.3 Visual review
- ถ่ายทุกบทที่ 390 × 844, 1440 × 900 และบทที่ 5–6 ที่ 1920 × 1080 (โหมดนำเสนอด้วย) · ถ่ายเฟรมแรกและเฟรมสำคัญด้วย `--steps` · WebKit อย่างน้อยหน้าแรกและบทที่ 5 · เปิดดูทุกรูป จดปัญหาใน `docs/REVIEW.md`

### 11.4 Review 4 รอบก่อนบอกว่าเสร็จ (จดผลใน `docs/REVIEW.md`)
1. **ใช้งานจริง**: เป็นนักศึกษาที่เพิ่งเรียน Digital มา เรียนจากบนลงล่างบนมือถือ WebKit 390px (ลองค่าแปลก ค่าว่าง ค่าเกินช่วง) และเป็นคนนำเสนอบน 1920 ใช้คีย์บอร์ดล้วน + โหมดนำเสนอ → จดจุดที่งงหรือต้องกดเยอะแล้วแก้
2. **ความสวยและ interface**: ธีม Liquid Glass (stage1 9), ระยะห่าง, ตัวอักษรไทยไม่โดนตัด, animation ลื่นและไม่รก (ลอง reduced motion), สีตาม 1.2
3. **ความถูกต้อง**: test ทั้งหมด + อ่านเนื้อหาทุกบทเทียบสไลด์ (ภาคผนวก E) และ P&H · grep หาเลขที่พิมพ์เอง (`0x`, สตริงบิตยาว ๆ) ใน `src/content`, `src/components`, `src/app` · build ผ่าน
4. **สายตาอาจารย์** (checklist จากคำติชม):
   - [ ] ตาราง `text:report` ทุกบทอยู่ในงบ และไม่มีย่อหน้าเกิน 2 บรรทัดบนมือถือ
   - [ ] ทุกบทเริ่มด้วยคำศัพท์
   - [ ] ทุกบทมี animation ที่กดเล่นได้อย่างน้อย 1 อัน · ลองปิด caption แล้วดูแค่ภาพ ยังพอบอกได้ว่าเกิดอะไรขึ้น (จดผลต่อ scene)
   - [ ] ไม่มีเรื่องการคูณ/หาร floating-point เหลือในเว็บ
   - [ ] เส้นเรื่องต่อเนื่อง Digital → ทศนิยมใน C → IEEE 754 → แปลง → บวก/ลบ → วงจร
   - [ ] ตัวอย่าง 6.5 + 3.75 โผล่ในบทที่ 2, 3, 4, 5, 6 ด้วยค่าเดียวกัน
   - [ ] เปิดแต่ละบทแล้วรู้ภายใน 3 วินาทีว่าต้องกดอะไร (ดูจาก screenshot)

### 11.5 รายงานท้ายงาน (ในแชทและใน PR)
- สิ่งที่เสร็จ/ยังไม่ทำ (แยก Must/Should/Could) · ผล test · path screenshot · ตารางงบข้อความต่อบท · คำถามที่รอคำตอบเรียงตามความสำคัญ · ลิงก์ PR · ลิงก์ preview ของ Vercel (ถ้าเห็นใน PR)

---

## 12. งานของ Pisit และทีม (นอก Claude Code)
1. เปิด Claude Code ในโฟลเดอร์โปรเจกต์ เลือก model ที่ดีที่สุดที่บัญชีมี (effort high) และโหมด Auto → วาง prompt ภาคผนวก A.1 · ถ้าชน usage limit หรือเปิด session ใหม่ ใช้ A.2
2. ระหว่างทาง: ว่างเมื่อไรเปิด `docs/QUESTIONS.md` ตอบคำถาม แล้วพิมพ์คำตอบให้ Claude Code แก้ตาม
3. Milestone A (จบ Phase 3): เปิด preview ของ Vercel บนมือถือ ดูบทที่ 5 · ถ้าอยากให้อาจารย์ดูก่อนก็ส่งลิงก์ preview ได้
4. ก่อน merge: ให้เพื่อนที่ไม่ได้ทำเว็บ 1–2 คนลองเรียนบนมือถือโดยไม่มีใครอธิบาย จับเวลาและจดจุดที่งง ส่งให้ Claude Code แก้
5. merge PR บน GitHub แบบ "Create a merge commit" → รอ Vercel deploy production → เปิด https://comkrub.mypisit.com บนมือถือ ตรวจทุกบท และลอง URL เก่า (`/learn/add-sub`, `/lab?...`) ว่าพาไปถูกที่
6. ซ้อมนำเสนอด้วยโหมดนำเสนอบนจอใหญ่

---

## 13. คำถามตั้งต้น (Phase 0 ใส่ใน `docs/QUESTIONS.md` แล้วทำงานต่อด้วยค่าที่สมมติ)
| # | ระดับ | คำถาม | ค่าที่ใช้ไปก่อน |
|---|---|---|---|
| Q1 | ยืนยันค่าเริ่มต้น | ใช้ศัพท์ตามสไลด์: ช่อง 23 บิตเรียก Significand (P&H เรียก fraction) | ใช้ตามสไลด์ (2.4) |
| Q2 | ยืนยันค่าเริ่มต้น | อ้างอิงสไลด์บนเว็บใช้ชื่อเอกสารและผู้แต่งตามหน้าปกสไลด์ (Tatpong Katanyukul, CoE KKU) · เครดิตอาจารย์ผู้สอนใน footer คงเดิม | ใช้ตามนั้น (C.1, C.10) |
| Q3 | ยืนยันค่าเริ่มต้น | ตัวอย่างหลัก: บวก 6.5 + 3.75 · ลบ 0.5 − 0.4375 · ปัด 0.1 + 0.2 | ใช้ตามนั้น |
| Q4 | ยืนยันค่าเริ่มต้น | animation ไม่เล่นเองตอนเลื่อนถึง ต้องกดเล่น (ยกเว้น hero) | ไม่เล่นเอง (`config.ts`) |
| Q5 | ไม่ด่วน | double แสดงแค่แถบเทียบในบทที่ 3 และตัวอย่างในสไลด์ (ฉาก 5.5) ไม่มีในลองเอง | ใช้ตามนั้น |
| Q6 | ยืนยันค่าเริ่มต้น | ลบ engine คูณ/หารทิ้ง (ไม่ใช่แค่ซ่อน) | ลบ |
| Q7 | ด่วน | วันนำเสนอ/ส่งงานคือวันไหน (ใช้จัดลำดับ Should/Could) | ทำตาม phase แกนหลักบทที่ 5 ก่อน |
| Q8 | ไม่ด่วน | repo private → ลิงก์ GitHub ใน footer จะ 404 | ซ่อน (`githubUrl: null`) |
| Q9 | ยืนยันค่าเริ่มต้น | URL เก่า redirect ไปหัวข้อที่ใกล้ที่สุด · `/learn/mul-div` ไป `/` | ใช้ตาม 4.1 |
| Q10 | ไม่ด่วน | ป้ายชื่อคำสั่ง MIPS `add.s` ในบทที่ 2 (Could) | ทำถ้ามีเวลา |

---

## ภาคผนวก A: prompt สำหรับ Claude Code

### A.1 เริ่มงาน
```
เริ่มงานรอบใหม่ของเว็บ: ปรับเป็น comkrub สื่อการสอนเรื่องเดียว "บวก ลบ เลข Floating-Point" แบบหน้าเดียวเลื่อนลงทีละบท ตาม PLAN.md ฉบับใหม่ (แผนนี้แทนแผนระยะที่ 2 เดิมทั้งหมด: hub, MIPS Simulator, การคูณ และการหาร ยกเลิกแล้ว)

1. อ่าน PLAN.md ให้ครบทุกหัวข้อก่อนเริ่ม (โดยเฉพาะ 0-4, 10, 11 และภาคผนวก B-E) · CLAUDE.md ที่โหลดมาตอนนี้ยังเป็นของรอบแรก (Binary Lab) เลขหัวข้อ "PLAN.md x.y" ในนั้นหมายถึง docs/plans/stage1-floating-point.md · งานแรกของ Phase 0 คือแทน CLAUDE.md ด้วยภาคผนวก B
2. สไลด์อาจารย์อยู่ใน Slide/ เป็นแหล่งเนื้อหาหลัก (สรุปหน้าที่เกี่ยวข้องอยู่ในภาคผนวก E) เปิด PDF ดูได้เมื่อต้องการตรวจรายละเอียด แต่ห้าม commit โฟลเดอร์ Slide/ และห้ามเอารูปจากสไลด์ไปใส่เว็บ
3. ตอนนี้ PLAN.md ฉบับใหม่ยังไม่ได้ commit: git fetch แล้วสร้าง branch addsub-redesign จาก origin/main แล้ว commit PLAN.md เป็นงานแรก จากนั้นทำ Phase 0 ถึง 8 ทีละ phase ห้ามข้าม DoD · commit ทุกงานย่อยที่ผ่าน lint + typecheck + test · อัปเดต docs/PROGRESS.md ทุกครั้งที่จบงานย่อย · push branch ทุกครั้งที่จบ phase
4. autonomous: ห้ามใช้ AskUserQuestion และห้ามหยุดถาม ถ้าต้องตัดสินใจให้จดใน docs/QUESTIONS.md พร้อมค่าที่สมมติ แล้วทำต่อ
5. ก่อนใช้ library ใดให้ query Context7 ก่อนทุกครั้ง และห้ามเพิ่ม dependency ถ้าไม่จำเป็น
6. หัวใจของงานคือคำติชมของอาจารย์: ข้อความน้อย ภาพเคลื่อนไหวเยอะ กดเล่นได้จริง เรื่องเดียวคือบวก/ลบ · ทุกงาน UI ต้องเปิดดู screenshot มือถือ 390px และ desktop 1440px เอง และงบข้อความ (PLAN.md 1.3) ต้องผ่าน
7. ห้าม push หรือ merge เข้า main และห้าม deploy เอง: จบ Phase 8 แล้วทำ review 4 รอบตาม PLAN.md 11.4 เปิด PR เข้า main ด้วย gh แล้วรายงานสรุปในแชทตาม PLAN.md 11.5

เริ่มได้เลย
```

### A.2 ทำต่อ (session ใหม่หรือหลังชน usage limit)
```
ทำต่อ: อ่าน CLAUDE.md และ docs/PROGRESS.md ดูว่าอยู่ phase ไหนและงานถัดไปคืออะไร เปิดอ่านหัวข้อที่เกี่ยวข้องใน PLAN.md ก่อนลงมือ (grep -n "^## \|^### " PLAN.md) แล้วทำต่อตามกติกาเดิมจนจบ Phase 8
```

### A.3 แก้ตามคำตอบ (หลัง Pisit ตอบคำถาม)
```
ฉันตอบคำถามใน docs/QUESTIONS.md แล้ว (ดูข้อที่สถานะเปลี่ยนเป็น "ตอบแล้ว") แก้งานตามคำตอบทุกข้อ แล้วรัน test + ถ่าย screenshot ส่วนที่แก้ เปิดดูเอง และสรุปสั้น ๆ ว่าแก้อะไร
```

---

## ภาคผนวก B: `CLAUDE.md` ฉบับใหม่ (Phase 0 ขั้นที่ 2 แทนทั้งไฟล์)

```md
# comkrub: กติกาถาวรสำหรับ Claude Code
@AGENTS.md

- เว็บสื่อการสอนวิชา Computer Architecture เรื่องเดียว: การบวกและการลบเลข Floating-Point (IEEE 754 single precision) เป็นหน้าเดียว `/` เลื่อนลงทีละบท (บทที่ 1-7 + สรุป) · ไม่มีเรื่องคูณ/หาร ไม่มี hub/MIPS Simulator (ยกเลิกแล้ว)
- แผน: PLAN.md (อ่านเฉพาะหัวข้อที่เกี่ยวกับงานก่อนเริ่มทุกครั้ง) · ความคืบหน้า docs/PROGRESS.md · คำถาม docs/QUESTIONS.md · review docs/REVIEW.md · แผนรอบแรก (engine, StepPlayer, ธีม, testing): docs/plans/stage1-floating-point.md · version: docs/STACK.md
- แหล่งเนื้อหา: สไลด์อาจารย์ใน Slide/ ก่อน (สรุปใน PLAN.md ภาคผนวก E) → Patterson & Hennessy 5e หัวข้อ 3.2, 3.5 → IEEE 754-2019 · ศัพท์ตามสไลด์ (PLAN.md 2.4) · ห้าม commit Slide/ และ EMIPS.pdf · ห้ามคัดลอกรูปหรือข้อความจากสไลด์/ตำรา วาดและเขียนเอง
- ทำงานแบบ autonomous: ห้ามใช้ AskUserQuestion ห้ามหยุดถาม → จดคำถาม + ค่าที่สมมติใน docs/QUESTIONS.md แล้วทำต่อ
- ก่อนใช้ library ให้ query Context7 ก่อนเสมอ (Next.js 16: /vercel/next.js + node_modules/next/dist/docs · daisyUI 5: /websites/daisyui · Tailwind v4: /tailwindlabs/tailwindcss.com · motion: /websites/motion_dev · Vitest/fast-check/Playwright: resolve ตอนใช้) · ห้ามเพิ่ม dependency ถ้าไม่จำเป็น (จดคำถามก่อน) · version: latest stable ยกเว้น typescript ~6.0.x, eslint ^9, @types/node ^24
- "เห็นก่อนอ่าน" (PLAN.md 1): ทุกบทเริ่มด้วยคำศัพท์ แล้วเป็น animation ที่กดเล่นได้ · ข้อความที่ผู้ใช้เห็นอยู่ใน src/content/lesson/ เท่านั้นและต้องอยู่ในงบ (PLAN.md 1.3) · ทุกกระบวนการหลายขั้นใช้ StepPlayer (ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด/reduced motion/โหมดนำเสนอ)
- engine อยู่ที่ src/lib/fp: BigInt ล้วน ห้ามคำนวณผลด้วย Number · ผลตรง IEEE 754 round to nearest ties to even ทุกบิต · test: golden (PLAN.md ภาคผนวก D + stage1 ภาคผนวก C) + oracle Math.fround + exhaustive MINI8 · ห้ามลด numRuns
- ตัวเลขผลลัพธ์ บิต hex ค่าที่เก็บจริง และผล printf ในเนื้อหาต้อง render จาก engine/โมเดล ห้ามพิมพ์เอง (input ของตัวอย่างเขียนได้) · UI ห้ามคำนวณเอง ใช้ frame adapters ใน src/lib/lesson/
- ธีม Liquid Glass ฟ้า-ขาว (stage1 9) · daisyUI ตั้ง exclude: glass, rootcolor · สีตาม PLAN.md 1.2 · สว่างอย่างเดียว · mobile-first (390px ก่อน)
- ห้ามแก้/สร้าง/ลบไฟล์ใน /Users/pisit/Documents/Development/CoE-Shop · ห้ามแก้ requirement 2 ไฟล์เดิมของเพื่อน
- ชื่อเว็บ comkrub · ข้อมูลเว็บ เครดิตผู้จัดทำ 4 คนและอาจารย์อยู่ใน src/lib/site.ts (ห้ามแก้ชื่อ พิมพ์ตามนั้นทุกตัวอักษร)
- ห้าม emoji ทุกที่ ใช้ lucide-react · ภาษาไทยเป็นธรรมชาติ สั้น ตรง ใช้ศัพท์ตาม src/content/lesson/vocab.ts · ห้ามสำนวนแบบ AI
- git: ทำบน branch addsub-redesign · ห้าม commit/push เข้า main ห้าม merge ห้าม deploy เอง (push branch ได้ Vercel สร้าง preview เอง) · ห้าม push --force, reset --hard, rebase branch ที่ push แล้ว · ก่อน push: git fetch ถ้า main มี commit ใหม่ให้ git merge origin/main
- ก่อน commit: lint + typecheck + test ผ่าน · งาน UI ต้องเปิดดู screenshot 390px และ 1440px เอง · จบ phase: build ผ่านและทุก route static · จบงาน: review 4 รอบ (PLAN.md 11.4)
- ประหยัด token: Vitest dot, Playwright line, log ดูแค่ tail/grep, PLAN.md อ่านเฉพาะหัวข้อที่ใช้ (grep -n "^## \|^### " PLAN.md)
```

---

## ภาคผนวก C: ข้อความทั้งหน้า (copy)
- เป็นข้อความตั้งต้นที่ตรวจงบแล้วโดยประมาณ (hook + คำศัพท์ + สรุป + คำถามเช็ก ราว 470–510 ตัวอักษรต่อบท) ปรับคำได้ถ้าจำเป็นแต่ต้องอยู่ในงบ (1.3) และความหมายเดิม · `{…}` คือค่าที่เติมจาก engine/โมเดล · ห้ามแทน `{…}` ด้วยตัวเลขที่พิมพ์เอง
- ค่าทศนิยมใน caption ใช้รูปสั้น (`shortestDecimal`) · ค่าที่เก็บจริงแบบครบทุกหลักแสดงในการ์ดผลหรือ `RoundLine` เท่านั้น ไม่ยัดลง caption

### C.1 `src/lib/site.ts` (เปลี่ยนเฉพาะค่าเหล่านี้)
```ts
name: 'comkrub',
tagline: 'บวก ลบ เลขทศนิยมในคอมพิวเตอร์ แบบเห็นทุกบิต',
description:
  'สื่อการสอนวิชา Computer Architecture เรื่องการบวกและลบเลข Floating-Point (IEEE 754) เริ่มจากบวกเลขฐานสองไปจนถึงวงจรบวกเลขทศนิยม ดูเป็นภาพเคลื่อนไหวทีละขั้นและลองใส่ตัวเลขเองได้',
ogSubtitle: 'บวก ลบ Floating-Point · IEEE 754',
githubUrl: null, // Q8: repo ยังเป็น private
references: [
  'สไลด์ Computer Architecture: Arithmetic for Computers (w03c, w03c_mult), Tatpong Katanyukul, CoE KKU',
  'D. A. Patterson and J. L. Hennessy, Computer Organization and Design, 5th ed., หัวข้อ 3.2 และ 3.5',
  'IEEE Std 754-2019, IEEE Standard for Floating-Point Arithmetic',
],
// course, siteUrl, authors, instructor: ไม่เปลี่ยน
```

### C.2 Hero
- pill: "Computer Architecture · บวก ลบ Floating-Point"
- H1: "comkrub" · tagline: `site.tagline`
- ข้อความแนะนำ: "ต่อจากวิชา Digital: จากบวกเลขฐานสองไปจนถึงวงจรบวกเลข floating-point กดเล่นทีละขั้น และลองใส่เลขเองได้"
- ป้าย: "ควรรู้มาก่อน: เลขฐานสอง, two's complement, full adder"
- ปุ่ม: "เริ่มเรียน" · "ข้ามไปลองเอง"
- teaser: "ข้างในเกิดอะไรขึ้น เลื่อนลงไปดู"
- JourneyMap (ชื่อสั้นของบท): "บวกลบฐานสอง" · "ทศนิยมใน C" · "IEEE 754" · "แปลงเลข" · "บวก/ลบ float" · "วงจร" · "ลองเอง"

### C.3 ชื่อบทและ hook
| id | ชื่อบท | hook |
|---|---|---|
| `binary` | บวกและลบเลขฐานสอง | ทบทวนจาก Digital: adder บวกทีละหลัก และใช้วงจรเดียวกันทำการลบ |
| `float-in-c` | เลขทศนิยมในโปรแกรม | ภาษา C มี float กับ double สำหรับเลขทศนิยม ข้างในเก็บแบบ scientific notation ฐานสอง |
| `ieee754` | มาตรฐาน IEEE 754 | ทุกเครื่องเก็บ float แบบเดียวกัน: 32 บิต แบ่งเป็น 3 ส่วน |
| `convert` | แปลงเลขทศนิยมเป็น IEEE 754 | แปลงเป็นฐานสอง เลื่อนจุดให้เป็น 1.xxx แล้วใส่ลงช่องทั้ง 3 ส่วน |
| `fp-add` | บวกและลบเลข Floating-Point | ทำ 4 ขั้น: ทำ exponent ให้เท่ากัน, บวก significand, normalize, ปัดเศษ |
| `circuit` | วงจรบวก/ลบ Floating-Point | 4 ขั้นเดิมกลายเป็นกล่องวงจรที่ต่อจาก ALU, MUX และ shifter ที่รู้จักแล้ว |
| `playground` | ลองเอง | ใส่ตัวเลขสองตัว เลือกบวกหรือลบ แล้วดูทั้งแบบบิตและแบบวงจร |
| `summary` | สรุป | - |
- หัวเรื่องย่อยในบทที่ 5: "5.1 บวกแบบฐานสิบ 4 หลัก" · "5.2 บวก" · "5.3 ลบ" · "5.4 ปัดเศษ" · "5.5 ลองตัวอย่างในสไลด์"

### C.4 คำศัพท์ (`vocab.ts`)
| บท | คำ | ความหมาย |
|---|---|---|
| 1 | Carry (ตัวทด) | 1 ที่ทดไปหลักถัดไป เมื่อผลรวมในหลักนั้นเกิน 1 |
| 1 | Full adder | วงจรบวก 1 หลัก รับ a, b, carry in ให้ sum กับ carry out |
| 1 | Two's complement | วิธีเก็บเลขติดลบ: กลับทุกบิตแล้วบวก 1 |
| 1 | Overflow | ผลจริงเกินช่วงที่จำนวนบิตเก็บได้ บิตที่ได้จึงแทนค่าผิด |
| 1 | ALU | วงจรคำนวณในซีพียู สั่งได้ว่าจะบวก ลบ AND หรือ OR |
| 1 | Shift | ขยับบิตทั้งชุดไปซ้ายหรือขวา เลื่อนขวา 1 ตำแหน่งเท่ากับหาร 2 |
| 2 | float | ชนิดข้อมูลทศนิยม 32 บิตในภาษา C (single precision) |
| 2 | double | ชนิดข้อมูลทศนิยม 64 บิต ละเอียดกว่า float (double precision) |
| 2 | Scientific notation | เขียนเลขเป็น ตัวเลข × ฐานยกกำลัง เช่น 0.002 × 10⁴ |
| 2 | Normalized | หน้าจุดมีเลขที่ไม่ใช่ 0 แค่ 1 หลัก เช่น 2.34 × 10⁵⁶ |
| 2 | Floating point | จุดทศนิยมเลื่อนได้ โดยเปลี่ยนเลขชี้กำลังแทน |
| 2 | FPU | วงจรคำนวณเลข floating-point ในซีพียู (บทที่ 6 จะเปิดดูข้างใน) |
| 3 | IEEE 754 | มาตรฐานการเก็บเลข floating-point ที่เกือบทุกเครื่องใช้ (ฉบับแรกปี 1985) |
| 3 | Sign (s) | บิตเครื่องหมาย: 0 = บวก, 1 = ลบ |
| 3 | Exponent | เลขชี้กำลังที่บวก bias ไว้ เลขชี้กำลังจริง = Exponent − 127 |
| 3 | Bias | ค่าที่บวกเพิ่มให้เลขชี้กำลัง จะได้ไม่ต้องเก็บเลขติดลบ (single = 127) |
| 3 | Significand | 23 บิตหลังจุดของ 1.xxx (ตำรา P&H เรียกช่องนี้ว่า fraction) |
| 3 | Hidden bit | เลข 1 หน้าจุดที่ไม่ต้องเก็บ เพราะเลข normalized ขึ้นต้นด้วย 1 เสมอ |
| 4 | Binary point | จุดของเลขฐานสอง หลักหลังจุดมีค่า ½, ¼, ⅛, … |
| 4 | คูณ 2 ซ้ำ | แปลงเศษเป็นฐานสอง: คูณ 2 แล้วเก็บเลขหน้าจุดเป็นบิตถัดไป |
| 4 | Normalize | เลื่อนจุดจนเหลือ 1 หน้าจุด แล้วนับว่าเลื่อนไปกี่ตำแหน่ง |
| 4 | Biased exponent | เลขชี้กำลังจริง + 127 แล้วเขียนเป็นฐานสอง 8 บิต |
| 4 | Hex | อ่าน 4 บิตเป็น 1 หลัก (0–9, A–F) 32 บิตจึงเหลือ 8 หลัก |
| 5 | Align | เลื่อน significand ของตัวที่ exponent น้อยกว่าไปทางขวา จน exponent เท่ากัน |
| 5 | Guard, Round, Sticky | 3 บิตที่เก็บเผื่อไว้ท้าย significand ใช้ตัดสินว่าจะปัดขึ้นหรือลง |
| 5 | Round to nearest even | ปัดไปค่าที่ใกล้ที่สุด ถ้าห่างเท่ากันเลือกตัวที่บิตสุดท้ายเป็น 0 |
| 5 | LSB | บิตขวาสุดที่เก็บได้ ปัดขึ้นคือบวก 1 ที่บิตนี้ |
| 5 | Overflow / Underflow | exponent ของผลใหญ่เกินจนเป็น ∞ หรือเล็กเกินกว่าที่เก็บแบบปกติได้ |
| 6 | Small ALU | ลบ exponent สองตัว ได้ว่าต่างกันเท่าไรและตัวไหนใหญ่กว่า |
| 6 | MUX | ตัวเลือกสัญญาณ ส่งค่าจากหนึ่งในหลายทางออกไปตามสัญญาณควบคุม |
| 6 | Shifter | เลื่อนบิตกี่ตำแหน่งก็ได้ในครั้งเดียว (barrel shifter ในสไลด์) |
| 6 | Big ALU | บวกหรือลบ significand แบบเดียวกับ ALU ในบทที่ 1 |
| 6 | Control | ดูผลจาก Small ALU กับ sign แล้วสั่ง MUX, shifter และ Big ALU |
| 6 | Rounding hardware | ดู G, R, S แล้วตัดสินว่าจะบวก 1 ที่ LSB หรือไม่ |

### C.5 caption (key → ข้อความ)
**บทที่ 1**
| key | ข้อความ |
|---|---|
| `int.add.start` | บวกจากหลักขวาสุดไปซ้าย ทีละหลัก |
| `int.add.column` | หลัก {i}: {a} + {b} + ทด {cin} = {sum} ทด {cout} |
| `int.add.rest` | หลักที่เหลือเป็น 0 ทั้งหมด |
| `int.add.end` | ได้ {bits}₂ = {dec} |
| `int.add.carryOut` | ได้ {bits}₂ และมีตัวทดหลุดหลักซ้ายสุด (เกินช่วง) |
| `int.sub.rewrite` | {a} − {b} = {a} + (−{b}) |
| `int.sub.invert` | Binvert = 1: กลับทุกบิตของ {b} |
| `int.sub.carryIn` | CarryIn = 1: บวกเพิ่ม 1 ได้ −{b} แบบ two's complement |
| `int.sub.add` | บวกด้วย adder ตัวเดิม |
| `int.sub.end` | ได้ {bits}₂ = {dec} ตัวทดที่หลุดซ้ายสุดทิ้งได้ |
| `int.wheel.range` | 4 บิตแบบ two's complement เก็บได้ {min} ถึง {max} |
| `int.wheel.start` | เริ่มที่ {a} |
| `int.wheel.walk` | เดิน {steps} ช่อง{dir} |
| `int.wheel.ok` | ได้ {r} ถูกต้อง |
| `int.wheel.overflow` | ข้ามรอยต่อ {max} กับ {min} ได้ {r} แทน {truth}: overflow |
| `int.wheel.rule` | บวก + บวก ได้ลบ หรือ ลบ + ลบ ได้บวก แปลว่า overflow |
| `int.shift.live` | เลื่อนขวา {s} ตำแหน่ง = หาร 2 ไป {s} ครั้ง ได้ {dec} |

**บทที่ 2**
| key | ข้อความ |
|---|---|
| `c.int` | int ใช้ ALU บวกจำนวนเต็มแบบบทที่ 1 |
| `c.float` | float ต้องใช้วงจรบวกอีกแบบ (FPU) |
| `c.print` | พิมพ์ผลออกมา |
| `c.teaser` | พิมพ์ 9 หลักแล้วไม่ใช่ 0.3 พอดี ดูเหตุผลในบทที่ 5 |
| `point.not` | ยังไม่ normalized: หน้าจุดต้องมีเลขที่ไม่ใช่ 0 แค่หลักเดียว |
| `point.already` | normalized อยู่แล้ว |
| `point.hopLeft` | เลื่อนจุดไปซ้าย 1 หลัก เลขชี้กำลัง +1 |
| `point.hopRight` | เลื่อนจุดไปขวา 1 หลัก เลขชี้กำลัง −1 |
| `point.done` | ได้รูป normalized |
| `point.binary` | ฐานสองก็ทำแบบเดียวกัน แต่คูณด้วย 2 ยกกำลัง |

**บทที่ 3**
| key | ข้อความ |
|---|---|
| `layout.bits` | float หนึ่งตัวมี 32 บิต |
| `layout.sign` | บิต 31: Sign |
| `layout.exp` | บิต 30–23: Exponent 8 บิต |
| `layout.sig` | บิต 22–0: Significand 23 บิต |
| `layout.formula` | ค่า = (−1)ˢ × 1.significand × 2^(Exponent − 127) |
| `layout.plugSign` | s = {s} จึงเป็นค่า{signWord} |
| `layout.plugExp` | Exponent = {E} → เลขชี้กำลังจริง {E} − 127 = {e} |
| `layout.plugSig` | เติม 1 ที่ซ่อนไว้: 1.significand = {sigDec} |
| `layout.value` | {sigDec} × 2^{e} = {value} |
| `bitplay.live` | Exponent เลือกช่วง [{lo}, {hi}) · Significand เลือกตำแหน่งในช่วง |
| `special.zone0` | Exponent = 0: ศูนย์และ subnormal (ไม่มี 1 ที่ซ่อน) |
| `special.zoneNormal` | Exponent = 1–254: ตัวเลขปกติ (normalized) |
| `special.zone255` | Exponent = 255: ∞ และ NaN |
| `special.range` | เล็กสุด ≈ {min} · ใหญ่สุด ≈ {max} |
| `double.compare` | double: 1 + {e64} + {f64} บิต bias {b64} |

**บทที่ 4**
| key | ข้อความ |
|---|---|
| `enc.split` | แยกส่วนเต็ม {int} กับส่วนเศษ {frac} |
| `enc.int` | ส่วนเต็ม {int} = {intBin}₂ |
| `enc.times2` | {f} × 2 = {d} ได้บิต {bit} |
| `enc.loop` | เศษ {f} เคยเจอแล้ว บิตจะวนซ้ำไม่จบ |
| `enc.join` | รวมได้ {bin}₂ |
| `enc.normalize` | เลื่อนจุด{dir} {k} ตำแหน่ง ได้ 1.xxx × 2^{e} |
| `enc.sign` | Sign = {s} |
| `enc.exp` | Exponent = {e} + 127 = {E} = {Ebits}₂ |
| `enc.sig` | Significand = บิตหลังจุด เติม 0 ให้ครบ 23 บิต |
| `enc.hidden` | 1 หน้าจุดไม่ต้องเก็บ (hidden bit) |
| `enc.round` | บิตเกิน 23 ตัว ต้องปัดเศษ |
| `enc.hex` | 32 บิต อ่านทีละ 4 บิตได้ {hex} |
| `enc.inexact` | เก็บได้แค่ค่าใกล้เคียง: {stored} |
| `dec.fields` | แยก 3 ส่วน: s, Exponent, Significand |
| `dec.exp` | Exponent {E} − 127 = {e} |
| `dec.sig` | 1.significand = {sig}₂ |
| `dec.value` | ค่า = {value} |

**บทที่ 5**
| key | ข้อความ |
|---|---|
| `dec4.start` | สมมติเก็บตัวเลขได้แค่ 4 หลัก |
| `dec4.compare` | เลขชี้กำลังต่างกัน {d} |
| `dec4.align` | เลื่อนตัวเล็กไปขวา {d} หลัก หลักที่เกินหลุดทิ้ง |
| `dec4.add` | บวก: {a} + {b} = {sum} |
| `dec4.normalize` | normalize: {norm} × 10^{e} |
| `dec4.round` | ปัดเหลือ 4 หลัก: {rounded} × 10^{e} |
| `fp.unpack` | แยกเป็น sign, exponent และ 1.significand (เติม 1 ที่ซ่อนไว้) |
| `fp.negate` | ลบ = บวกค่าติดลบ: กลับ sign ของ B |
| `fp.swap` | B ใหญ่กว่า สลับให้ตัวใหญ่อยู่บน ผลใช้ sign ของตัวใหญ่ |
| `fp.compare` | exponent ต่างกัน {d} ตัวที่เล็กกว่าต้องเลื่อน {d} ตำแหน่ง |
| `fp.compareZero` | exponent เท่ากันแล้ว ไม่ต้องเลื่อน |
| `fp.alignStep` | เลื่อนขวา 1 ตำแหน่ง exponent +1 (ครั้งที่ {k} จาก {d}) |
| `fp.alignFast` | เลื่อนต่ออีก {n} ตำแหน่ง บิตที่หลุดรวมกันใน S |
| `fp.add` | sign เหมือนกัน: บวก significand |
| `fp.sub` | sign ต่างกัน: เอาตัวใหญ่ลบตัวเล็ก |
| `fp.normRight` | ได้ 2 หลักหน้าจุด เลื่อนจุดซ้าย 1 exponent +1 |
| `fp.normLeft` | หน้าจุดเป็น 0 เลื่อนจุดขวา {k} exponent −{k} |
| `fp.normNone` | อยู่ในรูป 1.xxx แล้ว |
| `fp.overflow` | exponent เกินช่วง ผลเป็น ∞ (overflow) |
| `fp.underflow` | เล็กกว่าที่เก็บแบบปกติได้ เป็น subnormal หรือ 0 |
| `fp.roundExact` | บิตที่เกินเป็น 0 ทั้งหมด ไม่ต้องปัด |
| `fp.roundDown` | G = 0 ส่วนที่เกินน้อยกว่าครึ่ง ปัดลง |
| `fp.roundUp` | G = 1 และ R หรือ S เป็น 1 เกินครึ่ง ปัดขึ้น |
| `fp.tieDown` | อยู่กึ่งกลางพอดี LSB เป็น 0 อยู่แล้ว ปัดลง |
| `fp.tieUp` | อยู่กึ่งกลางพอดี LSB เป็น 1 ปัดขึ้นให้เป็นเลขคู่ |
| `fp.roundCarry` | +1 แล้วล้นเป็น 10.0… ต้อง normalize อีกครั้ง |
| `fp.special` | {rule} |
| `fp.pack` | ประกอบกลับเป็น 32 บิต = {hex} = {value} |
| `round.overflowBits` | บิตที่เกิน 24 บิต: G = {g}, R = {r}, S = {s} |
| `round.line` | ผลจริงอยู่ระหว่างสองค่าที่ float เก็บได้ |
| `round.result` | เลือกค่าที่ใกล้กว่า ได้ {value} |
| `round.compare` | ต่างจาก {typed} อยู่ {error} |
| `slide.funfact1` | y − x ควรได้ 20 แต่ได้ {r} เพราะ double แถวนี้ห่างกันทีละ {ulp} |
| `slide.funfact2` | (−x + x) + 20 = {r1} แต่ −x + (x + 20) = {r2} ลำดับการบวกมีผล |
- `round.rule.*` ใช้ข้อความเดียวกับ `fp.roundDown`, `fp.roundUp`, `fp.tieDown`, `fp.tieUp`

**บทที่ 6**
| key | ข้อความ |
|---|---|
| `hw.unpack` | A กับ B เข้ามา แยก sign, exponent, significand |
| `hw.negate` | ลบ: Control กลับ sign ของ B |
| `hw.compare` | Small ALU: {EA} − {EB} = {diff} |
| `hw.align` | MUX ส่งตัวเล็กเข้า Shifter เลื่อนขวา {d} ตำแหน่ง |
| `hw.add` | Big ALU บวก significand |
| `hw.sub` | Big ALU ลบ significand (Binvert = 1, CarryIn = 1) |
| `hw.normalize` | Normalize เลื่อน{dir} {k} ตำแหน่ง exponent {sign}{k} |
| `hw.round` | Rounding hardware ดู G R S = {grs}: {decision} |
| `hw.pack` | ได้ผลลัพธ์ {hex} |

### C.6 "ทำไม?" (detail)
| key | ข้อความ |
|---|---|
| `why.c.overflow` | ภาษา C ไม่ตรวจ overflow ของ int ผลที่เกินช่วงจะวนกลับเงียบ ๆ (สไลด์ w03c หน้า 12) |
| `why.align` | เลื่อนขวา 1 ตำแหน่งคือหาร 2 จึงต้องบวก exponent 1 ชดเชย ค่ารวมเลยเท่าเดิม |
| `why.bigFirst` | เลื่อนตัวเล็กไปหาตัวใหญ่ บิตที่หลุดเป็นบิตค่าน้อยที่สุด ถ้าเลื่อนตัวใหญ่จะเสียบิตสำคัญ |
| `why.grs` | ฮาร์ดแวร์เก็บบิตที่หลุดไว้แค่ 3 บิต G R S ก็พอให้ปัดได้ผลเหมือนคำนวณแบบไม่จำกัดบิต |
| `why.even` | ถ้าเจอกึ่งกลางแล้วปัดขึ้นทุกครั้ง ผลรวมจำนวนมากจะเอียงขึ้น เลือกเลขคู่ทำให้ขึ้นลงพอ ๆ กัน |
| `why.cycles` | วงจรนี้ซับซ้อนกว่า adder จำนวนเต็มมาก ฮาร์ดแวร์จริงจึงใช้หลาย clock cycle และทำแบบ pipeline ได้ |

### C.7 สรุปท้ายบท และประโยคส่งต่อ
| key | ข้อความ |
|---|---|
| `takeaway.binary` | ลบ = บวกค่าติดลบ วงจรเดียวทำได้ทั้งสองอย่าง แต่รู้จักแค่จำนวนเต็ม |
| `bridge.binary` | แล้วถ้าเป็น 6.5 + 3.75 ล่ะ |
| `takeaway.float` | float เก็บเลขแบบ ±1.xxx × 2ᵉ: เครื่องหมาย เลขชี้กำลัง และตัวเลขหลังจุด |
| `takeaway.ieee754` | ค่า = (−1)ˢ × 1.significand × 2^(Exponent − 127) |
| `takeaway.convert` | ฐานสอง → normalize → exponent + 127 → significand 23 บิต → hex |
| `bridge.dec4` | ฐานสองทำ 4 ขั้นเดียวกันทุกอย่าง |
| `takeaway.fp` | align → บวก/ลบ significand → normalize → ปัดเศษ ใช้ทั้งบวกและลบ |
| `takeaway.circuit` | วงจรบวก float คือ ALU + MUX + shifter ต่อกันตาม 4 ขั้น |

### C.8 คำถามเช็ก (`quiz.ts`)
- คำตอบที่ถูก และตัวเลือกหลอกที่อ้างค่าจริงของบางอย่าง (เช่นค่า unsigned ของ 1001, hex ของ 0.75) คำนวณจากโมเดล · ตัวเลือกหลอกที่เป็นข้อความล้วนเขียนเองได้
| key | คำถาม | ตัวเลือก (ตัวแรกคือคำตอบ สลับลำดับตอนแสดง) | เหตุผล |
|---|---|---|---|
| `quiz.binary` | 0100 + 0101 แบบ 4 บิต two's complement ได้อะไร | `{1001} = {−7} เกิด overflow` · `{1001} = {9} ถูกต้อง` · `0001 มีตัวทดออก` | บวก + บวก แล้วได้ลบ คือ overflow |
| `quiz.float` | ข้อไหนเป็น normalized | 2.34 × 10⁵⁶ · 0.002 × 10⁴ · 987.02 × 10⁹ | หน้าจุดต้องมีเลขที่ไม่ใช่ 0 หลักเดียว |
| `quiz.ieee754` | Exponent = 10000010₂ แปลว่าคูณด้วยเท่าไร | `2^{3}` · `2^{130}` · `2^{2}` | {130} − 127 = {3} |
| `quiz.convert` | −0.75 เก็บเป็น float ได้ hex อะไร | `{0xBF400000}` · `{0x3F400000}` · `{0xBF000000}` (encode ของ −0.75, 0.75, −0.5) | s = 1, Exponent = {126}, 1.significand = {1.1}₂ |
| `quiz.fp` | G = 1, R = 0, S = 0 และ LSB = 1 จะปัดยังไง | ปัดขึ้นให้ LSB เป็น 0 · ปัดลง · ไม่ต้องปัด | อยู่กึ่งกลางพอดี เลือกเลขคู่ |
| `quiz.circuit` | กล่องไหนบอกว่าต้องเลื่อน significand กี่ตำแหน่ง | Small ALU · Big ALU · Rounding hardware | Small ALU ลบ exponent สองตัว ได้จำนวนที่ต้องเลื่อน |

### C.9 สรุปท้ายหน้า
1. ลบ = บวกค่าติดลบ ใช้วงจรบวกตัวเดิมได้ทั้งจำนวนเต็มและ floating-point
2. float เก็บ 3 ส่วน: sign 1 บิต, exponent 8 บิต (bias 127), significand 23 บิต
3. บวก/ลบ 4 ขั้น: align → บวก/ลบ significand → normalize → ปัดเศษ
4. เลื่อนขวา 1 ตำแหน่งต้องเพิ่ม exponent 1 ค่าเลยเท่าเดิม
5. G, R, S ทำให้ปัดได้ถูก แต่ผลก็ยังอาจไม่ตรงค่าจริง เช่น 0.1 + 0.2
6. ในวงจร: Small ALU → MUX + Shifter → Big ALU → Normalize → Round

### C.10 อ้างอิง (ท้ายหน้าและ `SourceNote`)
- รายการใน `site.references` (C.1) · `SourceNote` ต่อบท: บท 1 "สไลด์ w03c หน้า 3–12, 29–33, 36–37 · P&H 3.2" · บท 2 "สไลด์ w03c_mult หน้า 13" · บท 3 "สไลด์ w03c_mult หน้า 14–20" · บท 4 "สไลด์ w03c_mult หน้า 15 · P&H 3.5" · บท 5 "P&H 3.5 · สไลด์ w03c_mult หน้า 21–22 · IEEE 754-2019" · บท 6 "P&H 3.5 · สไลด์ w03c หน้า 30–33, 36–37 · w04a หน้า 7, 12"

### C.11 Footer และป้ายอื่น
- คำอธิบาย: "comkrub · สื่อการสอนวิชา Computer Architecture เรื่องการบวกและลบเลข Floating-Point · คำนวณทุกอย่างใน browser"
- หัวรายการ: "บทเรียน" · เครดิตผู้จัดทำ อาจารย์ และป้าย Analytics ใช้ของเดิม
- ปุ่ม/ป้าย: "เล่น" · "หยุด" · "ย้อน" · "ถัดไป" · "เริ่มใหม่" · "ความเร็ว" · "นำเสนอ" · "ทำไม?" · "ตรวจ" · "แสดงครบ 24 บิต" · "ไปต่อ" · "คัดลอกลิงก์" · "ตัวอย่าง" · "บิต" · "วงจร" · "ควรรู้มาก่อน"

---

## ภาคผนวก D: Golden vectors ใหม่ (ตรวจแล้ว)
ตรวจเมื่อ 2 พ.ย. 2569 ด้วย Python: algorithm อ้างอิงแบบเดียวกับ stage1 4.3 (ตรงกับ numpy float32 ทุกแถว และสุ่มเพิ่ม 200,000 คู่ไม่มีผิด) + `fractions.Fraction` สำหรับตำแหน่งบนเส้นจำนวน · ของเดิม A1–A6 (stage1 ภาคผนวก C.3) ยังต้องผ่านด้วย · test ต้องใช้ค่าจากตารางนี้ แต่ content ห้ามพิมพ์ค่าเหล่านี้เอง

### D.1 บวก/ลบ binary32 (chip ตัวอย่างของ 5.2–5.4, 6.1, 7)
| # | operation | ผลลัพธ์ | รายละเอียดที่ต้องตรง |
|---|---|---|---|
| A7 | `6.5 + 3.75` | `0x41240000` = 10.25 | A = `0x40D00000` (1.101₂ × 2², Exponent 129) · B = `0x40700000` (1.111₂ × 2¹, Exponent 128) · d = 1 · บวก: 1.101 + 0.1111 = 10.1001 · normalize ขวา 1 → 1.01001₂ × 2³ · G R S = 0 0 0 · exact |
| A8 | `3.75 − 6.5` | `0xC0300000` = −2.75 | กลับ sign ของ B · \|B\| > \|A\| จึงสลับ · d = 1 · ลบ · normalize ซ้าย 1 · exact · sign ของผล = sign ของตัวใหญ่ (ลบ) |
| A9 | `0.5 − 0.4375` (op −) | `0x3D800000` = 0.0625 | เหมือน A1 แต่มาจาก op − · d = 1 · 1.000 − 0.111 = 0.001 · normalize ซ้าย 3 · exact |
| A10 | `9.75 + 0.5625` | `0x41250000` = 10.3125 | d = 4 (ใช้ทดสอบเฟรม align 4 ครั้ง) · ไม่ต้อง normalize · exact |
| A11 | `1.5 + 0.375` | `0x3FF00000` = 1.875 | d = 2 · ไม่ต้อง normalize · exact |
| A12 | `100 + 0.1` | `0x42C83333` | d = 10 (เฟรมเร่ง) · G R S = 0 0 1 · ปัดลง |
- แถวเดิมที่ใช้เป็น chip: A2 `0.1 + 0.2` → `0x3E99999A` (สลับ, d = 1, normalize ขวา 1, G R S = 1 1 0, ปัดขึ้น) · A3 `1 + 1e-8` → `0x3F800000` (d = 27, G R S = 0 0 1, ปัดลง) · A4 `16777216 + 1` → `0x4B800000` (d = 24, G R S = 1 0 0, เสมอ LSB = 0 ปัดลง) · A5 `16777216 + 3` → `0x4B800002` (d = 23, เสมอ LSB = 1 ปัดขึ้น) · A6 `1.0000001 − 1` → `0x34000000` (d = 0, normalize ซ้าย 23)
- encode: `6.5` → `0x40D00000` · `3.75` → `0x40700000` · `10.25` → `0x41240000` · `0.0625` → `0x3D800000` · `−0.75` → `0xBF400000` (ตัวอย่าง P&H) · `0.75` → `0x3F400000` · `−0.5` → `0xBF000000` · decode `0xC0A00000` → −5 (ตัวอย่าง P&H)

### D.2 จำนวนเต็ม (สไลด์ w03c)
| กรณี | บิต | ผล (signed) | overflow | ตัวทดออก |
|---|---|---|---|---|
| 3 + 2 | 0011 + 0010 = 0101 | 5 | ไม่ | 0 |
| 3 + (−2) | 0011 + 1110 = 0001 | 1 | ไม่ | 1 |
| −3 + 2 | 1101 + 0010 = 1111 | −1 | ไม่ | 0 |
| −3 + (−2) | 1101 + 1110 = 1011 | −5 | ไม่ | 1 |
| 4 + 5 | 0100 + 0101 = 1001 | −7 | **ใช่** | 0 |
| 4 + (−5) | 0100 + 1011 = 1111 | −1 | ไม่ | 0 |
| −4 + 5 | 1100 + 0101 = 0001 | 1 | ไม่ | 1 |
| −4 + (−5) | 1100 + 1011 = 0111 | 7 | **ใช่** | 1 |
- `7 + 6` แบบ 8 บิต: 00000111 + 00000110 = 00001101 = 13 · ตัวทดเข้าหลัก 1, 2, 3, 4 = 0, 1, 1, 0 (ตรงกับแถว Carries ในสไลด์ w03c หน้า 3) · หลัก 4–7 เป็น 0 ทั้งหมด (รวบเป็นเฟรม `int.add.rest`)
- ระวัง: `7 + 6` แบบ **4 บิต** ได้ 1101 ซึ่งเป็น −3 ถ้ามองแบบ signed (overflow) จึงใช้ 8 บิตเป็นค่าเริ่มต้นของ 1.1
- `7 − 6` แบบ 4 บิต: กลับบิต 0110 → 1001 · +1 → 1010 (−6) · 0111 + 1010 = 1 0001 → ทิ้งตัวทดออก ได้ 0001 = 1
- shift: 104 (01101000) เลื่อนขวา 1, 2, 3 → 52, 26, 13 (ไม่มีบิต 1 หลุด) · 13 (00001101) เลื่อนขวา 1 → 6 (บิต 1 หลุด)

### D.3 ฐานสิบ 4 หลัก (P&H 3.5)
- `9.999 × 10¹ + 1.610 × 10⁻¹`: d = 2 · align → `0.016 × 10¹` (หลัก 10 หลุด) · บวก → `10.015 × 10¹` · normalize → `1.0015 × 10²` · ปัด (เสมอ หลักก่อนหน้าเป็นคี่ → ขึ้น) → `1.002 × 10²`
- normalize ตัวอย่างสไลด์: `0.002 × 10⁴` → `2 × 10¹` (จุดไปขวา 3) · `987.02 × 10⁹` → `9.8702 × 10¹¹` (จุดไปซ้าย 2) · `2.34 × 10⁵⁶` normalized อยู่แล้ว

### D.4 printf (ค่าที่เก็บจริงแบบ exact)
| ค่า | รูปแบบ | ผล |
|---|---|---|
| `7 + 6` (int) | `%d` | `13` |
| `6.5f + 3.75f` | `%f` | `10.250000` |
| `0.1f + 0.2f` | `%.9f` | `0.300000012` |
| `16777216.0f + 1.0f` | `%f` | `16777216.000000` |

### D.5 เส้นจำนวนของการปัด (`round-line.ts`)
| ตัวอย่าง | ค่าลง | ค่าขึ้น | ผลจริงของค่าที่เก็บ | pos | ผล |
|---|---|---|---|---|---|
| 0.1 + 0.2 | `0x3E999999` | `0x3E99999A` | 0.300000004470348358154296875 | 3/4 | ขึ้น |
| 16777216 + 1 | 16777216 | 16777218 | 16777217 | 1/2 | เสมอ → 16777216 (LSB 0) |
| 16777216 + 3 | 16777218 | 16777220 | 16777219 | 1/2 | เสมอ → 16777220 |
| 1 + 1e-8 | 1 | 1 + 2⁻²³ | 1 + 11258999/2⁵⁰ | 11258999/134217728 (≈ 0.084) | ลง |

### D.6 ตัวอย่างในสไลด์ (binary64 · w03c_mult หน้า 21–22)
- `x = 1e17` (เก็บได้พอดี) · ulp ของ double แถวนี้ = 16 · `y = x + 20` → `1e17 + 16`
- `y − x = 16` · `(−x + x) + 20 = 20` · `−x + (x + 20) = 16`

---

## ภาคผนวก E: สรุปเนื้อหาจากสไลด์อาจารย์ (ใช้แทนการเปิด PDF บ่อย ๆ)
> สรุปด้วยคำของเราเอง ไม่ใช่การคัดลอก · เลขหน้าเป็นหน้า PDF

### E.1 `Slide/w03c.pdf` — Arithmetic for Computers: Addition & Subtraction, Exception, ALU
- หน้า 3, 10: บวก 7 + 6 ทีละหลัก แสดงแถวตัวทดอยู่เหนือหลัก (ตัวทดของหลักซ้ายสุดไม่ไปไหน)
- หน้า 4–5: word 4 บิตแทน −8…7 (0111 = 7 … 1000 = −8), 8 บิต −128…127, 32 บิต −2,147,483,648…2,147,483,647
- หน้า 6–9: บวก 4 บิต 8 กรณี · 4 + 5 ได้ 1001 = −7 และ −4 + (−5) ได้ 0111 = 7 (ผลผิด มีเครื่องหมาย "(!?!)")
- หน้า 10: overflow เกิดเมื่อบวกเลขบวกสองตัวแล้ว sign ของผลเป็น 1 หรือบวกเลขลบสองตัวแล้ว sign เป็น 0 · บวกเลขต่างเครื่องหมายไม่มีทาง overflow
- หน้า 11: ลบ = บวกด้วยค่าติดลบของตัวที่สอง เช่น 7 − 6 = 7 + (−6) · กติกา overflow ของการลบ
- หน้า 12: บางภาษาเช่น C ไม่สนใจ overflow (MIPS `addu`) บางภาษาต้องเกิด exception (`add`)
- หน้า 27–28: ALU ใช้ MUX เลือกผลจากวงจรย่อย (บวก/ลบ, AND, OR)
- หน้า 29: full adder 1 บิต ตารางความจริงของ a, b, carry in → carry out, sum
- หน้า 30–33: one-bit ALU มี Binvert และ CarryIn · 32-bit ALU ต่อ 1-bit ALU 32 ตัว · x + y: operation = 10, Binv = 0, CarryIn[0] = 0 · x − y = x + (−y): Binv = 1, CarryIn[0] = 1
- หน้า 34–35: slt และการทดสอบเท่ากัน (ไม่ใช้ในงานนี้)
- หน้า 36–37: barrel shifter เลื่อน 0–31 บิตตามค่า s 5 บิต · shift คือการต่อสายใหม่แล้วเติม 0

### E.2 `Slide/w03c_mult.pdf` — Floating Point (หน้า 13–23)
- หน้า 13: floating point แทนเลขไม่ใช่จำนวนเต็ม ทั้งเล็กมากและใหญ่มาก คล้าย scientific notation · 2.34 × 10⁵⁶ (normalized) · 0.002 × 10⁴ และ 987.02 × 10⁹ (ไม่ normalized) · ฐานสอง ±1.xxxxxxx × 2ʸʸʸʸ · ชนิด float และ double ในภาษา C
- หน้า 14: มาตรฐาน IEEE Std 754-1985 เกิดเพราะแต่ละเครื่องแทนค่าไม่เหมือนกัน (ย้ายโปรแกรมวิทยาศาสตร์ยาก) ตอนนี้ใช้เกือบทุกที่ · single 32 บิต, double 64 บิต
- หน้า 15: single precision บิต 31 = s, 30–23 = exponent (8 บิต), 22–0 = significand (23 บิต) · exponent 0x00: significand 0 → 0, −0 / ไม่ใช่ 0 → subnormal = (−1)ˢ × (0.significand) × 2⁻¹²⁶ · exponent 0x01–0xFE: normalized = (−1)ˢ × (1.significand) × 2^(Exponent − 127) · exponent 0xFF: significand 0 → ∞, −∞ / ไม่ใช่ 0 → NaN
- หน้า 16–17: ตารางตัวอย่าง s / exponent / significand / hex / ค่า: 0x80000000 = −0, 0x00000000 = 0, 0x00000001 = 0.00…01₂ × 2⁻¹²⁶ ≈ 1.4 × 10⁻⁴⁵, 0x007FFFFF ≈ 1.17549421 × 10⁻³⁸, 0x00800000 = 1.0 × 2⁻¹²⁶ ≈ 1.17549435 × 10⁻³⁸, 0x7F7FFFFF ≈ 3.40282347 × 10³⁸, 0x7F800000 = ∞, 0xFF800000 = −∞, 0x7F800001 / 0xFF800001 / 0x7FFFFFFF = NaN
- หน้า 18: ค่าเล็กสุด ±2⁻¹⁴⁹ ≈ ±1.4 × 10⁻⁴⁵ · ค่าใหญ่สุด (ไม่ใช่ ∞) ±1.11…11₂ × 2¹²⁷ ≈ ±3.4 × 10³⁸
- หน้า 19: double: exponent 11 บิต, significand 52 บิต, bias 1023 · เล็กสุด ±2⁻¹⁰⁷⁴ ≈ ±4.9 × 10⁻³²⁴ · ใหญ่สุด ≈ ±1.79 × 10³⁰⁸
- หน้า 20: ตัวอย่าง C: `x = 17.9e307` พิมพ์ได้ แต่ `x = 18e307` เกินช่วงเป็น inf
- หน้า 21–22: significand 52 บิตละเอียดได้ถึง 2⁻⁵² · `x = 1e17; y = 1e17 + 20; y − x` คลาดได้ถึงประมาณ 10¹⁷ · 2⁻⁵² ≈ 22 · ให้ลอง `-x + x + 20` เทียบ `-x + (x + 20)`
- หน้า 23: ให้อ่าน P&H5e 3.3–3.5 และบทที่ 3 ของเอกสารประกอบรายวิชา

### E.3 `Slide/w04a.pdf` — The Processor (ใช้แค่หน้าตาวงจร)
- หน้า 5: MUX เป็นตัวควบคุมว่าจะส่งข้อมูลทางไหน (ต่อสายตรง ๆ ไม่ได้)
- หน้า 7–10: datapath ของคำสั่งต่าง ๆ เน้นเส้นทางที่ใช้ด้วยสีเหลือง ส่วนอื่นจาง (แบบที่บทที่ 6 ใช้)
- หน้า 12: สัญลักษณ์ AND gate, Adder (Y = A + B), MUX (Y = S ? I1 : I0), ALU (Y = F(A, B))
- หน้า 13: register เก็บข้อมูล อัปเดตที่ขอบขาขึ้นของ clock
