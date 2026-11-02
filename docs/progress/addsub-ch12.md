# ความคืบหน้า addsub-ch12

> อ่าน docs/PARALLEL.md ก่อน · งานของ branch นี้อยู่ในตาราง "ใครทำอะไร"

## งาน
- [x] ฉาก 1.1 บวกทีละหลัก (`IntAddScene`) · input A, B + สลับ 4/8 บิต + chip 3 อัน · กล่อง FA เลื่อนตามหลัก · ตัวทดออกตกกล่องเส้นประ
- [x] ฉาก 1.2 ลบด้วย ALU ตัวเดิม (`IntSubScene`) · chip 7 − 6, 3 − 5 · บิตของ B พลิกทีละบิต · +1 เข้าที่ CarryIn · ตัวทดออกจางหาย
- [x] ฉาก 1.3 วงล้อ overflow (`OverflowScene` + `stage/number-wheel.tsx`) · chip 8 กรณีของสไลด์ w03c หน้า 6–9 · หมุดเดินตามเข็ม/ทวนเข็ม เส้นทางสีแดงเมื่อข้ามรอยต่อ
- [x] ฉาก 1.4 เลื่อนบิต (`ShiftScene`) · slider 0–4 ไม่ใช่ StepPlayer (ตาม PLAN 3.2) · บิตไหลขวา 0 เติมซ้าย · บิตที่หลุดลงถาด บิต 1 สีชมพู (G/R/S) · แถว 104 → 52 → 26 → 13
- [x] ฉาก 2.1 โค้ด C (`CCodeScene` + `stage/code-card.tsx`) · โค้ดอยู่ใน `ui-ch12.ts` (`C_SOURCE`) สร้างจาก `C_CODE` · ผล printf จาก `buildCCodeFrames` (ใหม่ใน sci-frames.ts) · chip 0.1f + 0.2f พิมพ์ 0.300000012 สั่น + ลิงก์ไป #rounding · "ทำไม?" why.c.overflow อยู่ที่ขั้น int
- [x] ฉาก 2.2 จุดที่เลื่อนได้ (`PointScene`) · `buildPointScene` (ใหม่) ส่งตำแหน่งจุดของแต่ละเฟรม · chip ฐานสอง 110.1₂ มาจาก engine (`binaryOf`) · `buildPointFrames` เดิมยังอยู่และคืนค่าเหมือนเดิม
- [x] Hero teaser (`HeroTeaser`) · 6.5 + 3.75 = 10.25 → แถบ 32 บิตสีตามส่วน + hex จาก `buildHeroTeaser` (ใหม่ใน sci-frames.ts) · StepPlayer `autoPlay` เล่นครั้งเดียว · reduced motion แสดงขั้นสุดท้ายทันทีและไม่เล่น · caption 3 ขั้นอยู่ใน `HERO.steps` (copy.ts) · CLS ที่ 390 = 0.00006
- [x] e2e `chapter1.spec.ts` (5), `chapter2.spec.ts` (2), `hero.spec.ts` (3)

## Screenshot (test-results/shots/)
- `ch1-add-390.png`, `ch1-add-1440.png` (หลัก 2 ของ 7 + 6) · `ch1-add-end-390.png`, `ch1-add-end-1440.png` (9 + 8 แบบ 4 บิต มีตัวทดออก)
- `ch1-wheel-range-*.png` · `ch1-wheel-end-*.png` (4 + 5 overflow) · `ch1-wheel-ok-*.png` (3 + (−2))
- `ch1-shift-104-*.png` (เลื่อน 3 ได้ 13) · `ch1-shift-13-*.png` (เลื่อน 1 ได้ 6 บิต 1 หลุด)
- `ch2-c-float-*.png` · `ch2-c-print-*.png` · `ch2-c-teaser-*.png` · `ch2-point-hop-*.png` · `ch2-point-bin-*.png`
- `hero-step0-*.png` · `hero-end-*.png` · `hero-reduced-*.png` (เต็มหน้า ส่วนบน)
- `ch1-sub-mid-*.png` (ขั้น CarryIn) · `ch1-sub-end-*.png` (ได้ 0001 = 1)

## แก้ไฟล์ร่วม
- `src/components/lesson/hero.tsx`: `SceneShell id="hero-teaser"` minHeight `16rem` → `22rem` (เปลี่ยนค่าเดียว) · teaser จริงสูง 352px บนจอ 390 (แถบควบคุมขึ้น 2 แถว) ถ้าจองไว้ 16rem หน้าจะกระโดดตอน scene โหลด (CLS) · desktop สูง 320px จึงเหลือที่ว่าง 32px ใต้ teaser
- `src/content/lesson/copy.ts`: เพิ่ม `HERO.steps` (แถวของ hero ตาม PARALLEL.md)
- `src/components/player/step-player.tsx`: ปุ่ม "ทำไม?" สีตัวอักษร `text-primary` → `text-bit-frac-ink` (#1d4ed8) เปลี่ยน class เดียว · axe จับ color-contrast บนมือถือ (#2563eb บนพื้น primary/10 ทับพื้นหลังไล่สี ต่ำกว่า 4.5:1) · ฉาก 2.1 มี "ทำไม?" ตั้งแต่ขั้นแรกจึงเห็นตอน a11y สแกน แต่ปุ่มเดียวกันในบทที่ 5 ก็โดนเหมือนกัน

## คำถาม + ค่าที่สมมติ
- ไม่มี Context7 ใน session นี้ · ใช้ motion ตามแบบที่ใช้อยู่แล้วใน repo (`layoutId`, `initial/animate`, spring เดิม) ไม่ใช้ API ใหม่

- ฉาก 1.3 เปิดที่ chip `4 + 5` (กรณี overflow ของสไลด์ w03c หน้า 8) แทน chip แรก เพราะเป็นเรื่องหลักของฉาก

- unit test ใหม่ `tests/unit/lesson/ch12.test.ts` (ค่าตามภาคผนวก D)
- ไม่ใช้ `aria-label` บน span/div ธรรมดา (axe ห้าม) ใช้ข้อความ `sr-only` แทน

- **ฝาก Pisit**: `a11y.spec.ts` บน desktop เคย fail แบบสุ่ม 1 ใน ~5 รอบ ที่ลิงก์ "7 ลองเอง" ของ `layout/progress-nav.tsx` · สาเหตุน่าจะเป็น scrollspy ทำให้ลิงก์ active ตอน test เลื่อนผ่านบทที่ 7 แล้ว `transition-colors` ยังเปลี่ยนสีไม่เสร็จตอน axe สแกน (สแกน contrast แยก 6 รอบผ่านหมด, `--repeat-each=4` ผ่าน 12/12) · ไม่ได้แก้เพราะเป็นไฟล์ร่วม · ทางแก้ที่เสนอ: test รอให้ scrollspy นิ่งก่อนสแกน หรือเอา `transition-colors` ออกจากลิงก์ nav

## ผล test (2 พ.ย. 2569, production build)
- `npm run lint`, `npm run typecheck`, `npm test` (197 tests) ผ่าน · `npm run build` ผ่าน ทุก route static
- e2e chapter1 + chapter2 + hero + a11y + lesson บน pixel7, iphone13, desktop: 57 ผ่าน, 2 skipped (ตามที่ spec กำหนด), 1 fail คือ a11y desktop แบบสุ่มด้านบน · รัน a11y ซ้ำ 4 รอบต่อเครื่อง ผ่าน 12/12
- งบข้อความ: บทที่ 1 = 487/600, บทที่ 2 = 482/600

## สถานะ
- **พร้อมรวม**
