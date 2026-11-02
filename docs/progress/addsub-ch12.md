# ความคืบหน้า addsub-ch12

> อ่าน docs/PARALLEL.md ก่อน · งานของ branch นี้อยู่ในตาราง "ใครทำอะไร"

## งาน
- [x] ฉาก 1.1 บวกทีละหลัก (`IntAddScene`) · input A, B + สลับ 4/8 บิต + chip 3 อัน · กล่อง FA เลื่อนตามหลัก · ตัวทดออกตกกล่องเส้นประ
- [x] ฉาก 1.2 ลบด้วย ALU ตัวเดิม (`IntSubScene`) · chip 7 − 6, 3 − 5 · บิตของ B พลิกทีละบิต · +1 เข้าที่ CarryIn · ตัวทดออกจางหาย
- [x] ฉาก 1.3 วงล้อ overflow (`OverflowScene` + `stage/number-wheel.tsx`) · chip 8 กรณีของสไลด์ w03c หน้า 6–9 · หมุดเดินตามเข็ม/ทวนเข็ม เส้นทางสีแดงเมื่อข้ามรอยต่อ
- [x] ฉาก 1.4 เลื่อนบิต (`ShiftScene`) · slider 0–4 ไม่ใช่ StepPlayer (ตาม PLAN 3.2) · บิตไหลขวา 0 เติมซ้าย · บิตที่หลุดลงถาด บิต 1 สีชมพู (G/R/S) · แถว 104 → 52 → 26 → 13
- [x] ฉาก 2.1 โค้ด C (`CCodeScene` + `stage/code-card.tsx`) · โค้ดอยู่ใน `ui-ch12.ts` (`C_SOURCE`) สร้างจาก `C_CODE` · ผล printf จาก `buildCCodeFrames` (ใหม่ใน sci-frames.ts) · chip 0.1f + 0.2f พิมพ์ 0.300000012 สั่น + ลิงก์ไป #rounding · "ทำไม?" why.c.overflow อยู่ที่ขั้น int
- [x] ฉาก 2.2 จุดที่เลื่อนได้ (`PointScene`) · `buildPointScene` (ใหม่) ส่งตำแหน่งจุดของแต่ละเฟรม · chip ฐานสอง 110.1₂ มาจาก engine (`binaryOf`) · `buildPointFrames` เดิมยังอยู่และคืนค่าเหมือนเดิม
- [ ] Hero teaser
- [ ] e2e chapter1 / chapter2 / hero

## Screenshot (test-results/shots/)
- `ch1-add-390.png`, `ch1-add-1440.png` (หลัก 2 ของ 7 + 6) · `ch1-add-end-390.png`, `ch1-add-end-1440.png` (9 + 8 แบบ 4 บิต มีตัวทดออก)
- `ch1-wheel-range-*.png` · `ch1-wheel-end-*.png` (4 + 5 overflow) · `ch1-wheel-ok-*.png` (3 + (−2))
- `ch1-shift-104-*.png` (เลื่อน 3 ได้ 13) · `ch1-shift-13-*.png` (เลื่อน 1 ได้ 6 บิต 1 หลุด)
- `ch2-c-float-*.png` · `ch2-c-print-*.png` · `ch2-c-teaser-*.png` · `ch2-point-hop-*.png` · `ch2-point-bin-*.png`
- `ch1-sub-mid-*.png` (ขั้น CarryIn) · `ch1-sub-end-*.png` (ได้ 0001 = 1)

## แก้ไฟล์ร่วม
- (ไม่มี)

## คำถาม + ค่าที่สมมติ
- ไม่มี Context7 ใน session นี้ · ใช้ motion ตามแบบที่ใช้อยู่แล้วใน repo (`layoutId`, `initial/animate`, spring เดิม) ไม่ใช้ API ใหม่

- ฉาก 1.3 เปิดที่ chip `4 + 5` (กรณี overflow ของสไลด์ w03c หน้า 8) แทน chip แรก เพราะเป็นเรื่องหลักของฉาก

- unit test ใหม่ `tests/unit/lesson/ch12.test.ts` (ค่าตามภาคผนวก D)
- ไม่ใช้ `aria-label` บน span/div ธรรมดา (axe ห้าม) ใช้ข้อความ `sr-only` แทน

## สถานะ
- ยังไม่พร้อมรวม
