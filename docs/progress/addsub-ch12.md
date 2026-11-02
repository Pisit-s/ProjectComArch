# ความคืบหน้า addsub-ch12

> อ่าน docs/PARALLEL.md ก่อน · งานของ branch นี้อยู่ในตาราง "ใครทำอะไร"

## งาน
- [x] ฉาก 1.1 บวกทีละหลัก (`IntAddScene`) · input A, B + สลับ 4/8 บิต + chip 3 อัน · กล่อง FA เลื่อนตามหลัก · ตัวทดออกตกกล่องเส้นประ
- [x] ฉาก 1.2 ลบด้วย ALU ตัวเดิม (`IntSubScene`) · chip 7 − 6, 3 − 5 · บิตของ B พลิกทีละบิต · +1 เข้าที่ CarryIn · ตัวทดออกจางหาย
- [x] ฉาก 1.3 วงล้อ overflow (`OverflowScene` + `stage/number-wheel.tsx`) · chip 8 กรณีของสไลด์ w03c หน้า 6–9 · หมุดเดินตามเข็ม/ทวนเข็ม เส้นทางสีแดงเมื่อข้ามรอยต่อ
- [ ] ฉาก 1.4 เลื่อนบิต
- [ ] ฉาก 2.1 โค้ด C
- [ ] ฉาก 2.2 จุดที่เลื่อนได้
- [ ] Hero teaser
- [ ] e2e chapter1 / chapter2 / hero

## Screenshot (test-results/shots/)
- `ch1-add-390.png`, `ch1-add-1440.png` (หลัก 2 ของ 7 + 6) · `ch1-add-end-390.png`, `ch1-add-end-1440.png` (9 + 8 แบบ 4 บิต มีตัวทดออก)
- `ch1-wheel-range-*.png` · `ch1-wheel-end-*.png` (4 + 5 overflow) · `ch1-wheel-ok-*.png` (3 + (−2))
- `ch1-sub-mid-*.png` (ขั้น CarryIn) · `ch1-sub-end-*.png` (ได้ 0001 = 1)

## แก้ไฟล์ร่วม
- (ไม่มี)

## คำถาม + ค่าที่สมมติ
- ไม่มี Context7 ใน session นี้ · ใช้ motion ตามแบบที่ใช้อยู่แล้วใน repo (`layoutId`, `initial/animate`, spring เดิม) ไม่ใช้ API ใหม่

- ฉาก 1.3 เปิดที่ chip `4 + 5` (กรณี overflow ของสไลด์ w03c หน้า 8) แทน chip แรก เพราะเป็นเรื่องหลักของฉาก

## สถานะ
- ยังไม่พร้อมรวม
