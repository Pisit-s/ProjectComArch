# ความคืบหน้า comkrub (รอบบวก/ลบ หน้าเดียว)

> session ใหม่: อ่าน CLAUDE.md แล้วดูงานแรกที่ยังไม่ติ๊ก · branch `addsub-redesign` (upstream ตั้งเป็น `origin/addsub-redesign` เท่านั้น ห้าม push เข้า main)
> เอกสารรอบแรก (Binary Lab) อยู่ที่ `docs/history/stage1/`

## Phase 0 — เริ่มงานและยกเลิกแผนเดิม
- [x] branch `addsub-redesign` จาก `origin/main` · commit PLAN.md (`833a5ff`) · ยกเลิก upstream ที่ชี้ไป origin/main
- [x] CLAUDE.md ใหม่ (ภาคผนวก B)
- [x] 6.1 ลบแผน wp1–wp3 + golden · `EMIPS.pdf` untrack + gitignore
- [x] 6.3 ย้ายเอกสารรอบแรกไป `docs/history/stage1/` · สร้าง PROGRESS/QUESTIONS/REVIEW ใหม่ · comment ที่อ้าง PLAN.md ชี้ไป stage1
- [x] 6.4 `.gitignore` (Slide/, EMIPS.pdf) · `@source not '../../Slide'`
- [x] DoD: lint/typecheck/test (172) / build ผ่าน · git status สะอาด · Slide/ ไม่ถูก track

## Phase 1 — โมเดลและ frame adapters
- [ ] int/adder.ts + test
- [ ] sci/decimal.ts + test
- [ ] fp/format-c.ts + test
- [ ] lesson/* adapters + test (D.1, D.5)
- [ ] DoD: coverage ≥ 95% ไฟล์ใหม่ · engine algorithm ไม่เปลี่ยน

## Phase 2 — โครงหน้าเดียว ชื่อ comkrub ลบของเก่า
- [ ] เปลี่ยนชื่อ comkrub
- [ ] registry + content + test งบข้อความ
- [ ] page.tsx หน้าเดียว + LessonSection ฯลฯ + header/drawer/footer
- [ ] StepPlayer stage-first + SceneShell + stage/ + hw/ + /dev/kit
- [ ] ลบหน้าเก่า + redirect + sitemap
- [ ] ลบคูณ/หารจาก engine
- [ ] DoD: redirect e2e · screenshot 390/1440 · build static

## Phase 3 — บทที่ 5 (Milestone A)
## Phase 4 — บทที่ 6 วงจร
## Phase 5 — บทที่ 3 และ 4
## Phase 6 — Hero บทที่ 1 และ 2
## Phase 7 — ลองเอง และสรุป
## Phase 8 — ขัดเกลา review 4 รอบ และ PR

## บันทึกการตัดสินใจ / ต่างจากแผน
