# comkrub

เว็บสื่อการสอนรายวิชา Computer Architecture เรื่องเดียว: **การบวกและการลบเลข Floating-Point** (IEEE 754 single precision) เป็นหน้าเดียว เลื่อนลงทีละบท ภาพเคลื่อนไหวเยอะ ข้อความน้อย ทุกขั้นกดเล่นได้

1. บวกและลบเลขฐานสอง (ทบทวนจาก Digital: full adder, two's complement, overflow, shift)
2. เลขทศนิยมในโปรแกรม (`int` กับ `float` ในภาษา C, scientific notation)
3. IEEE 754: เก็บและแปลงเลข (อ่าน 32 บิต → แปลงทศนิยมเป็น 32 บิต → กดบิตเล่น → ค่าพิเศษ)
4. บวกและลบเลข Floating-Point (align → บวก/ลบ → normalize → ปัด G R S)
5. วงจรบวก/ลบ Floating-Point (Small ALU, Control, MUX, Shifter, Big ALU, Normalize, Round)
6. ลองเอง (ใส่เลขเอง ดูแบบบิตหรือแบบวงจร แชร์ลิงก์ได้) และสรุป

- ทุกกระบวนการหลายขั้นใช้ StepPlayer (ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด/โหมดนำเสนอ/reduced motion)
- ตัวเลขทุกตัวบนหน้าเว็บมาจาก engine ที่ใช้ BigInt ผลตรง IEEE 754 binary32 (round to nearest, ties to even) ทุกบิต
- static ทั้งเว็บ ไม่มี backend, database หรือ env · ลิงก์เก่า `/learn/*` และ `/lab` redirect มาที่บทที่ตรงกัน

## รันในเครื่อง

ต้องมี Node.js 24 ขึ้นไป และ npm

```bash
npm install
npm run dev          # http://localhost:3000
```

## คำสั่ง

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm start` | build และรันแบบ production |
| `npm run lint` · `npm run typecheck` | ตรวจโค้ด |
| `npm test` | unit test ของ engine (golden vectors, oracle Math.fround, exhaustive minifloat) |
| `npm run test:long` | oracle 1,008,000 กรณี |
| `npm run test:cov` | coverage ของ `src/lib/fp` |
| `npm run test:e2e` | Playwright (ครั้งแรกรัน `npx playwright install chromium webkit`) |
| `npm run text:report` | ตารางจำนวนตัวอักษรต่อบท เทียบงบใน PLAN.md 1.3 |
| `npm run shots -- <path> <out.png> [width] [height]` | ถ่าย screenshot (ต้องมี server ที่ `SHOT_BASE`, ค่าเริ่มต้น `http://localhost:3200`) |

## โครงสร้าง

- `src/app/page.tsx` หน้าเดียว (`/`) · `src/app/dev/kit` หน้ารวมชิ้นส่วนภาพ (เฉพาะ dev)
- `src/lib/fp/` engine (อธิบายใน `docs/ENGINE.md`) · `src/lib/int/`, `src/lib/sci/` โมเดลบทที่ 1–2 และ 5.1
- `src/lib/lesson/` frame adapters: แปลงผลของ engine เป็นเฟรมที่ UI วาดได้โดยไม่ต้องคำนวณเอง
- `src/components/scenes/` ฉากของแต่ละบท · `stage/` ชิ้นส่วนภาพ (BitTrack, RoundLine, …) · `hw/` วงจร · `player/` StepPlayer
- `src/content/lesson/` ข้อความทั้งหมดที่ผู้ใช้เห็น (บท, คำศัพท์, caption, คำถามเช็ก, ตัวอย่าง) · มี test ตรวจงบข้อความ
- `src/lib/site.ts` ชื่อเว็บ เครดิต ลิงก์ (แก้ที่เดียว)
- `PLAN.md` แผนงาน · `docs/` ความคืบหน้า คำถาม review คู่มือ deploy และการแบ่งงาน (`docs/PARALLEL.md`)

## แหล่งอ้างอิง

- สไลด์ Computer Architecture: Arithmetic for Computers (w03c, w03c_mult), Tatpong Katanyukul, CoE KKU
- D. A. Patterson and J. L. Hennessy, Computer Organization and Design, 5th ed., หัวข้อ 3.2 และ 3.5
- IEEE Std 754-2019, IEEE Standard for Floating-Point Arithmetic

## ผู้จัดทำ

จัดทำโดย 673040127-5 นายพัชรวัฒน์ วิพัธครตระกูล · 673040128-3 นายพิสิษฐ์ ศรีชำนาจ · 673040136-4 นายเอกสิทธิ์ สุวรรณวงษ์ · 673040386-1 นายณัฐิวุฒิ แสงสารพันธ์

อาจารย์ผู้สอน: ผศ. ดร. จิระเดช พลสวัสดิ์
