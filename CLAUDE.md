# comkrub: กติกาถาวรสำหรับ Claude Code
@AGENTS.md

- เว็บไซต์เพื่อการเรียนรู้และ Simulation วิชา Computer Architecture: หน้าแรกเลือกหัวข้อ · การคูณแบบ MIPS (/multiply) · การหารแบบ MIPS (/divide) · Floating-Point (/floating-point เสร็จแล้ว) · MIPS Simulator (/mips)
- แผน: PLAN.md (ภาพรวม กติกา ทีม WP-0) · spec: docs/plans/wp1-mips-sim.md, wp2-multiply.md, wp3-divide.md · แผนระยะ 1 (Floating-Point): docs/plans/stage1-floating-point.md · golden: docs/plans/golden/ · อ่านเฉพาะหัวข้อที่เกี่ยวกับงานก่อนเริ่มทุกครั้ง
- ดูชื่อ branch ก่อนว่ากำลังทำ WP ไหน (wp0-hub, wp1-mips-sim, wp2-multiply, wp3-divide) แล้วแก้เฉพาะไฟล์ของ WP นั้น (PLAN.md 3.3) · ความคืบหน้าและคำถามของ WP อยู่ที่ docs/progress/<wp>.md
- ทำงานแบบ autonomous: ห้ามใช้ AskUserQuestion ห้ามหยุดถาม → จดคำถาม + ค่าที่สมมติในไฟล์ progress แล้วทำต่อ
- ก่อนใช้ library ให้ query Context7 ก่อนเสมอ (ID ใน PLAN.md 4.5) · ใช้ version ล่าสุดแบบ stable ยกเว้น typescript ~6.0.x, eslint ^9, @types/node ^24 (PLAN.md 5) · dependency ใหม่เพิ่มได้เฉพาะ WP-1
- อาจารย์ให้คะแนนจากการอธิบายได้: ทุกกระบวนการหลายขั้นใช้ StepPlayer และมีคำอธิบาย "ทำอะไร/ทำไม" ทุกขั้น · ท้ายหัวข้อมี สรุป + ประเด็นสำหรับอธิบาย + คำถามชวนคิด (PLAN.md 1)
- ตัวเลข บิต hex ในเนื้อหาต้อง render จาก engine หรือโมเดลของหัวข้อนั้น ห้ามพิมพ์เอง · engine ต้องผ่าน golden ใน docs/plans/golden/ (test อ่านไฟล์ golden โดยตรง)
- ธีม Liquid Glass ฟ้า-ขาว (stage1 9) · สีตาม PLAN.md 6.1 ทั้งเว็บ · ใช้ component ร่วมใน PLAN.md 6.2 ห้ามสร้างซ้ำ · mobile-first สว่างอย่างเดียว
- ห้ามแก้/สร้าง/ลบไฟล์ใน /Users/pisit/Documents/Development/CoE-Shop · ห้ามแก้ requirement 2 ไฟล์เดิมของเพื่อน · ห้ามคัดลอกรูป ตาราง หรือข้อความจากตำราหรือ EMIPS.pdf (ใช้เป็นข้อมูลอ้างอิงได้ วาดและเขียนเอง) · ห้ามเอา EMIPS.pdf ไปไว้ใน public/
- ชื่อเว็บ comkrub · ข้อมูลเว็บและเครดิตผู้จัดทำอยู่ใน src/lib/site.ts (พิมพ์ชื่อไทยตามนั้นทุกตัวอักษร)
- ห้าม emoji ทุกที่ ใช้ lucide-react · ภาษาไทยเป็นธรรมชาติ ใช้ศัพท์ตาม glossary
- git: ทำงานบน branch ของ WP เท่านั้น ห้าม commit/push เข้า main ตรง · ห้าม push --force, reset --hard และ rebase branch ที่ push แล้ว · อัปเดตจาก main ด้วย git merge origin/main · จบ WP เปิด PR ให้ Pisit merge · ห้าม deploy เอง
- ก่อน commit: lint + typecheck + test ผ่าน · งาน UI ต้องเปิดดู screenshot มือถือ 390px เอง · จบ phase: build ผ่านและทุก route static · จบ WP: e2e ผ่าน + review 3 รอบ (PLAN.md 11)
- ประหยัด token: Vitest dot, Playwright line, log ดูแค่ tail/grep, แผนอ่านเฉพาะหัวข้อที่ใช้ (PLAN.md 4.8)
