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
- [ ] globals.css + ฟอนต์ + glass port
- [ ] SiteHeader / MobileNav / SiteFooter / หน้าแรกโครง / ChapterHeader / Toc / ChapterNav / Summary
- [ ] bits/* · player/*
- [ ] screenshot 390 + 1280 · REVIEW.md

## Phase 3 — บทที่ 1–2
## Phase 4 — บทที่ 3
## Phase 5 — บทที่ 4
## Phase 6 — บทที่ 5
## Milestone "พร้อมใช้สอน"
## Phase 7 — Lab + polish
## Phase 8 — พร้อม deploy
## Phase 9 — Review 3 รอบ
## Phase 10 — รายงานสุดท้าย

## บันทึกการตัดสินใจ / ต่างจากแผน
- Tailwind ใช้ `@tailwindcss/turbopack` แทน `@tailwindcss/postcss` (ค่าเริ่มต้นของ create-next-app 16.4.3)
- คูณ/หาร: ขั้น range อยู่ก่อน round ตาม flowchart ใน PLAN.md 8.2 (requirement เขียน round ก่อน range) — เหตุผลใน docs/ENGINE.md
- `parseDecimal` คืน `magnitude` + `negative` แยกกัน (แผนเขียน `value`) เพื่อเก็บ −0 ได้
