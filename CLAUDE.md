# Binary Lab — กติกาถาวรสำหรับ Claude Code
@AGENTS.md

- เว็บสื่อการสอน Floating-Point (IEEE 754 binary32) วิชา Computer Architecture: 5 บท + Lab · แผนเต็ม: PLAN.md (เปิดอ่านหัวข้อที่เกี่ยวข้องก่อนเริ่มทุกงาน) · requirement: floating_website_requirement/ (4 ไฟล์) · ความคืบหน้า: docs/PROGRESS.md · คำถาม: docs/QUESTIONS.md · version: docs/STACK.md
- ทำงานแบบ autonomous: ห้ามใช้ AskUserQuestion และห้ามหยุดถาม → จดคำถาม + ค่าที่สมมติใน QUESTIONS.md แล้วทำต่อ
- ก่อนใช้ library ใดให้ query Context7 ก่อนเสมอ (daisyUI 5: /websites/daisyui · Next.js 16: /vercel/next.js + node_modules/next/dist/docs · Tailwind v4: /tailwindlabs/tailwindcss.com · motion: /websites/motion_dev) · ใช้ version ล่าสุดแบบ stable ยกเว้น typescript ~6.0.x, eslint ^9, @types/node ^24 (PLAN.md 5)
- engine อยู่ที่ src/lib/fp: BigInt ล้วน ห้ามคำนวณผลด้วย Number · ผลต้องตรง IEEE 754 round to nearest ties to even ทุกบิต · algorithm ตาม PLAN.md 4.3 · test: golden vectors (ภาคผนวก C) + oracle Math.fround + exhaustive MINI8 ห้ามลด numRuns
- ตัวเลขบิต/hex/ค่าที่เก็บจริงในเนื้อหาต้อง render จาก engine (WorkedExample) ห้ามพิมพ์เอง
- ทุกกระบวนการหลายขั้นใช้ StepPlayer: ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด/reduced motion (PLAN.md 8)
- ธีม Liquid Glass ฟ้า-ขาวแบบ coekku.shop: port จาก docs/reference/coe-shop/ (PLAN.md 9) · daisyUI ตั้ง exclude: glass, rootcolor · สีบิต PLAN.md 9.4 · สว่างอย่างเดียว · mobile-first
- ห้ามแก้/สร้าง/ลบไฟล์ใน /Users/pisit/Documents/Development/CoE-Shop (เว็บใช้งานจริง) · ห้ามแก้ requirement 2 ไฟล์เดิมของเพื่อน
- ชื่อเว็บ Binary Lab · เครดิตผู้จัดทำ 4 คนและอาจารย์ผู้สอนอยู่ใน src/lib/site.ts ตาม PLAN.md 7.1 (พิมพ์ชื่อไทยตามนั้นทุกตัวอักษร)
- ห้าม emoji ทุกที่ ใช้ lucide-react · ข้อความไทยต้องเป็นธรรมชาติ ใช้ศัพท์ตาม PLAN.md 7.9
- ห้าม deploy เอง (push ได้) · ห้าม git push --force / reset --hard · ก่อน push ให้ git fetch แล้ว pull --rebase ถ้ามี commit ใหม่
- ก่อน commit: lint + typecheck + test ผ่าน · งาน UI ต้องเปิดดู screenshot มือถือ 390px เองก่อนบอกว่าเสร็จ · จบ phase: build ผ่านและทุก route เป็น static
- ประหยัด token: Vitest dot, Playwright line, log ดูแค่ tail/grep, PLAN.md อ่านเฉพาะหัวข้อที่ใช้ (PLAN.md 2.8)
