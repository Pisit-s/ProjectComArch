# comkrub: กติกาถาวรสำหรับ Claude Code
@AGENTS.md

- **ทำงานพร้อมกัน 3 เครื่อง: อ่าน docs/PARALLEL.md ก่อนทุกครั้ง** ดูว่า branch ปัจจุบันเป็นของใคร แก้ไฟล์ได้แค่ไหน · แผนระยะที่ 2 บน main (hub, /floating-point, คูณ/หาร, MIPS) และ branch wp0-hub ยกเลิกแล้ว ห้ามใช้

- เว็บสื่อการสอนวิชา Computer Architecture เรื่องเดียว: การบวกและการลบเลข Floating-Point (IEEE 754 single precision) เป็นหน้าเดียว `/` เลื่อนลงทีละบท (บทที่ 1-7 + สรุป) · ไม่มีเรื่องคูณ/หาร ไม่มี hub/MIPS Simulator (ยกเลิกแล้ว)
- แผน: PLAN.md (อ่านเฉพาะหัวข้อที่เกี่ยวกับงานก่อนเริ่มทุกครั้ง) · ความคืบหน้า docs/PROGRESS.md (branch เพื่อน: docs/progress/<branch>.md) · คำถาม docs/QUESTIONS.md · review docs/REVIEW.md · แผนรอบแรก (engine, StepPlayer, ธีม, testing): docs/plans/stage1-floating-point.md · version: docs/STACK.md
- แหล่งเนื้อหา: สไลด์อาจารย์ใน Slide/ ก่อน (สรุปใน PLAN.md ภาคผนวก E) → Patterson & Hennessy 5e หัวข้อ 3.2, 3.5 → IEEE 754-2019 · ศัพท์ตามสไลด์ (PLAN.md 2.4) · ห้าม commit Slide/ และ EMIPS.pdf · ห้ามคัดลอกรูปหรือข้อความจากสไลด์/ตำรา วาดและเขียนเอง
- ทำงานแบบ autonomous: ห้ามใช้ AskUserQuestion ห้ามหยุดถาม → จดคำถาม + ค่าที่สมมติใน docs/QUESTIONS.md แล้วทำต่อ
- ก่อนใช้ library ให้ query Context7 ก่อนเสมอ (Next.js 16: /vercel/next.js + node_modules/next/dist/docs · daisyUI 5: /websites/daisyui · Tailwind v4: /tailwindlabs/tailwindcss.com · motion: /websites/motion_dev · Vitest/fast-check/Playwright: resolve ตอนใช้) · ห้ามเพิ่ม dependency ถ้าไม่จำเป็น (จดคำถามก่อน) · version: latest stable ยกเว้น typescript ~6.0.x, eslint ^9, @types/node ^24
- "เห็นก่อนอ่าน" (PLAN.md 1): ทุกบทเริ่มด้วยคำศัพท์ แล้วเป็น animation ที่กดเล่นได้ · ข้อความที่ผู้ใช้เห็นอยู่ใน src/content/lesson/ เท่านั้นและต้องอยู่ในงบ (PLAN.md 1.3) · ทุกกระบวนการหลายขั้นใช้ StepPlayer (ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด/reduced motion/โหมดนำเสนอ)
- engine อยู่ที่ src/lib/fp: BigInt ล้วน ห้ามคำนวณผลด้วย Number · ผลตรง IEEE 754 round to nearest ties to even ทุกบิต · test: golden (PLAN.md ภาคผนวก D + stage1 ภาคผนวก C) + oracle Math.fround + exhaustive MINI8 · ห้ามลด numRuns
- ตัวเลขผลลัพธ์ บิต hex ค่าที่เก็บจริง และผล printf ในเนื้อหาต้อง render จาก engine/โมเดล ห้ามพิมพ์เอง (input ของตัวอย่างเขียนได้) · UI ห้ามคำนวณเอง ใช้ frame adapters ใน src/lib/lesson/
- ธีม Liquid Glass ฟ้า-ขาว (stage1 9) · daisyUI ตั้ง exclude: glass, rootcolor · สีตาม PLAN.md 1.2 · สว่างอย่างเดียว · mobile-first (390px ก่อน)
- ห้ามแก้/สร้าง/ลบไฟล์ใน /Users/pisit/Documents/Development/CoE-Shop · ห้ามแก้ requirement 2 ไฟล์เดิมของเพื่อน
- ชื่อเว็บ comkrub · ข้อมูลเว็บ เครดิตผู้จัดทำ 4 คนและอาจารย์อยู่ใน src/lib/site.ts (ห้ามแก้ชื่อ พิมพ์ตามนั้นทุกตัวอักษร)
- ห้าม emoji ทุกที่ ใช้ lucide-react · ภาษาไทยเป็นธรรมชาติ สั้น ตรง ใช้ศัพท์ตาม src/content/lesson/vocab.ts · ห้ามสำนวนแบบ AI
- git: ทำบน branch ของตัวเองตาม docs/PARALLEL.md (Pisit: addsub-redesign) · ห้าม commit/push เข้า main ห้าม merge ห้าม deploy เอง (push branch ได้ Vercel สร้าง preview เอง) · ห้าม push --force, reset --hard, rebase branch ที่ push แล้ว · ก่อน push: git fetch ถ้า main มี commit ใหม่ให้ git merge origin/main (branch เพื่อน: git merge origin/addsub-redesign แทน)
- ก่อน commit: lint + typecheck + test ผ่าน · งาน UI ต้องเปิดดู screenshot 390px และ 1440px เอง · จบ phase: build ผ่านและทุก route static · จบงาน: review 4 รอบ (PLAN.md 11.4)
- ประหยัด token: Vitest dot, Playwright line, log ดูแค่ tail/grep, PLAN.md อ่านเฉพาะหัวข้อที่ใช้ (grep -n "^## \|^### " PLAN.md)
