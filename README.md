# comkrub

เว็บสื่อการสอนแบบ interactive เรื่องเลขฐานสองและ Floating-Point (IEEE 754 Single Precision) วิชา Computer Architecture

- 5 บท: ระบบเลขฐาน · เศษส่วนฐานสอง · IEEE 754 encode/decode · บวก/ลบ · คูณ/หาร + หน้า Lab
- ทุกกระบวนการหลายขั้นดูได้ทีละขั้นด้วย StepPlayer (ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด)
- คำนวณทั้งหมดใน browser ด้วย engine ที่ใช้ BigInt ผลตรง IEEE 754 binary32 (round to nearest, ties to even) ทุกบิต
- static ทั้งเว็บ ไม่มี backend, database หรือ env

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
| `npm run shots -- <path> <out.png> [width] [height]` | ถ่าย screenshot (ต้องมี server ที่ `SHOT_BASE`, ค่าเริ่มต้น `http://localhost:3200`) |

## โครงสร้าง

- `src/lib/fp/` engine (อธิบายใน `docs/ENGINE.md`)
- `src/app/` หน้าเว็บ (`/learn/*`, `/lab`)
- `src/components/` ธีมกระจก, บิต, StepPlayer, ภาพแต่ละขั้น, เครื่องมือ
- `src/content/` ตัวอย่าง, ข้อความของแต่ละขั้น, คำศัพท์
- `src/lib/site.ts` ชื่อเว็บ เครดิต ลิงก์ (แก้ที่เดียว)
- `docs/` แผนงาน ความคืบหน้า คำถาม และคู่มือ deploy (`docs/DEPLOY.md`)

## ผู้จัดทำ

จัดทำโดย 673040127-5 นายพัชรวัฒน์ วิพัธครตระกูล · 673040128-3 นายพิสิษฐ์ ศรีชำนาจ · 673040136-4 นายเอกสิทธิ์ สุวรรณวงษ์ · 673040386-1 นายณัฐิวุฒิ แสงสารพันธ์

อาจารย์ผู้สอน: ผศ. ดร. จิระเดช พลสวัสดิ์
