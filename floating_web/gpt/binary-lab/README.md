# Binary Lab — Interactive Floating-Point Learning Website

เว็บไซต์สื่อการสอนภาษาไทยสำหรับวิชา Computer Architecture สร้างด้วย HTML5, CSS3 และ Vanilla JavaScript เท่านั้น ไม่มี Backend, Framework, npm หรือขั้นตอน Build

## วิธีเปิดใช้งาน

1. แตกไฟล์ ZIP
2. เปิดโฟลเดอร์ `binary-lab`
3. ดับเบิลคลิก `index.html` เพื่อเปิดในเว็บเบราว์เซอร์รุ่นใหม่ (Chrome, Firefox, Edge)
4. หากต้องการใช้ local server เพื่อความสะดวก สามารถใช้ VS Code Live Server ได้ แต่ไม่ใช่ข้อบังคับ

## โครงสร้างไฟล์

```text
binary-lab/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    └── app.js
```

## ฟังก์ชันที่มี

- **ภาพรวม:** เส้นทางการเรียน 4 บทและลิงก์ไปยังเครื่องมือทดลอง
- **บทที่ 1:** ระบบเลขฐานสิบ/ฐานสอง, Unsigned 8-bit Integer Explorer, บิต 8 บิตที่คลิกเปลี่ยนค่าได้, Contribution แบบ Real-time, presets 0, 10, 128, 255
- **บทที่ 2:** แนวคิดเศษส่วนฐานสอง, 16-bit Fraction Explorer, Decimal Fraction Converter ที่แสดงตารางคูณ 2, จำนวนบิตที่เลือกได้ 8/16/23/32, ค่าโดยประมาณและ Absolute Error
- **บทที่ 3:** IEEE 754 Binary32 Encoder/Decoder, แสดง Sign/Exponent/Fraction แยกสีพร้อม Label, bit string 32 บิต, Hex, ขั้นตอนและค่าที่จัดเก็บจริง, คัดลอก bit string/Hex, ตรวจ input decoder
- **บทที่ 4:** Float32 Arithmetic Simulator สำหรับบวก/ลบ, ปัด Operand เป็น Float32 ก่อนคำนวณ, แสดง bit pattern, exponent alignment, significand, rounding และผลลัพธ์ Binary/Hex
- Responsive layout, keyboard focus, `aria-live`, error messages, `prefers-reduced-motion`

## วิธีทดสอบกรณีหลัก

### บทที่ 1
คลิก presets แล้วตรวจว่า 0 → `00000000`, 10 → `00001010`, 128 → `10000000`, 255 → `11111111` และค่าฐานสิบตรงกัน

### บทที่ 2
- ตั้ง Explorer เป็น `0.375` จะได้บิตเริ่มต้น `0110000000000000` และค่าประมาณ 0.375
- ตั้ง Converter เป็น `0.375`, 8 บิต จะได้ `0.011₂` และ Error 0
- ตั้ง Converter เป็น `0.625` จะได้ `0.101₂` และ Error 0
- ตั้ง Converter เป็น `0.1`, 23 บิต จะเห็นว่ามีเศษเหลือและ Error ไม่เป็นศูนย์

### บทที่ 3
- Encode `5.75`: Hex `0x40B80000`, bits `01000000101110000000000000000000`
- Encode `-13.25`: Hex `0xC1540000`, bits `11000001010101000000000000000000`
- Encode `0.1`: ค่า Float32 ที่จัดเก็บจริงแสดงแยกจากค่าที่ป้อน
- Decoder: ลอง `01000000101110000000000000000000` ได้ 5.75; ลองข้อมูลที่ไม่ครบ 32 บิตจะขึ้น error

### บทที่ 4
ใช้ A=`0.1`, Operation `+`, B=`0.2`; ผลลัพธ์ Float32 ควรเป็น `0.30000001192092896` และมี Hex/Bit String ที่ตรงกับค่าจริง ใช้ operation `−` เพื่อทดลองการลบ

## ขอบเขตและข้อจำกัด

- เครื่องมือหลักเน้น finite Float32 และค่าปกติ (Normalized) ในการอธิบายขั้นตอน Encoding/Arithmetic
- Decoder อ่าน bit pattern 32 บิตได้ รวมถึง Subnormal, Signed Zero, Infinity และ NaN และระบุประเภทค่าพิเศษ แต่ไม่ได้ไล่รายละเอียด IEEE 754 ทุกกรณี
- Arithmetic simulator แจ้งข้อจำกัดเมื่อ Operand เป็นศูนย์, Subnormal, Infinity หรือ NaN เพราะการอธิบายขั้นตอน Significand ในเวอร์ชันนี้เน้นค่าปกติที่ไม่เป็นศูนย์
- ขั้นตอน Normalize/Rounding ใน Arithmetic เป็นแบบจำลองเพื่อการเรียนรู้ โดยผล Float32 สุดท้ายคำนวณจาก Operand ที่ถูกปัดเป็น Float32 ก่อนแล้ว และสร้าง bit pattern จริงด้วย `DataView`
- การปัดค่าทศนิยมอินพุตใน JavaScript เริ่มจากชนิด Number ซึ่งเป็น binary64; เครื่องมือนี้ใช้ `DataView`/`Math.fround()` ในการแปลง Float32 และแยกค่าที่ป้อนกับค่าที่จัดเก็บจริงให้เห็น
- ไม่มีบัญชีผู้ใช้ การบันทึกความคืบหน้า แบบทดสอบ หรือ Backend ตามขอบเขตเวอร์ชันแรก
