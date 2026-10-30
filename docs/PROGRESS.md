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
- [ ] format, bits, rational, parse, decode, round, encode
- [ ] add, mul, div, special
- [ ] fraction, integer, format-number
- [ ] examples.ts
- [ ] golden vectors · oracle · exhaustive MINI8 · encode random · round-trip · invariants · parse
- [ ] test:long 1M · coverage ≥ 95% · docs/ENGINE.md

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
