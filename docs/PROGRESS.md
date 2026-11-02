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
- [x] เปลี่ยนชื่อ comkrub
- [x] registry + content + test งบข้อความ
- [x] page.tsx หน้าเดียว + LessonSection ฯลฯ + header/drawer/footer
- [x] StepPlayer stage-first + SceneShell + stage/ + hw/ + /dev/kit
- [x] ลบหน้าเก่า + redirect + sitemap
- [x] ลบคูณ/หารจาก engine (test:long 1,008,000 กรณี ผ่าน)
- [x] DoD: redirect e2e (42 ผ่าน 3 อุปกรณ์) · screenshot 390/1440 ของ `/` และ `/dev/kit` ดูแล้ว · build static

## Phase 3 — บทที่ 5 (Milestone A)
- [x] ฉาก 5.1 ฐานสิบ 4 หลัก (`Dec4Scene`)
- [x] ฉาก 5.2 บวก / 5.3 ลบ (`FpOpScene` ใช้ร่วมกับ playground) · BitTrack compact/tail/full · MiniAlu ตอนลบ
- [x] ฉาก 5.4 ปัดเศษ (`rounding-frames.ts` + RoundLine + ตารางกติกา + เทียบค่าที่พิมพ์)
- [x] ฉาก 5.5 ตัวอย่างในสไลด์ (double)
- [x] DoD: e2e บทที่ 5 + player + reduced motion ผ่าน 3 อุปกรณ์ · screenshot align/normalize/round ที่ 390/1440/1920 ดูแล้ว · งบข้อความผ่าน
## Phase 4 — บทที่ 6 วงจร
## Phase 5 — บทที่ 3 และ 4
## Phase 6 — Hero บทที่ 1 และ 2
## Phase 7 — ลองเอง และสรุป
## Phase 8 — ขัดเกลา review 4 รอบ และ PR

## บันทึกการตัดสินใจ / ต่างจากแผน
- adapter เพิ่มจากแผน: `sci-frames.ts` (ฉาก 2.1, 2.2, 5.1) และ `fun-fact.ts` (ฉาก 5.5) · `keys.ts` เป็นรายการ caption key ที่ adapter ส่งออก (test ตรวจว่ามีข้อความครบใน Phase 2)
- `decimalAdd` ไม่มีกรณีปัดแล้วทด (หลัง normalize ผลต่ำกว่า 2.000 เสมอ) จึงไม่มี field `carry`
- `/lab` redirect ไป `/` (ไม่ใส่ `#playground` ในปลายทาง กัน URL ผิดรูป) query ส่งต่อเอง playground อ่าน query แล้วเลื่อนไปเอง (Phase 7)
- `url-state.ts` เหลือ `PlayState { op, a, b, step }` ค่า default ส่งเข้ามาจาก content · `parsePlayQuery` บอก `present` ว่ามี query ไหม
- `TrackRow.shifted` นับการเลื่อนของแถวผลด้วย (normalize และตัวทดตอนปัด) ให้บิตแต่ละตัวมี key เดิมตอนเลื่อน
- ชิ้นส่วน `NumberWheel`, `TimesTwo`, `CodeCard`, `ExponentWindow` ทำพร้อมบทที่ใช้ (Phase 5-6) · `player.spec` เขียนใน Phase 3 เมื่อมี scene จริงบนหน้า
- test `no-thai-in-components` ย้ายข้อความของ register (คำอธิบายบิต) และ error boundary ไป `copy.ts`
- `wp0-hub` ของเพื่อนทำตามแผนระยะที่ 2 ที่ยกเลิกแล้ว ไม่ merge (Q11) ยกมาแค่ CI และ BlurFade reduced motion
- StepPlayer: Esc ออกจากโหมดนำเสนอได้แม้โฟกัสอยู่ใน player (เดิมพึ่ง fullscreen ของเบราว์เซอร์ ใช้ไม่ได้บน iOS)
