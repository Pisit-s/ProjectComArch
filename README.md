# comkrub

เว็บไซต์เพื่อการเรียนรู้และ Simulation วิชา Computer Architecture ทุกกระบวนการกดดูทีละขั้นได้เอง ย้อนกลับได้ และลองใส่ค่าของตัวเองได้

เว็บจริง: https://comkrub.mypisit.com

## หัวข้อ

| ลำดับ | หัวข้อ | path | อ้างอิง |
|---|---|---|---|
| 1 | การคูณแบบ MIPS | `/multiply` | Patterson & Hennessy หัวข้อ 3.3 |
| 2 | การหารแบบ MIPS | `/divide` | Patterson & Hennessy หัวข้อ 3.4 |
| 3 | Floating-Point (IEEE 754): 5 บท + Lab | `/floating-point` | Patterson & Hennessy หัวข้อ 3.5 |
| Sim | MIPS Simulator | `/mips` | MIPS Reference Data (Green Card) |

สถานะของแต่ละหัวข้อ (พร้อมเรียน / กำลังพัฒนา) อยู่ใน `src/content/topics.ts` ที่เดียว

- ทุกกระบวนการหลายขั้นดูได้ทีละขั้นด้วย StepPlayer (ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด/โหมดนำเสนอ)
- คำนวณทั้งหมดใน browser · Floating-Point ใช้ engine BigInt ที่ผลตรง IEEE 754 binary32 (round to nearest, ties to even) ทุกบิต
- static ทั้งเว็บ ไม่มี backend, database หรือ env
- ลิงก์เก่า `/learn/*` และ `/lab` redirect ไป `/floating-point/*` อัตโนมัติ

## รันในเครื่อง

ต้องมี Node.js 24 ขึ้นไป และ npm

```bash
npm install
npx playwright install chromium webkit   # ครั้งแรก ถ้าจะรัน e2e
npm run dev                              # http://localhost:3000
```

## คำสั่ง

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm start` | build และรันแบบ production |
| `npm run lint` · `npm run typecheck` | ตรวจโค้ด |
| `npm test` | unit test ทั้งหมด (engine Floating-Point, topic registry, หัวข้ออื่น ๆ) |
| `npm run test:long` | oracle ของ Floating-Point 1,008,000 กรณี |
| `npm run test:cov` | coverage |
| `npm run test:e2e` | Playwright (projects `pixel7`, `iphone13`, `desktop`) |
| `npm run shots -- <path> <out.png> [width] [height]` | ถ่าย screenshot (ต้องมี server ที่ `SHOT_BASE`, ค่าเริ่มต้น `http://localhost:3200`) |

## โครงสร้าง

- `src/app/` หน้าเว็บ: `/` (เลือกหัวข้อ), `/floating-point/*`, `/multiply`, `/divide`, `/mips`, `/dev/kit` (เฉพาะตอน dev)
- `src/content/topics.ts` รายชื่อหัวข้อและสถานะ (หน้าแรก เมนู footer sitemap อ่านจากที่นี่)
- `src/lib/fp/` engine Floating-Point (อธิบายใน `docs/ENGINE.md`) · หัวข้ออื่นมี `src/lib/<หัวข้อ>/` ของตัวเอง
- `src/components/` ธีมกระจก, บิต, StepPlayer, ภาพฮาร์ดแวร์ (`hw/`), การ์ดหัวข้อ (`topic/`), เครื่องมือ
- `src/content/glossary/` คำศัพท์แยกตามหัวข้อ
- `src/lib/site.ts` ชื่อเว็บ เครดิต ลิงก์ (แก้ที่เดียว)
- `docs/` แผนแต่ละ WP (`docs/plans/`), ความคืบหน้า (`docs/progress/`), คู่มือ deploy (`docs/DEPLOY.md`)

## ทีม

แผนงานระยะที่ 2 อยู่ใน `PLAN.md` · วิธีเริ่มงานของสมาชิกแต่ละคนอยู่ใน [`docs/TEAM.md`](docs/TEAM.md)

## ผู้จัดทำ

จัดทำโดย 673040127-5 นายพัชรวัฒน์ วิพัธครตระกูล · 673040128-3 นายพิสิษฐ์ ศรีชำนาจ · 673040136-4 นายเอกสิทธิ์ สุวรรณวงษ์ · 673040386-1 นายณัฐิวุฒิ แสงสารพันธ์

อาจารย์ผู้สอน: ผศ. ดร. จิระเดช พลสวัสดิ์
