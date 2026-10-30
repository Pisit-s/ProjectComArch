พร้อม deploy แล้ว (Milestone "พร้อมใช้สอน" ผ่านเมื่อ 30 ต.ค. 2569 · วิธี deploy: docs/DEPLOY.md)

# ความคืบหน้า Binary Lab

> session ใหม่: อ่าน CLAUDE.md แล้วดูงานแรกที่ยังไม่ติ๊กด้านล่าง

## Phase 0 — Setup และกติกา
- [x] อ่าน PLAN.md + requirement 4 ไฟล์
- [x] ตรวจเครื่อง: Node 26.11.1, npm 11.20.0, gh login `Pisit-s`
- [x] commit การลบ `floating_web/` (`9bbaac5`) · untrack `.DS_Store` + `.gitignore` · commit plan/requirement/reference (`aea38ff`)
- [x] scaffold create-next-app 16.4.3 ใน scratchpad แล้ว copy เข้ามา (ใช้ `@tailwindcss/turbopack` ตาม scaffold — ดู STACK.md)
- [x] ติดตั้ง dependency ตามหัวข้อ 5 · config Prettier, Vitest, ESLint, tsconfig (ES2022, exclude docs)
- [x] CLAUDE.md, docs/PROGRESS.md, docs/QUESTIONS.md, docs/STACK.md
- [x] Playwright config + browsers · push

## Phase 1 — Engine
- [x] format, bits, rational, parse, decode, round, encode
- [x] add, mul, div, special, simulate
- [x] fraction, integer, format-number
- [x] src/content/examples.ts (input ของตัวอย่างทั้งหมด · decode ใช้ทศนิยมต้นทางแทน hex)
- [x] golden vectors 91 test ผ่าน · oracle 480k ผ่าน · exhaustive MINI8 262k ผ่าน · encode random · round-trip · invariants · parse
- [x] test:long 1,008,000 ผ่าน (6.5 s) · coverage 98.9% · docs/ENGINE.md

## Phase 2 — Design system + StepPlayer
- [x] globals.css + ฟอนต์ + glass port
- [x] SiteHeader / MobileNav / SiteFooter / หน้าแรกโครง / ChapterLayout (header, Toc, Section, Summary, ChapterNav)
- [x] bits/* (BitCell, Register + BitInfo, FieldLegend) · player/* (StepPlayer, Flowchart, usePlayer, speed context)
- [x] viz/* ครบทุก step kind (StepView) + FpSimulator + ResultCompare (ใช้ชั่วคราวใน /lab)
- [x] screenshot 390 + 1280 · REVIEW.md · e2e player 4 ข้อผ่าน (pixel7)

## Phase 3 — บทที่ 1–2
- [x] บทที่ 1: เนื้อหา + PlaceValue + ตัวอย่าง 1011 + IntegerExplorer + สรุป
- [x] บทที่ 2: เนื้อหา + FractionExplorer + NumberLine + FractionConverter + สรุป
- [x] e2e ข้อ 2–3 ผ่าน (pixel7) · screenshot 390 ดูแล้ว
## Phase 4 — บทที่ 3
- [x] เนื้อหา + WorkedExample (render จาก engine) + IEEE 754 Converter (encode/decode tabs) + สรุป
- [x] e2e ข้อ 4 ผ่าน (pixel7 + iphone13) · e2e ทั้งหมด 7 ข้อผ่านบน WebKit
## Phase 5 — บทที่ 4
- [x] เนื้อหา + FpSimulator (+/−) + ตัวอย่าง A1–A6 (OpWorked render จาก engine) + สรุป
- [x] e2e ข้อ 5 ผ่าน (pixel7 + iphone13)
## Phase 6 — บทที่ 5
- [x] เนื้อหา + FpSimulator (×/÷ + ค่าพิเศษ) + M1–M6, D1–D5 + M3/D3 ละเอียด (OpDetail) + ตารางกรณีพิเศษ + สรุป
- [x] e2e ข้อ 6 ผ่าน (pixel7 + iphone13)
## Milestone "พร้อมใช้สอน"
- [x] acceptance criteria ของ requirement 4 ไฟล์ครบ (ตรวจละเอียดอีกครั้งในรอบ review 3)
- [x] e2e 36 ข้อผ่านบน pixel7 + iphone13 กับ production build (นำทาง, บท 1–5, player, reduced motion, ไม่มี console error, axe ไม่มี serious/critical ทุกหน้า)
- [x] build ผ่าน ทุก route static · README + docs/DEPLOY.md
- หมายเหตุ: e2e ข้อ 7 (share link ของ Lab) อยู่ใน Phase 7 ตามแผน · หน้าแรกยังเป็นแบบโครง (ฉบับเต็มใน Phase 7)
## Phase 7 — Lab + polish
- [x] /lab: tabs Calculator / Converter + share link (query string, `src/lib/url-state.ts` + unit test) + Suspense
- [x] หน้าแรกฉบับเต็ม (demo สด 0.1 + 0.2 เล่นเอง หยุดเมื่อแตะ/hover/โฟกัส, timeline, ทางลัด + BeamRing)
- [x] icon, OG image (ไทยแสดงถูก), sitemap, robots, 404, error
- [x] Lighthouse ผ่านเป้าทั้ง 3 หน้า (REVIEW.md) · e2e ข้อ 7–10 ผ่าน · e2e รวม 65 ข้อผ่านบน pixel7 + iphone13 + desktop
- [x] stretch: print stylesheet
- [ ] stretch ที่ยังไม่ทำ: binary16/64 ใน Lab (Q7) · โหมดนำเสนอ (Q8) — engine รองรับ format อื่นแล้ว แต่ UI ยังผูกกับ 32 บิตหลายจุด จึงเลือกใช้เวลากับ review 3 รอบก่อน
## Phase 8 — พร้อม deploy
- [x] build + start production ผ่าน · ไม่มี secret · security headers ครบ (ไม่มี X-Frame-Options ตามแผน) · DEPLOY.md + README ตรงงานล่าสุด
## Phase 9 — Review 3 รอบ
- [x] รอบ 1 ใช้งานจริง · [x] รอบ 2 ความสวย/interface · [x] รอบ 3 ความถูกต้อง (รายละเอียดใน docs/REVIEW.md)
- [ ] ไล่อ่านเนื้อหาทุกบทเทียบ requirement แบบละเอียดอีกครั้ง
## Phase 10 — รายงานสุดท้าย
- [ ] docs/FINAL_REPORT.md: สรุปตาม phase, ตาราง acceptance criteria ครบ 4 ไฟล์, ผล test/coverage/Lighthouse, path screenshot, คำถามทั้งหมดเรียงตามความสำคัญ
- หยุดพักตามที่ Pisit ขอ (30 ต.ค. 2569) — ทำต่อจากข้อนี้

## บันทึกการตัดสินใจ / ต่างจากแผน
- Tailwind ใช้ `@tailwindcss/turbopack` แทน `@tailwindcss/postcss` (ค่าเริ่มต้นของ create-next-app 16.4.3)
- คูณ/หาร: ขั้น range อยู่ก่อน round ตาม flowchart ใน PLAN.md 8.2 (requirement เขียน round ก่อน range) — เหตุผลใน docs/ENGINE.md
- `parseDecimal` คืน `magnitude` + `negative` แยกกัน (แผนเขียน `value`) เพื่อเก็บ −0 ได้
