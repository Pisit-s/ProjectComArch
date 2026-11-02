# คู่มือทีม comkrub (ระยะที่ 2)

เว็บนี้แบ่งงานเป็น 4 WP (work package) แต่ละคนทำงานผ่าน Claude Code บน branch ของตัวเอง แล้วเปิด Pull Request ให้ Pisit merge · แผนเต็มอยู่ใน `PLAN.md` · spec ของแต่ละ WP อยู่ใน `docs/plans/`

| WP | หัวข้อ | branch | spec | ไฟล์ความคืบหน้า |
|---|---|---|---|---|
| WP-0 | หน้าแรก + โครงร่วม (เสร็จก่อน) | `wp0-hub` | `PLAN.md` หัวข้อ 7 | `docs/progress/wp0-hub.md` |
| WP-1 | MIPS Simulator | `wp1-mips-sim` | `docs/plans/wp1-mips-sim.md` | `docs/progress/wp1-mips-sim.md` |
| WP-2 | การคูณแบบ MIPS | `wp2-multiply` | `docs/plans/wp2-multiply.md` | `docs/progress/wp2-multiply.md` |
| WP-3 | การหารแบบ MIPS | `wp3-divide` | `docs/plans/wp3-divide.md` | `docs/progress/wp3-divide.md` |

## เริ่มงานครั้งแรก

1. Pisit เชิญเป็น collaborator: GitHub → repo → Settings → Collaborators → Add people (repo เป็น private) แล้วกดรับคำเชิญในอีเมล
2. ติดตั้ง Git, Node.js 24 ขึ้นไป, VS Code และ Claude Code (ส่วนขยาย VS Code หรือ CLI) แล้วล็อกอินบัญชี Claude
3. ตั้ง Context7 MCP ด้วย `npx ctx7 setup --claude` (ตัวเดียวกับที่ Pisit ใช้) แล้วพิมพ์ `/mcp` ใน Claude Code ต้องเห็น context7
4. clone และรันในเครื่อง:
   ```bash
   git clone https://github.com/Pisit-s/ProjectComArch.git
   cd ProjectComArch
   npm install
   npx playwright install chromium webkit   # ครั้งแรกครั้งเดียว
   npm run dev                              # เปิด http://localhost:3000 ต้องเห็นหน้าแรก comkrub
   ```
5. ใน Claude Code: เลือก model ที่ดีที่สุดที่บัญชีมี (Opus 5.5 effort high ถ้ามี) และโหมด Auto → วาง prompt ของ WP ตัวเองจาก `PLAN.md` ภาคผนวก A (WP-2 ใช้ A.3, WP-3 ใช้ A.4, WP-1 ใช้ A.2) → ปล่อยให้ทำงาน
6. ชน usage limit หรือเปิด session ใหม่: วาง prompt "ทำต่อ" (`PLAN.md` ภาคผนวก A.5) Claude Code จะอ่านไฟล์ progress แล้วทำต่อจากจุดเดิม
7. งานเสร็จ: Claude Code เปิด PR ให้ (ถ้าเครื่องมี `gh`) หรือบอกว่าต้องกดอะไรบน GitHub → แจ้ง Pisit

## ไฟล์ที่แต่ละ WP แก้ได้ (`PLAN.md` 3.3)

| WP | แก้/สร้างได้ | ไฟล์ร่วมที่แก้ได้แบบจำกัด |
|---|---|---|
| WP-1 | `src/app/mips/**`, `src/lib/mips/**`, `src/components/mips/**`, `src/content/mips/**`, `src/content/glossary/mips.ts`, `tests/unit/mips/**`, `tests/e2e/mips.spec.ts`, `docs/progress/wp1-mips-sim.md` | `src/content/topics.ts` (เฉพาะ `status` ของ `mips`) · `package.json` + `package-lock.json` (dependency ของ WP-1 เท่านั้น) · `src/lib/site.ts` (บรรทัดอ้างอิง MIPS Reference Data) · `docs/STACK.md` (แถว dependency ใหม่) |
| WP-2 | `src/app/multiply/**`, `src/lib/multiply/**`, `src/components/multiply/**`, `src/content/multiply/**`, `src/content/glossary/multiply.ts`, `tests/unit/multiply/**`, `tests/e2e/multiply.spec.ts`, `docs/progress/wp2-multiply.md` | `src/content/topics.ts` (เฉพาะ `status` ของ `multiply`) |
| WP-3 | `src/app/divide/**`, `src/lib/divide/**`, `src/components/divide/**`, `src/content/divide/**`, `src/content/glossary/divide.ts`, `tests/unit/divide/**`, `tests/e2e/divide.spec.ts`, `docs/progress/wp3-divide.md` | `src/content/topics.ts` (เฉพาะ `status` ของ `divide`) |

- ไฟล์อื่นนอกจากนี้ห้ามแก้ ถ้าจำเป็นจริง (เช่นเจอบั๊กใน component ร่วม) ให้แก้แบบไม่ทำของเดิมพัง แยกเป็น commit `fix(shared): ...` และจดในไฟล์ progress หัวข้อ "แก้ไฟล์ร่วม"
- WP-2 และ WP-3 ห้ามเพิ่ม dependency
- หัวข้อเปิดให้เรียนเมื่อเปลี่ยน `status: 'coming-soon'` เป็น `'ready'` ใน `src/content/topics.ts` (บรรทัดเดียว) หลังงาน Must ของ WP เสร็จ หน้าแรก เมนู footer และ sitemap เปลี่ยนตามเอง

## ชิ้นส่วนร่วมที่ใช้ได้เลย (ห้ามสร้างซ้ำ)

เปิด `npm run dev` แล้วไปที่ http://localhost:3000/dev/kit จะเห็นทุกชิ้นพร้อมตัวอย่าง (หน้านี้ไม่มีบนเว็บจริง)

| ชิ้นส่วน | ไฟล์ | ใช้ทำอะไร |
|---|---|---|
| `LessonLayout`, `Section`, `Summary` | `src/components/layout/lesson-layout.tsx` | โครงหน้าเรียน: หัวเรื่อง วัตถุประสงค์ สารบัญ ส่วนเนื้อหา สรุป |
| `TalkingPoints`, `SelfCheck` | `src/components/content/` | "ประเด็นสำหรับอธิบาย" และ "คำถามชวนคิด" ท้ายหัวข้อ |
| `StepPlayer` | `src/components/player/step-player.tsx` | เล่นทุกกระบวนการหลายขั้น (ของเดิมจาก Floating-Point) |
| `BitRow` | `src/components/bits/bit-row.tsx` | แถวบิตทุกแบบ: สีตาม `FieldKind`, เน้นบิตที่เปลี่ยน, carry, แบ่งครึ่ง |
| ชุด `Hw*` | `src/components/hw/` | วาดฮาร์ดแวร์ (register, ALU, control, เส้นข้อมูล) ด้วย SVG |
| `OpenInSim` | `src/components/topic/open-in-sim.tsx` | ปุ่ม "ลองใน MIPS Simulator" ไปยังโปรแกรมตัวอย่าง |
| `Term` + glossary | `src/content/glossary/` | คำศัพท์ แตะแล้วเห็นความหมาย (แต่ละ WP เติมไฟล์ของตัวเอง) |
| สี | `src/app/globals.css` (`mips-*`, `md-*`) | สีของ field คำสั่ง MIPS และบทบาท register ในการคูณ/หาร (`PLAN.md` 6.1) |

## คำถามที่ Claude Code จดไว้

Claude Code ไม่หยุดถามระหว่างทาง แต่จดคำถามไว้ในไฟล์ progress ของ WP หัวข้อ "คำถาม" แล้วทำงานต่อด้วยค่าที่สมมติ แต่ละข้อมีรูปแบบนี้:

```md
### WP2-Q1 [ด่วน | ยืนยันค่าเริ่มต้น | ไม่ด่วน] หัวข้อสั้น ๆ
- คำถาม: ...
- ค่าที่สมมติไว้ตอนนี้: ...
- ถ้าคำตอบต่าง ต้องแก้: ...
- สถานะ: รอคำตอบ
```

- **ด่วน** ควรตอบก่อน merge · **ยืนยันค่าเริ่มต้น** ถ้าเห็นด้วยไม่ต้องทำอะไร · **ไม่ด่วน** ตอบเมื่อสะดวก
- วิธีตอบ: คุยกับ Pisit แล้วพิมพ์คำตอบให้ Claude Code เช่น "WP2-Q1: ใช้ 8 บิตเป็นค่าเริ่มต้น" มันจะแก้งานและเปลี่ยนสถานะเป็น "ตอบแล้ว"

## Git และ Pull Request

- ทำงานบน branch ของตัวเองเท่านั้น ห้าม commit หรือ push เข้า `main` ตรง ๆ (ทุก push เข้า `main` ขึ้นเว็บจริงทันที)
- อัปเดต branch ให้ทัน `main` ด้วย `git fetch origin && git merge origin/main` (ห้าม rebase branch ที่ push แล้ว)
- ห้าม `git push --force`, `git reset --hard` และห้ามลบ branch ของคนอื่น
- เปิด PR เข้า `main` เมื่อจบ WP · CI (GitHub Actions) รัน lint, typecheck, test และ build ให้อัตโนมัติ ต้องเขียวก่อน merge · กรอก checklist ใน PR ให้ครบ
- Pisit เป็นคน merge ด้วย "Create a merge commit" เท่านั้น
- Vercel แผน Hobby ของ Pisit ไม่สร้าง preview ให้ commit ของเพื่อน (Vercel Bot จะ comment ว่า blocked) ถือว่าปกติ ให้ทดสอบในเครื่องด้วย `npm run dev` และ `npm run build`

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `npm run dev` | dev server ที่ http://localhost:3000 |
| `npm run lint` · `npm run typecheck` · `npm test` | ต้องผ่านก่อน commit ทุกครั้ง |
| `npm run build` | ต้องผ่านและทุก route เป็น static (○) |
| `npx playwright test --project=pixel7 tests/e2e/<wp>.spec.ts` | e2e ของ WP ตัวเองบนมือถือ |
| `npm run shots -- <path> <out.png> 390 844` | ถ่าย screenshot (ต้องมี server ที่ `SHOT_BASE`) |
