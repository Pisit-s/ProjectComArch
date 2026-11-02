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
- [x] int/adder.ts + test (exhaustive 4/8 บิต + D.2)
- [x] sci/decimal.ts + test (D.3 + property)
- [x] fp/format-c.ts + test (D.4)
- [x] lesson adapters: keys, fp-frames, bit-window, round-line, window, circuit-map, int-frames, encode-frames (encode/decode/layout), sci-frames (point, C code, dec4), fun-fact + test (D.1, D.5, D.6, invariants)
- [x] DoD: test 239 ผ่าน · coverage src/lib/{fp,int,sci,lesson} 99.2% statements / 97.7% branches · engine algorithm ไม่เปลี่ยน · build ผ่าน

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
- adapter เพิ่มจากแผน: `sci-frames.ts` (ฉาก 2.1, 2.2, 5.1) และ `fun-fact.ts` (ฉาก 5.5) · `keys.ts` เป็นรายการ caption key ที่ adapter ส่งออก (test ตรวจว่ามีข้อความครบใน Phase 2)
- `decimalAdd` ไม่มีกรณีปัดแล้วทด (หลัง normalize ผลต่ำกว่า 2.000 เสมอ) จึงไม่มี field `carry`
