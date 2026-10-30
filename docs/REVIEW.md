# Review notes

## Phase 2 — design system + StepPlayer (30 ต.ค. 2569)
- หน้าแรก 390px: กระจกขาวบนพื้นฟ้า-ขาว + grid blueprint ให้ความรู้สึกเดียวกับ coekku.shop · header แคปซูล + ปุ่มเมนู drawer · footer เครดิตครบ 4 คน + อาจารย์ (รหัสใช้ mono)
- StepPlayer 390px: flowchart ย่อเป็นแถบแนวนอน, steps indicator เลื่อนแนวนอน, register 32 บิตแบ่ง 2 แถว (S+Exponent / Fraction) ตอนแรก Fraction ล้นเป็น 2 บรรทัด → แก้เป็น grid 23 คอลัมน์พอดีความกว้าง
- StepPlayer 1280px: flowchart อยู่ด้านซ้าย กล่องปัจจุบันเป็นสีน้ำเงิน + BeamRing · partial products เรียงตรงจุดทศนิยม · แถวแรกเคยแสดง `00.011010` → เปลี่ยนเป็นเว้นวรรคแทนเลข 0 นำหน้า
- ข้อสังเกต: แถบควบคุมเป็น sticky bottom จึงลอยตามตอนเลื่อนผ่าน player (ตั้งใจ ให้กดถัดไปได้ตลอด)

## Phase 3 — บทที่ 1–2
- Integer Explorer 390px: บิต 8 ตัวแบ่ง 4+4 แถว ปุ่ม 44px ขึ้นไป (จอ ≥ 420px เป็นแถวเดียว) · ค่าฐานสิบใหญ่ อ่านง่าย
- Fraction Converter: ช่องบิตเติมทีละช่องตามขั้น · ผลแสดงวงซ้ำด้วยเส้นด้านบนสีชมพู
- ข้อสังเกต (ไว้ดูรอบ 2): แถบควบคุมของ StepPlayer เป็น sticky bottom ตอน player เพิ่งโผล่จากขอบล่างจอ แถบจะทับตัวบอกขั้น/ชื่อขั้นชั่วครู่
