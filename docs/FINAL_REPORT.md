# รายงานสุดท้าย Binary Lab

30 ต.ค. 2569 · branch `main` (push แล้ว) · ยังไม่ได้ deploy (Pisit deploy เองตาม `docs/DEPLOY.md`)

## 1. สรุปสิ่งที่ทำเสร็จ

| Phase | สิ่งที่ได้ |
|---|---|
| 0 Setup | ลบ prototype เก่า, `.gitignore`, scaffold Next.js 16.4.3 + เครื่องมือครบ, CLAUDE.md, PROGRESS/QUESTIONS/STACK |
| 1 Engine | `src/lib/fp/` BigInt ล้วน: encode/decode, บวก/ลบ/คูณ/หาร พร้อม step data, ค่าพิเศษ, ทศนิยมสั้นที่สุด/ค่าที่เก็บจริงครบทุกหลัก, เศษส่วน, จำนวนเต็ม 8 บิต (สรุป API ใน `docs/ENGINE.md`) |
| 2 Design system | ธีม Liquid Glass ฟ้า-ขาว port จาก CoE-Shop + daisyUI 5, register บิต 3 สีพร้อมแตะดูความหมาย, StepPlayer (ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด/flowchart/reduced motion) |
| 3–6 บทเรียน | บทที่ 1–5 ครบตาม requirement ทุกบทมีสรุปท้ายบท · Integer Explorer, Fraction Explorer + เส้นจำนวน, Fraction Converter, IEEE 754 Converter (encode/decode), Simulator +/− และ ×/÷ |
| Milestone | "พร้อมใช้สอน" ผ่าน — เขียน "พร้อม deploy แล้ว" ไว้บรรทัดแรกของ PROGRESS.md |
| 7 Lab + polish | `/lab` 2 แท็บ + ลิงก์แชร์ (สถานะและขั้นอยู่ใน URL), หน้าแรกพร้อม demo สด 0.1 + 0.2, icon, OG image ภาษาไทย, sitemap, robots, 404, error, print stylesheet |
| 8 พร้อม deploy | production build ผ่าน, ไม่มี secret, security headers ครบ, README + DEPLOY.md |
| 9 Review 3 รอบ | ใช้งานจริง / ความสวย / ความถูกต้อง — สิ่งที่เจอและแก้อยู่ใน `docs/REVIEW.md` |

### เพิ่มหลังได้คำตอบคำถาม (31 ต.ค. 2569)
- Pisit deploy แล้วที่ https://comkrub.mypisit.com → แก้ `siteUrl` ให้ตรง (OG image, sitemap, robots)
- **Q7** Lab เลือก Half (16) / Single (32) / Double (64) บิตได้ และอยู่ในลิงก์แชร์ (`?fmt=b16`, `?fmt=b64`) · ตรวจกับ oracle จริงทั้งสอง format ก่อนเปิดใช้
- **Q8** โหมดนำเสนอในทุก StepPlayer: เต็มจอ ตัวใหญ่ ← → Space ใช้ได้ทั้งหน้า Esc ออก
- **Q9** Vercel Web Analytics + ป้ายมุมขวาล่างของ footer — **ต้องกด Enable ที่แท็บ Analytics ของโปรเจกต์บน Vercel หนึ่งครั้ง** (ขั้นตอนใน DEPLOY.md)

### ข้อจำกัด
- แถบควบคุม StepPlayer บนมือถือเป็น sticky ล่างจอ จึงบังท้ายภาพของขั้นที่ยาวจนกว่าจะเลื่อนลง (ตั้งใจให้กด "ถัดไป" ได้ตลอด)
- ไฮไลต์ "บิตที่เกี่ยวข้องกับขั้นนี้" (FR-07) ทำที่ register ผลลัพธ์, G/R/S, และแถวที่โผล่ใหม่ ส่วนแถวเลขฐานสองยาว ๆ ในแต่ละขั้นใช้สีตามบทบาท (hidden/fraction/GRS) แทนการไฮไลต์รายบิต
- คูณ/หารแสดงขั้นตรวจช่วงก่อนปัดเศษ (requirement เรียงปัดก่อน) ผลทุกบิตถูกต้องเหมือนกัน (Q12)
- ใช้ `@tailwindcss/turbopack` ตาม scaffold ของ create-next-app 16.4.3 แทน `@tailwindcss/postcss` ในแผน (`docs/STACK.md`)

## 2. Acceptance criteria

### requirement เดิม (`floating_point_website_requirements.md` ข้อ 6)
| เกณฑ์ | สถานะ | ตรวจด้วย |
|---|---|---|
| เข้าถึงบทเรียนได้ครบ | ผ่าน (5 บท + Lab) | e2e `site.spec` นำทางจากเมนู desktop และ drawer มือถือ + ปุ่มบทก่อน/ถัดไป |
| บทที่ 1 Integer Explorer 8 บิตคำนวณถูก | ผ่าน | e2e `ch1-2` (00001010 = 10, preset 255) + unit I1–I3 |
| บทที่ 2 Fraction Explorer 16 บิต น้ำหนักและค่าถูก | ผ่าน | e2e `ch1-2` + unit `fractionValue` |
| บทที่ 2 สาธิตการแปลงเศษส่วนและอธิบายการประมาณ | ผ่าน | e2e: 0.1 ที่ 16 บิต ได้บิต ค่าประมาณ ผลต่าง วงซ้ำตรงภาคผนวก C · 0.375 ผลต่าง 0 |
| บทที่ 3 encode แสดง field และขั้นตอน | ผ่าน | e2e `ch3` 5.75 → 0x40B80000, −13.25 → 0xC1540000 + golden E1–E15 |
| บทที่ 3 decode 32 บิตได้ค่า | ผ่าน | e2e `ch3` 40B80000 → 5.75, สลับ Sign → −5.75 + golden X1–X6 |
| บทที่ 4 จำลองบวก/ลบแสดงขั้นกลาง | ผ่าน | e2e `ch4` 0.1 + 0.2 → 0x3E99999A, player/flowchart + golden A1–A6 |
| ทุกบทมีสรุปท้ายบท | ผ่าน | e2e ตรวจ `chapter-summary` ทุกบท |
| ข้อมูลผิดมีข้อความเข้าใจง่าย | ผ่าน | e2e (`1,5`, 31 บิต, นอกช่วง 0–255, x ≥ 1) + review รอบ 1 (ว่าง, ตัวอักษร, `1e999`) |
| กิจกรรมหลักทำงานและผลถูก | ผ่าน | unit 160 + e2e 65 |

### requirement ส่วนเพิ่ม (`floating_point_website_requirements_mul_div.md` ข้อ C)
| เกณฑ์ | สถานะ | ตรวจด้วย |
|---|---|---|
| เข้าถึงได้ครบ 5 บท | ผ่าน | e2e `site.spec` |
| บทที่ 5 จำลองคูณ/หารแสดงขั้นกลาง | ผ่าน | e2e `ch5` + golden M1–M11, D1–D13 |
| คูณแสดง partial product · หารแสดงแถวหารยาวและเศษที่เป็น Sticky | ผ่าน | e2e: 6.5 × 2.75 มี 3 แถว · 1 ÷ 3 มี 27 แถว เศษ ≠ 0 → Sticky = 1 |
| ผลทั้ง 4 operation ตรง IEEE 754 binary32 ทุกบิต | ผ่าน | golden ภาคผนวก C ทุกแถว · oracle `Math.fround` 480,000 กรณีใน `npm test` + 1,008,000 ใน `test:long` · exhaustive minifloat 262,144 กรณี |
| ÷0, 0÷0, 0×∞, overflow, underflow ได้ผลถูกพร้อมคำอธิบาย | ผ่าน | e2e `ch5` (1÷0 → +∞ + Division by zero, 0÷0 → NaN, ∞×0 → NaN, 3e38×10 → Overflow) + golden M6, M7, D10, D11 |
| ทุกกระบวนการหลายขั้นกดย้อน/ถัดไป/เล่น/กระโดดได้ ทั้งเมาส์ จอสัมผัส คีย์บอร์ด + reduced motion | ผ่าน | e2e `player.spec` บน Pixel 7, iPhone 13, desktop (ปุ่ม, ตัวบอกขั้น, ← → Space Home, flowchart, autoplay, `reducedMotion: 'reduce'`) |
| สีและป้ายชื่อ field เหมือนกันทุกบท | ผ่าน | ใช้ `FIELD_STYLE` ชุดเดียวทั้งเว็บ + `FieldLegend` · review รอบ 2 |
| บทที่ 5 มีสรุปท้ายบท | ผ่าน | e2e `ch5` |

ฉบับภาษาไทยทั้ง 2 ไฟล์มีเกณฑ์ตรงกับฉบับอังกฤษ (ไม่พบส่วนที่ขัดกัน)

## 3. ผล test ล่าสุด (30 ต.ค. 2569)
- `npm test`: **172 ผ่าน** (engine 7 ไฟล์รวม oracle binary16/binary64 + url-state)
- `npm run test:long`: **1,008,000 กรณีผ่าน** (~7 วินาที)
- coverage `src/lib/fp/**`: statements **99.1%** · branches **98.7%** · functions **98%** · lines **99.7%**
- `npm run test:e2e` (production build): **71 ผ่าน, 1 ข้าม** (ทดสอบ clipboard เฉพาะ Chromium) บน pixel7 + iphone13 + desktop รวม axe (ไม่มี serious/critical) และไม่มี console error ทุกหน้า
- ไม่มีหน้าไหนล้นแนวนอนที่ 360/390/430/768/1280/1920 ทั้ง Chromium และ WebKit
- Lighthouse มือถือ: หน้าแรก 93/98/100/100 · บทที่ 4 99/100/100/100 · บทที่ 5 99/100/100/100 (Performance/Accessibility/Best Practices/SEO; หน้าแรกแก้ heading-order หลังวัดแล้ว)
- `npm run build`: ทุก route static (○)

screenshot สำคัญ (อยู่ในเครื่อง, `test-results/` ไม่ถูก commit): `test-results/shots/home-1280.png`, `home-390-top.png`, `player-390.png`, `player-1280.png`, `ch3-conv-390.png`, `ch4-round-390.png`, `og.png`, `test-results/review/r1-lab-1920.png`, `r2-ch4-1920.png`, `r2-ch5-360-webkit.png` · ถ่ายใหม่ได้ด้วย `npm run shots`

## 4. คำถามทั้งหมด
ตอบครบทุกข้อแล้ว (31 ต.ค. 2569) รายละเอียดใน `docs/QUESTIONS.md`: Q1 Binary Lab · Q2/Q11 เครดิต (ณัฐิวุฒิ ตามที่ Pisit แก้) · Q3 โอเค · Q4 comkrub.mypisit.com · Q5 ไทยอย่างเดียว · Q6 ลบ prototype · Q7 เพิ่ม 16/64 บิตแล้ว · Q8 ทำโหมดนำเสนอแล้ว · Q9 ใส่ Analytics แล้ว · Q10 ไม่ใส่ · Q12 ตรวจช่วงก่อนปัดโอเค

## 5. ขั้นต่อไปของ Pisit
1. เปิด Web Analytics ที่ Vercel (Project → Analytics → Enable แล้ว Redeploy หนึ่งครั้ง)
2. ทดสอบบน iPhone และ Android จริงตาม checklist ในข้อ 5 ของ DEPLOY.md รวมปุ่ม "นำเสนอ" บนจอโปรเจกเตอร์
