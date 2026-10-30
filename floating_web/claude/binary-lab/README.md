# Binary Lab

เว็บสื่อการสอนภาษาไทยเรื่องเลขฐานสองและ Floating-Point (IEEE 754) — HTML5 + CSS3 + Vanilla JavaScript ไม่มี Framework/Build/Backend

## วิธีเปิดใช้งาน
ดับเบิลคลิก `index.html` เปิดด้วยเบราว์เซอร์ได้ทันที (ไม่ต้อง `npm install`) หรือจะใช้ Live Server ก็ได้ (ทางเลือก)

## โครงสร้างไฟล์
- `index.html` — ทุกหน้า (Home, บทที่ 1–4, Lab) แบบ Single-page ใช้ hash เช่น `#ch3`
- `css/style.css` — ธีม Dark, CSS variables ใน `:root`, Responsive, `prefers-reduced-motion`
- `js/core.js` — ตรรกะคำนวณล้วน (ไม่แตะ DOM): Float32 ด้วย `DataView`, encode/decode, แปลงเศษส่วนด้วย BigInt, จำลองบวก/ลบ (Guard/Round/Sticky)
- `js/main.js` — Router และ UI ของเครื่องมือ

## ทดสอบหลัก
`5.75 → 0x40B80000`, `-13.25 → 0xC1540000`, `0.1 + 0.2 → 0.30000001192092896 (0x3E99999A)`, `0.375 → 0.011₂`, `0.1` (16 บิต) แสดงค่าประมาณและ Error

## ข้อจำกัด
- รองรับเฉพาะ Float32 แบบ Normalized และค่า 0; ไม่รองรับ Subnormal, Infinity, NaN, Double Precision (แจ้งเตือนเมื่อป้อนค่าเหล่านี้)
- ตัวแปลงเศษส่วนบทที่ 2 ตัดบิตทิ้ง (Truncate) ส่วน Float32 ใช้ Round to Nearest, Ties to Even
- ขั้นตอนบวก/ลบเป็นแบบจำลองเพื่อการเรียนรู้ ผลถูกเทียบกับ `Math.fround` ทุกครั้ง (สุ่มทดสอบ 4 แสนกรณี ตรงทั้งหมด)
