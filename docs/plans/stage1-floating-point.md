# Binary Lab — แผนพัฒนาเว็บสื่อการสอน Floating-Point (วิชา Computer Architecture)

> **เอกสารเก็บถาวร: ระยะที่ 1 (เสร็จแล้ว 30 ต.ค. 2569)** · ไฟล์นี้คือ `PLAN.md` เดิมของเว็บ Floating-Point (ชื่อเดิม Binary Lab) ย้ายมาไว้ที่นี่เมื่อเริ่มระยะที่ 2 (comkrub) · แผนปัจจุบันอยู่ที่ `PLAN.md`
> - ใช้อ้างอิงเรื่อง engine (หัวข้อ 4), StepPlayer (8), ธีมและสี (9), testing (10) และ golden vectors (ภาคผนวก C) ได้ตามเดิม · comment ในโค้ดที่เขียนว่า `PLAN.md x.y` (ของเก่า) หมายถึงหัวข้อ x.y ของไฟล์นี้
> - route ในไฟล์นี้เป็นของเดิม (`/learn/*`, `/lab`) ระยะที่ 2 ย้ายเป็น `/floating-point/*` และ `/floating-point/lab` (PLAN.md 2.1) · ชื่อเว็บปัจจุบันคือ comkrub
> - ชื่อผู้จัดทำคนที่ 4 ที่ถูกต้องคือ "นายณัฐิวุฒิ แสงสารพันธ์" (แก้ในไฟล์นี้แล้ว ยึดตาม `src/lib/site.ts`)

> แผนนี้เขียนให้ **Claude Code ใน VS Code** ทำงานแบบ autonomous · model **Opus 5.5** · effort **high** · เขียนเมื่อ 30 ต.ค. 2569
> repo `Pisit-s/ProjectComArch` (branch `main`) · โฮสต์บน Vercel (Pisit กด deploy เอง)
> ชื่อเว็บ **Binary Lab** (Pisit ยืนยันแล้ว) · ข้อมูลของเว็บและเครดิตผู้จัดทำอยู่ที่ `src/lib/site.ts` จุดเดียว

## สารบัญ
- 0. สรุปงาน
- 1. สำหรับ Pisit: วิธีเริ่มให้ Claude Code ทำงาน
- 2. กติกาการทำงานของ Claude Code
- 3. Requirement และการตัดสินใจเพิ่มเติม
- 4. Floating-point engine (ส่วนที่ห้ามผิด)
- 5. Tech stack + นโยบาย version
- 6. โครงสร้างโปรเจกต์
- 7. หน้าเว็บ เนื้อหา และ acceptance criteria
- 8. Animation แบบกดได้ (StepPlayer)
- 9. UI/UX: Liquid Glass ฟ้า-ขาว + daisyUI
- 10. Testing
- 11. Phases + Definition of Done
- 12. เครื่องของ Pisit + local dev
- 13. คู่มือ deploy บน Vercel (Pisit ทำเอง)
- 14. รายการคำถาม (`docs/QUESTIONS.md`)
- 15. Review 3 รอบ + รายงานสุดท้าย
- ภาคผนวก A — kickoff prompt
- ภาคผนวก B — `CLAUDE.md`
- ภาคผนวก C — Golden test vectors (ตรวจแล้ว)

---

## 0. สรุปงาน

- **ทำอะไร**: เว็บสื่อการสอนภาษาไทยแบบ interactive เรื่องเลขฐานสองและ Floating-Point (IEEE 754 Single Precision) สำหรับวิชา Computer Architecture — 5 บท + หน้า Lab
  1. ระบบเลขฐานและเลขฐานสอง
  2. เศษส่วนฐานสิบและฐานสอง
  3. IEEE 754: encode / decode
  4. บวก/ลบ Floating-Point
  5. **คูณ/หาร Floating-Point** (อาจารย์ขอเพิ่ม — requirement ส่วนเพิ่มเขียนพร้อมแผนนี้)
- **3 เรื่องที่สำคัญที่สุด**
  1. **ถูกระดับบิต**: ทุกผลลัพธ์ต้องตรง IEEE 754 binary32 (round to nearest, ties to even) — engine เขียนด้วย BigInt และ test เทียบกับ IEEE จริง (หัวข้อ 4)
  2. **Animation แบบกดได้**: ทุกกระบวนการหลายขั้นเล่นผ่าน StepPlayer — ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด และแตะที่บิตเพื่อดูความหมาย (หัวข้อ 8)
  3. **ธีม Liquid Glass ฟ้า-ขาว** แบบเดียวกับ coekku.shop โดยยกโค้ดจริงจาก CoE-Shop (หัวข้อ 9)
- **Stack**: Next.js 16 (App Router, static ทั้งเว็บ) · React 19 · TypeScript · Tailwind CSS v4 · daisyUI 5 · motion · lucide-react · Vitest + fast-check · Playwright · Vercel
- **ไม่มี** backend, database, login, analytics — คำนวณทั้งหมดใน browser
- **ผู้ใช้ 2 แบบ**: นักศึกษาที่ไม่มีพื้นฐาน (เรียนเองบนมือถือ/คอม) และอาจารย์ (เปิดสอนบนจอโปรเจกเตอร์ กดเลื่อนขั้นด้วยคีย์บอร์ด ส่งลิงก์ตัวอย่างให้นักศึกษา)

---

## 1. สำหรับ Pisit: วิธีเริ่มให้ Claude Code ทำงาน

1. เปิดโฟลเดอร์ `ProjectComArch` ใน VS Code
2. **อัปเดต Claude Code ก่อน**: CLI ในเครื่องยังเป็น 2.1.220 (บน npm ล่าสุด 2.1.314 ณ 30 ต.ค. 2569) → รัน `claude update` (ถ้าลงผ่าน Homebrew ใช้ `brew upgrade claude-code`) แล้วอัปเดต extension Claude Code ใน VS Code
3. เปิด Claude Code panel → `/model` เลือก **Opus 5.5** → `/effort high` (หรือใส่ `"effortLevel": "high"` ใน `~/.claude/settings.json` กันค่าหายตอน resume) → คลิก mode indicator ใต้ช่องพิมพ์เลือก **Auto** (อย่าใช้ Plan หรือ Manual เพราะจะรอให้กดอนุมัติ)
4. ตรวจ Context7: พิมพ์ `/mcp` ต้องเห็น context7 เชื่อมต่ออยู่ (ตั้งแบบ global ไว้แล้วด้วย `npx ctx7 setup --claude`)
5. กันเครื่องหลับ: เสียบสายชาร์จ เปิดฝาจอ แล้วรัน `caffeinate -dimsu` ใน Terminal ทิ้งไว้ (กด Ctrl+C เมื่อเลิก)
6. เครื่องมี RAM 8 GB: ปิดแอปหนัก ๆ ก่อน (งานนี้รัน Next.js dev + Vitest + Playwright)
7. วาง **kickoff prompt ในภาคผนวก A** แล้วปล่อยได้เลย
8. งานนี้ไม่จบใน session เดียว — ถ้าชน usage limit หรือเปิด session ใหม่ ให้พิมพ์ `ทำต่อ — อ่าน CLAUDE.md กับ docs/PROGRESS.md แล้วทำงานถัดไป` (งานไม่หายเพราะ commit ทุกงานย่อย)
9. พอถึง **Milestone "พร้อมใช้สอน"** (หัวข้อ 11) Claude Code จะเขียน "พร้อม deploy แล้ว" ไว้บรรทัดแรกของ `docs/PROGRESS.md` และบอกใน chat → deploy ตามหัวข้อ 13 ได้เลย (หลังต่อ Vercel แล้ว ทุก push เข้า `main` จะขึ้นเว็บจริงอัตโนมัติ)
10. ตอนจบ Claude Code จะสรุปใน `docs/FINAL_REPORT.md` และรวมคำถามทั้งหมดไว้ใน `docs/QUESTIONS.md` — ตอบใน session เดิมแล้วให้แก้ตามคำตอบ

> ไฟล์ธีมจาก CoE-Shop ถูก copy มาไว้ที่ `docs/reference/coe-shop/` แล้วตอนเขียนแผน (นามสกุล `.txt` กันไม่ให้ TypeScript/ESLint/Vitest หยิบไปรัน) Claude Code จึงไม่ต้องเข้าไปใน repo CoE-Shop ระหว่างทำงาน

---

## 2. กติกาการทำงานของ Claude Code (อ่านก่อนเริ่ม และทำตามตลอดทั้งงาน)

### 2.1 ห้ามหยุดรอคำตอบ
- **ห้ามใช้ AskUserQuestion และห้ามจบ turn เพื่อถามระหว่างทาง** — Pisit เปิดเครื่องทิ้งไว้ ไม่มีคนตอบ
- เจอเรื่องที่ต้องให้ Pisit ตัดสินใจ → เขียนลง `docs/QUESTIONS.md` ตามรูปแบบหัวข้อ 14 (มี "ค่าที่สมมติไว้" และ "ถ้าคำตอบต่างต้องแก้ไฟล์ไหน") แล้ว **ทำงานต่อด้วยค่าสมมตินั้น** หรือข้ามไปทำงานอื่นที่ไม่ติด
- ข้อมูลของเว็บและค่าที่สมมติ (ชื่อเว็บ, เครดิตผู้จัดทำ, ลิงก์) รวมไว้จุดเดียวที่ `src/lib/site.ts` ให้แก้ทีหลังง่าย

### 2.2 ลำดับงานและการ resume
- ทำตาม Phase 0 → 10 ในหัวข้อ 11 ทีละ phase ห้ามข้าม Definition of Done (DoD)
- Phase 0 ต้องสร้าง `CLAUDE.md` (ภาคผนวก B), `docs/PROGRESS.md`, `docs/QUESTIONS.md`, `docs/STACK.md` ก่อนเขียนโค้ดจริง
- **อัปเดต `docs/PROGRESS.md` ทุกครั้งที่จบงานย่อย** (checkbox + สั้น ๆ ว่าทำอะไร/เหลืออะไร) เพื่อให้ session ใหม่ทำต่อได้ทันทีถ้าชน usage limit หรือ context ถูก compact
- เริ่มแต่ละ phase ให้เปิดอ่านหัวข้อที่เกี่ยวข้องใน PLAN.md ใหม่ทุกครั้ง (แผนยาว อย่าพึ่งความจำ)

### 2.3 Git (Pisit ให้สิทธิ์จัดการ git เต็มที่)
- ทำงานบน `main` ได้เลย ใช้ Conventional Commits เช่น `feat(fp): restoring division with sticky bit`, `test(fp): binary32 oracle`
- commit ทุกงานย่อยที่ผ่าน quality gate · `git push origin main` ทุกครั้งที่จบ phase (และอย่างน้อยทุก ~1 ชม. ของงาน)
- ก่อน push ให้ `git fetch` ก่อนเสมอ: ถ้า remote มี commit ใหม่ (เพื่อนในทีมอาจ push) → `git pull --rebase origin main`; ถ้า conflict → `git rebase --abort` จดใน QUESTIONS.md แล้วทำงานต่อโดยยังไม่ push
- **สถานะตอนเริ่ม**: commit แรก `ed29a5c` มี prototype 4 ตัวใน `floating_web/` (claude, deepseek, gemini, gpt — เพื่อนในทีมทำไว้) ซึ่ง Pisit ลบออกจากเครื่องแล้วแต่ยังไม่ commit และ**ยืนยันให้ลบถาวร** → Phase 0 ให้ commit การลบนั้น (`chore: remove old AI prototypes`) — ยังเปิดดูได้ด้วย `git show ed29a5c:<path>` ใช้ดูไอเดียได้ แต่ห้ามยกโค้ดมา (vanilla JS ธีมมืด)
- `.DS_Store` ถูก commit ไปแล้ว → `git rm --cached .DS_Store` แล้วใส่ใน `.gitignore`
- ห้าม: `git push --force`, `git reset --hard`, rewrite history, ลบ branch, commit secret

### 2.4 Quality gates (ต้องผ่านก่อน commit ทุกครั้ง)
- `npm run lint` · `npm run typecheck` · `npm run test` ผ่านหมด
- งานที่แตะ UI: รัน e2e ที่เกี่ยวข้อง (ระหว่างทำใช้ project `pixel7` Chromium) + ถ่าย screenshot 390×844 แล้ว **เปิดดูรูปจริงด้วย Read** ก่อนบอกว่าเสร็จ
- จบ phase: `npm run build` ต้องผ่าน และ build output ต้องแสดงทุก route เป็น static (○)
- ห้ามบอกว่าเสร็จถ้ายังไม่ verify จริง, ห้ามปิดหรือ skip test เพื่อให้ผ่าน, ห้ามลด `numRuns` ของ property test ต่ำกว่าที่หัวข้อ 4.5 กำหนด

### 2.5 ใช้ Context7 + version ล่าสุดเสมอ (Pisit ย้ำ)
**ก่อนเขียนโค้ดที่ใช้ library ใด ให้เปิด docs ผ่าน Context7 ก่อนทุกครั้ง** (`resolve-library-id` → `query-docs`) เพราะความรู้ใน training data อาจเก่ากว่า version ที่ติดตั้ง — library ID ที่ตรวจแล้วตอนเขียนแผน:

| library | Context7 ID | เรื่องที่ต้องเปิดดูก่อนใช้ |
|---|---|---|
| daisyUI 5 | `/websites/daisyui` | config `@plugin "daisyui"` (themes, exclude), `@plugin "daisyui/theme"`, ทุก component ที่จะใช้ (หัวข้อ 9.5) |
| Next.js 16 | `/vercel/next.js` + docs ที่ติดมากับ package ใน `node_modules/next/dist/docs/` (AGENTS.md ชี้ไว้) | flags ของ create-next-app, metadata, `next/font`, `useSearchParams` + Suspense, static rendering, `opengraph-image`, `sitemap`/`robots`, `typedRoutes` |
| Tailwind CSS v4 | `/tailwindlabs/tailwindcss.com` | `@theme`, `@theme inline`, `@utility`, `@source not`, `@plugin` |
| motion | `/websites/motion_dev` | `layout`, `layoutId`, `AnimatePresence`, `MotionConfig reducedMotion`, `useAnimate`, `animate()` |
| Vitest / fast-check / Playwright | resolve ตอนใช้ | config, `fc.assert` + `numRuns`, `webServer`, `devices` |

นโยบาย version อยู่ในหัวข้อ 5

### 2.6 ข้อห้ามอื่น ๆ
- **ห้ามแก้ไข สร้าง หรือลบไฟล์ใด ๆ ใน `/Users/pisit/Documents/Development/CoE-Shop`** (เว็บที่ใช้งานจริง) — ใช้ไฟล์ใน `docs/reference/coe-shop/` แทน ถ้าจำเป็นต้องดูไฟล์อื่นของ CoE-Shop ให้อ่านอย่างเดียว
- ห้ามแก้ไฟล์ requirement 2 ไฟล์เดิมของเพื่อนใน `floating_website_requirement/` (ไฟล์ส่วนเพิ่มคูณ/หารแก้ได้ถ้าจำเป็น โดยจดใน PROGRESS.md ว่าแก้อะไรเพราะอะไร)
- ห้าม deploy เอง: ห้ามรัน `vercel` CLI และห้ามแตะ settings บน Vercel (Pisit ทำเองตามหัวข้อ 13) — push เข้า `main` ได้ตามปกติ
- ห้ามใช้ `curl | bash` หรือติดตั้งของนอก npm
- ห้ามคำนวณผลลัพธ์ floating-point ด้วย `Number` ใน engine (หัวข้อ 4.1) และ **ห้ามพิมพ์เลขบิต/hex/ค่าที่เก็บจริงของตัวอย่างในเนื้อหาด้วยมือ** — ต้อง render จาก engine เสมอ (ตัวเลขในเนื้อหาจะได้ไม่ผิดและไม่ขัดกับเครื่องมือ)
- ห้ามใช้รูป figure หรือข้อความจากตำรา/เว็บอื่น — วาดและเขียนเองทั้งหมด อ้างอิงได้แค่ชื่อแหล่งที่มา

### 2.7 สไตล์
- **ห้ามใช้ emoji ในทุกสิ่งที่สร้าง** (UI, ข้อความ, code comment, commit message, docs) ใช้ไอคอนจาก `lucide-react` หรือ inline SVG
- ภาษาไทยในเว็บต้องอ่านเหมือนอาจารย์/วิศวกรไทยเขียน: สั้น ตรง เป็นกันเอง ใช้ศัพท์อังกฤษที่คนใช้จริง (bit, Sign, Exponent, Fraction, Significand, Normalize, Overflow, Hidden bit, Guard bit) ไม่แปลตรงตัวแบบ "บิตยาม" หรือ "ส่วนชี้กำลังเอนเอียง" — ถ้าอยากให้คำไทย ใส่ในวงเล็บครั้งแรกครั้งเดียว · ห้ามสำนวนแบบ AI ("มาดำดิ่งกัน", "ไขความลับ", "เปิดโลก")
- คำศัพท์ต้องตรงกันทั้งเว็บตามตารางในหัวข้อ 7.9
- โค้ด/ชื่อตัวแปร/commit เป็นภาษาอังกฤษ · เอกสารใน `docs/` เป็นภาษาไทย + ศัพท์เทคนิคภาษาอังกฤษ

### 2.8 ประหยัด token (Opus กิน usage มาก)
- test output สั้น: Vitest `--reporter=dot`, Playwright `reporter: 'line'`, `screenshot: 'only-on-failure'`, `trace: 'retain-on-failure'`, `video: 'off'` — เปิดดูรายละเอียดเฉพาะข้อที่ fail
- คำสั่งที่ log ยาว (install, build, lint) ดูแค่ท้ายหรือ error: `| tail -40`, `| grep -iE "error|warn"`
- PLAN.md ยาว: หลังอ่านครบรอบแรก ให้ `grep -n "^## \|^### " PLAN.md` หาเลขบรรทัด แล้ว Read เฉพาะหัวข้อที่ใช้
- screenshot: เปิดดูด้วย Read เฉพาะหน้าที่เพิ่งแก้ · ไม่ต้องเปิดไฟล์ generate (`package-lock.json`, `.next/`, `node_modules/`)

---

## 3. Requirement และการตัดสินใจเพิ่มเติม

### 3.1 ไฟล์ requirement (source of truth ของเนื้อหา)

| ไฟล์ใน `floating_website_requirement/` | เนื้อหา |
|---|---|
| `floating_point_website_requirements.md` | ของเพื่อน (ต้นฉบับภาษาอังกฤษ): บทที่ 1–4, FR-01…FR-06, NFR-01…NFR-06, out of scope, acceptance criteria |
| `requirements_เว็บไซต์_floating_point_ภาษาไทย.md` | ฉบับภาษาไทยของไฟล์บน |
| `floating_point_website_requirements_mul_div.md` | **ส่วนเพิ่ม**: บทที่ 5 คูณ/หาร, FR-01 (5 บท), FR-07 animation กดได้, FR-08 สีบิต, ตัวอย่าง M1–M6 และ D1–D5, acceptance ที่เพิ่ม |
| `requirements_เว็บไซต์_floating_point_คูณหาร_ภาษาไทย.md` | ฉบับภาษาไทยของส่วนเพิ่ม |

- อ่านครบทั้ง 4 ไฟล์ใน Phase 0 · ถ้าฉบับไทยกับอังกฤษขัดกัน ยึดฉบับอังกฤษแล้วจดใน QUESTIONS.md
- requirement เดิมให้เน้น Single Precision และไม่บังคับค่าพิเศษ (subnormal, ∞, NaN, ±0) ในบทที่ 3–4 — แผนนี้ทำ engine ให้ถูกทุกกรณีอยู่แล้ว (ทำทีเดียวถูกหมด ไม่มีข้อยกเว้นให้ต้องจำ) ส่วน UI บทที่ 3–4 แสดงผลค่าพิเศษพร้อมคำอธิบายสั้น ๆ ไม่ต้องไล่ทีละขั้น · บทที่ 5 อธิบายกรณีพิเศษเต็มตาม requirement ส่วนเพิ่ม

### 3.2 การตัดสินใจที่แผนนี้กำหนดเพิ่ม

| เรื่อง | ตัดสินใจ | เหตุผล |
|---|---|---|
| ชื่อเว็บ | **Binary Lab** | Pisit ยืนยันแล้ว (Q1) |
| เครดิต | footer แสดงผู้จัดทำ 4 คน + อาจารย์ผู้สอน (หัวข้อ 7.1) | Pisit ให้ข้อมูลแล้ว (Q2) |
| ภาษา | ไทยอย่างเดียว + ศัพท์เทคนิคอังกฤษ, `<html lang="th">` | ผู้เรียนเป็นนักศึกษาไทย ไม่ต้องทำ i18n |
| Format | UI ทุกบทเป็น binary32 (1-8-23) · engine เป็นแบบ generic รับทุก format | ตาม requirement + ใช้ format 8 บิตทดสอบแบบ exhaustive ได้ |
| การปัดเศษ | Round to nearest, ties to even อย่างเดียว | ค่าเริ่มต้นของ IEEE 754 และเป็นแบบที่ตำราสอน |
| Input | ทศนิยม/scientific notation แปลงแบบ exact ด้วย BigInt ไม่ผ่าน `Number` | `Number` ทำให้ปัด 2 ครั้ง (ทศนิยม → double → float) บางค่าจึงผิด (ภาคผนวก C แถว E13) |
| เศษส่วนบทที่ 2 | ตัดบิต (truncate) ตามจำนวนบิตที่เลือก แล้วบอกว่า IEEE 754 ใช้การปัดซึ่งจะเรียนในบทที่ 3 | requirement บทที่ 2 พูดถึงค่าประมาณจากจำนวนบิตที่เลือก |
| Rendering | static ทั้งเว็บ (SSG) ไม่มี server action, route handler หรือ DB | ไม่มีข้อมูลผู้ใช้ เร็ว ใช้ Vercel Hobby ได้ฟรี |
| Cache Components | ปิด (`--no-cache-components`) | เว็บไม่มี data fetching จึงไม่ได้ประโยชน์ แต่มีกติกาเพิ่ม (เช่น `new Date()` ใน server component ทำ build พัง) |
| Lab | หน้า `/lab` รวมเครื่องมือ + share link ผ่าน query string | อาจารย์ส่งตัวอย่างให้นักศึกษาได้ |
| Embed | ไม่ตั้ง `X-Frame-Options` | เผื่ออาจารย์ฝังหน้าเว็บใน LMS ผ่าน iframe |
| สูตร | `<sup>`/`<sub>` + JetBrains Mono ไม่ใช้ KaTeX/MathJax | สูตรไม่ซับซ้อน ไม่ต้องโหลด font/CSS เพิ่ม |
| Component library | daisyUI 5 อย่างเดียว (ไม่ใช้ shadcn/ui) + glass component ที่ port จาก CoE-Shop | 2 ระบบ theme ซ้อนกันจะชนกัน |
| State | `useState`/`useReducer` + URL query (เฉพาะ Lab) ไม่ใช้ state library | ไม่มี state ข้ามหน้า |

---

## 4. Floating-point engine (`src/lib/fp/`) — ส่วนที่ห้ามผิด

### 4.1 หลักการ
- pure TypeScript ไม่แตะ DOM/React ใช้ได้ทั้ง server และ client
- **ทุกค่าที่เป็นบิต, significand, ตัวเศษ/ตัวส่วนของจำนวนตรรกยะ ใช้ `bigint`** — ห้ามใช้ `Number` คำนวณผลลัพธ์ (`Number` ใช้ได้เฉพาะเป็น oracle ใน test, เป็นตัวนับ/index และเป็น exponent ที่อยู่ในช่วง safe integer)
- ทุก operation คืน `FpResult = { bits, steps, flags, exact }` — `steps` เป็นข้อมูลล้วน (ข้อ 4.4) ที่ UI เอาไป animate · UI ห้ามคำนวณซ้ำเอง
- format แบบ generic: `FloatFormat { name, expBits, fracBits }` → `bias = 2^(expBits−1) − 1`, `emin = 1 − bias`, `p = fracBits + 1` · preset `BINARY32 (8, 23)`, `MINI8 (4, 3)` (ใช้ test), `BINARY16 (5, 10)` และ `BINARY64 (11, 52)` (เผื่อ Lab แบบ stretch)
- algorithm เป็นแบบ textbook (Patterson & Hennessy: Guard/Round/Sticky) ตามข้อ 4.3 — **ตรวจแล้วตอนเขียนแผน** ด้วย Python reference ที่เทียบ 3 ทาง (algorithm นี้ / exact rational แล้วปัดครั้งเดียว / numpy float32) สุ่ม 2.4 ล้านกรณีบน binary32 และ exhaustive ทุกคู่บน minifloat 1-4-3 (229,920 กรณี finite) ไม่มีผิดเลย — ทำตามนี้แล้ว test ควรผ่าน ถ้าไม่ผ่านให้สงสัยโค้ดก่อนสงสัย algorithm

### 4.2 ไฟล์และ API
```
src/lib/fp/
  format.ts         FloatFormat + BINARY32, MINI8, BINARY16, BINARY64 + helper (bias, emin, mask)
  bits.ts           toBinaryString(bits, width), splitFields, groupNibbles, toHex, parseBitString/parseHex (validate)
  rational.ts       type Rational = { num: bigint; den: bigint } (ลดรูปแล้ว, den > 0), บวก/ลบ/คูณ/หาร/เทียบ, floorLog2
  parse.ts          parseDecimal(text) -> { ok: true; kind: 'finite' | 'inf' | 'nan'; value?: Rational; negative: boolean } | { ok: false; error: ParseError }
  decode.ts         decode(fmt, bits) -> { sign, expField, fracField, cls, significand, exponent, value: Rational | null }
  round.ts          roundPack(fmt, sign, P, pFrac, e, extraSticky) -> { bits, round: RoundInfo, flags }
  encode.ts         encodeDecimal(fmt, text) -> FpResult
  add.ts            addSub(fmt, a, b, op: '+' | '-') -> FpResult
  mul.ts            mul(fmt, a, b) -> FpResult
  div.ts            div(fmt, a, b) -> FpResult
  special.ts        ตารางกฎค่าพิเศษของทุก operation (คืน SpecialRule + ผลลัพธ์)
  fraction.ts       fractionToBinary(text, nBits) -> แถวการคูณ 2, วงซ้ำ, ค่าประมาณ, ผลต่าง (บทที่ 2)
  integer.ts        unsigned 8 บิต: น้ำหนัก, ค่าที่แต่ละบิตเพิ่ม, แปลงไป/กลับ (บทที่ 1)
  format-number.ts  shortestDecimal(fmt, bits), exactDecimal(fmt, bits), rationalToDecimal(r, maxDigits)
  steps.ts          Step types (ข้อ 4.4)
  index.ts
```
- `exact` ใน `FpResult` = ผลทางคณิตศาสตร์ที่แม่นยำของ **operand ที่เก็บจริง** (Rational หรือ `null` ถ้าเป็นค่าพิเศษ) ไว้แสดงเทียบอย่างเดียว ไม่ใช้คำนวณผล
- `Flags = { inexact, overflow, underflow, divideByZero, invalid }` (boolean ทั้งหมด)

### 4.3 Algorithm (ทำตามนี้ — ตรวจแล้ว)
ให้ `F = fracBits`, `p = F + 1` (binary32: F = 23, p = 24)

**ฟังก์ชันร่วม**
- `unpackNormalized(x)` (ใช้ในคูณ/หาร): normal → `sig = 2^F | frac`, `e = expField − bias` · subnormal → `k = p − bitLength(frac)`, `sig = frac << k`, `e = emin − k` (ทุกตัวจะมี leading 1 อยู่ที่บิต F)
- `roundPack(sign, P, pFrac, e, extraSticky)` — ค่าจริง = `P × 2^(−pFrac) × 2^e` และ `P > 0`
  1. `lead = bitLength(P) − 1`, `E = e + lead − pFrac`, `shift = lead − F`
  2. ถ้า `E < emin` (underflow): `shift += emin − E`, `E = emin` → denormalize จาก P เต็มความกว้าง (ห้ามปัดก่อนแล้วค่อยเลื่อน)
  3. ถ้า `shift > 0`: `kept = P >> shift`, `G = บิตที่ (shift−1)`, `R = บิตที่ (shift−2)` (ถ้า shift ≥ 2), `S = OR ของทุกบิตที่ต่ำกว่า R` OR `extraSticky` · ถ้า `shift ≤ 0`: `kept = P << −shift`, `G = R = 0`, `S = extraSticky`
  4. Round to nearest, ties to even: **ปัดขึ้นเมื่อ `G = 1` และ (`R = 1` หรือ `S = 1` หรือ LSB ของ kept = 1)** — กรณี `G=1, R=0, S=0` คือ tie → เลือกทางที่ LSB เป็น 0
  5. ถ้าปัดแล้ว `kept = 2^p` (ตัวทดออก) → `kept >>= 1`, `E += 1`
  6. `kept = 0` → ±0 · `kept < 2^F` → subnormal (expField = 0, fraction = kept) · `E + bias ≥ 2^expBits − 1` → ±∞ (overflow) · นอกนั้น pack `(sign, E + bias, kept − 2^F)`
  7. flags: `inexact = G|R|S`, `overflow` เมื่อค่าจำกัดกลายเป็น ∞, `underflow` เมื่อผลอยู่ในช่วง subnormal (ก่อนปัด) และ inexact

**บวก/ลบ (บทที่ 4)**
- ลบ = บวกโดยกลับ sign ของ B (ทำก่อนเช็คค่าพิเศษ)
- ค่าพิเศษ (`special.ts`): มี NaN → NaN · `(+∞) + (−∞)` → NaN (invalid) · มี ∞ ตัวเดียวหรือ ∞ เครื่องหมายเดียวกัน → ∞ ตัวนั้น · `(±0) + (±0)` ได้ −0 เฉพาะเมื่อทั้งคู่เป็น −0 นอกนั้น +0 · `x + (±0)` → x · ผลที่หักล้างกันพอดี (`x + (−x)`) → +0
- ไม่ normalize subnormal ก่อน (hidden bit = 0, `e = emin`) ตามแบบ hardware
- สลับให้ `|A| ≥ |B|` (เทียบ `(e, sig)`), `d = eA − eB`
- ขยาย 3 บิต (G, R, S): `A' = sigA << 3`, `B' = sigB << 3`; ถ้า `d > 0`: `sticky = (B' & (2^d − 1)) ≠ 0`, `B' = (B' >> d) | sticky` (OR เข้าบิตล่างสุด)
- sign เหมือนกัน → `t = A' + B'` · ต่างกัน → `t = A' − B'` (sign ของผล = sign ของ A) · ถ้า `t = 0` → +0
- normalize: ถ้า `t ≥ 2^(p+3)` → `t = (t >> 1) | (t & 1)`, `e += 1` · ถ้า `t < 2^(p+2)` → เลื่อนซ้ายทีละ 1 จน `t ≥ 2^(p+2)` หรือ `e = emin`
- `G = บิต 2`, `R = บิต 1`, `S = บิต 0`, `kept = t >> 3` → ปัดตามข้อ 4 ของ roundPack → ตัวทด → pack (เหมือนข้อ 5–6)

**คูณ (บทที่ 5)**
- ค่าพิเศษ: มี NaN → NaN · `0 × ∞` → NaN (invalid) · `∞ × x` → ±∞ · `0 × x` → ±0 · sign = XOR เสมอ
- `sign = sA XOR sB` · `(sigA, eA)`, `(sigB, eB)` จาก `unpackNormalized`
- `P = sigA × sigB` (binary32: 48 บิต ค่าอยู่ใน `[1, 4)` เมื่อมองเป็น `P × 2^−46`)
- partial products สำหรับ UI: ใช้ตัวที่มีบิต 1 น้อยกว่าเป็น multiplier (บอกผู้เรียนว่าสลับที่ได้) แล้วเก็บแถว `{ bitIndex, value: multiplicand << bitIndex }` เฉพาะบิตที่เป็น 1 — ผลรวมทุกแถวต้องเท่ากับ P
- `roundPack(sign, P, 2F, eA + eB, 0)` — การเลื่อนขวา 1 ครั้งเมื่อ P ≥ 2 เกิดเองจาก `lead`
- exponent ที่แสดงใน UI: `EA + EB − bias` (biased) ทั้งฐานสิบและฐานสอง 8 บิต เช่น `01111110 + 01111101 − 01111111 = 01111100` (126 + 125 − 127 = 124)

**หาร (บทที่ 5)**
- ค่าพิเศษ: มี NaN → NaN · `∞ ÷ ∞`, `0 ÷ 0` → NaN (invalid) · `∞ ÷ x` → ±∞ · `x ÷ ∞` → ±0 · `x ÷ 0` (x ≠ 0) → ±∞ (divideByZero) · `0 ÷ x` → ±0
- `sign = XOR` · `unpackNormalized` ทั้งคู่
- **restoring division** ทีละบิต `p + 3` รอบ (binary32: 27 รอบ): `r = sigA`; แต่ละรอบ ถ้า `r ≥ sigB` → `q = 1`, `r = r − sigB` ไม่งั้น `q = 0`; แล้ว `r = r << 1` — เก็บทุกแถว `{ remainder (ก่อนเทียบ), subtracted, qBit }` ไว้ให้ UI
- `Q = q₀ q₁ … q₂₆` (q₀ คือบิตหน้าจุด) · `remainder = r >> 1` หลังรอบสุดท้าย · assert `Q = floor(sigA × 2^(p+2) / sigB)`
- `roundPack(sign, Q, p + 2, eA − eB, remainder ≠ 0)` — ถ้า q₀ = 0 (ผลหาร < 1) จะ normalize ซ้าย 1 ครั้งเอง
- exponent ที่แสดง: `EA − EB + bias`

**encode จากทศนิยม (บทที่ 3)**
- `parseDecimal` รับ `[+-]?` + ตัวเลข + จุดทศนิยม (รับ `.5` และ `5.`) + `e[+-]?ตัวเลข` (ไม่สนตัวพิมพ์), ช่องว่างหน้า/หลัง, และคำพิเศษ `inf`, `infinity`, `∞`, `nan` (ไม่สนตัวพิมพ์) · ปฏิเสธ `,` (บอกให้ใช้ `.`), ข้อความยาวเกิน 200 ตัวอักษร และ exponent ที่ |e| > 100000 · ได้ Rational แบบ exact
- ค่า 0 → ±0 ตามเครื่องหมายที่พิมพ์ (`-0` ได้ −0)
- `e = floor(log2 |x|)` แบบ exact (ประมาณจาก bitLength ของตัวเศษ/ตัวส่วนแล้วปรับ ±1), `e' = max(e, emin)`, `q = roundHalfEven(|x| / 2^(e' − F))` ด้วย BigInt divmod → ต่อด้วยข้อ 5–6 ของ roundPack (ตัวทด, subnormal, overflow) · G/R/S ที่แสดงใน UI หาจากบิตถัดไปของ `|x| / 2^(e' − F)` (R/S ดูจากเศษ)
- steps สำหรับ UI: (1) ส่วนจำนวนเต็มเป็นฐานสอง (2) ส่วนเศษคูณ 2 ซ้ำ (แสดงจนเศษเป็น 0 หรือครบจำนวนบิตที่ต้องใช้ + 3) (3) normalize: จุดเลื่อนกี่ตำแหน่ง ได้ exponent เท่าไร (4) sign (5) biased exponent = e + 127 เป็นฐานสอง 8 บิต (6) fraction 23 บิต + G/R/S + เหตุผลที่ปัด (7) รวมเป็น 32 บิต + hex
- **ต้องผ่านแถว E13 ในภาคผนวก C**: `1.00000017881393432617187499` → `0x3F800001` (ถ้าแปลงผ่าน `Number` จะได้ `0x3F800002` ซึ่งผิด)

**decode (บทที่ 3)**: แยก field → ประเภท (zero / subnormal / normal / infinity / NaN) → ค่า `(−1)^s × 1.f × 2^(E−127)` หรือ subnormal `(−1)^s × 0.f × 2^−126` → ค่าที่เก็บจริงแบบ exact + แบบสั้น

**แสดงตัวเลข (`format-number.ts`)**
- `shortestDecimal`: ทศนิยมที่สั้นที่สุดที่ encode กลับแล้วได้บิตเดิม (ลองจำนวนหลักสำคัญ 1–9 สำหรับ binary32 และตรวจด้วย `encodeDecimal` ของเราเอง)
- `exactDecimal`: ค่าที่เก็บจริงครบทุกหลัก (เลขฐานสองที่มีจำนวนบิตจำกัดเป็นทศนิยมที่จบเสมอ) เช่น 0.1 → `0.100000001490116119384765625`
- `rationalToDecimal(r, maxDigits)`: ผลทางคณิตศาสตร์ที่อาจไม่จบ (เช่น 1/3) ตัดที่ ~40 หลักแล้วต่อท้าย `…`
- ใช้ scientific notation เมื่อ `|x| < 1e−6` หรือ `≥ 1e21` · ค่าที่ยาวมาก (เช่น exact ของ 1e−40) ให้ UI ย่อไว้แล้วกดขยายดูทั้งหมดได้

**`fraction.ts` (บทที่ 2)**: คูณ 2 ซ้ำด้วย Rational (ห้ามใช้ float) หยุดเมื่อเศษเป็น 0 หรือครบ n บิต · จับวงซ้ำด้วยการจำเศษที่เคยเห็น (0.1 = `0.0(0011)₂` วงซ้ำเริ่มบิตที่ 2 ยาว 4 บิต) · คืนค่าประมาณแบบตัดบิต + ผลต่างแบบ exact · รับเฉพาะ `0 ≤ x < 1`

### 4.4 Step model
```ts
type Bit = 0 | 1;
type Fields = { sign: Bit; exp: bigint; frac: bigint };
type FloatClass = 'zero' | 'subnormal' | 'normal' | 'infinity' | 'nan';
type RoundDecision = 'exact' | 'down' | 'up' | 'tie-even-down' | 'tie-even-up';

type Step = { id: string; flow: FlowNode } & (
  | { kind: 'decode'; operand: 'A' | 'B'; bits: bigint; fields: Fields; cls: FloatClass; significand: bigint; exponent: number }
  | { kind: 'special'; rule: SpecialRule; resultBits: bigint }
  | { kind: 'sign'; a: Bit; b: Bit; result: Bit; rule: 'xor' | 'from-larger' }
  | { kind: 'exponent'; mode: 'compare' | 'add-bias' | 'sub-bias'; ea: number; eb: number; biased: number }
  | { kind: 'align'; shift: number; before: bigint; after: bigint; sticky: Bit }
  | { kind: 'sig-add'; a: bigint; b: bigint; op: '+' | '-'; result: bigint }
  | { kind: 'sig-mul'; multiplicand: bigint; multiplier: bigint; swapped: boolean; rows: { bitIndex: number; value: bigint }[]; product: bigint }
  | { kind: 'sig-div'; dividend: bigint; divisor: bigint; rows: { remainder: bigint; subtracted: boolean; qBit: Bit }[]; quotient: bigint; remainder: bigint }
  | { kind: 'normalize'; direction: 'left' | 'right' | 'none'; amount: number; before: bigint; after: bigint; expBefore: number; expAfter: number }
  | { kind: 'range'; outcome: 'ok' | 'overflow' | 'underflow-subnormal' | 'underflow-zero'; denormShift: number }
  | { kind: 'round'; kept: bigint; guard: Bit; round: Bit; sticky: Bit; decision: RoundDecision; carryOut: boolean }
  | { kind: 'encode'; bits: bigint; fields: Fields; hex: string }
);
```
- `id` คงที่และอ่านรู้เรื่อง (เช่น `align`, `round`) ใช้เป็น React key และ deep link `?step=`
- `flow` = ชื่อกล่องใน flowchart ของ operation นั้น (หัวข้อ 8.2)
- ข้อความไทยของแต่ละ step (ชื่อขั้น, คำอธิบาย, เหตุผลที่ปัด) อยู่ใน UI layer `src/content/step-text.ts` ไม่อยู่ใน engine
- type ข้างบนเป็นแนวทาง ปรับชื่อ field ได้ แต่ต้องเป็นข้อมูลล้วน และ UI ต้องไม่ต้องคำนวณอะไรเพิ่ม

### 4.5 Test (Vitest + fast-check) — เป้า coverage ≥ 95% ที่ `src/lib/fp/**`
1. **Golden vectors**: ทุกแถวในภาคผนวก C ต้องตรงทุกบิต รวมรายละเอียดใน steps (G/R/S, ทิศทางและจำนวนการ normalize, จำนวน partial product, biased exponent ที่แสดง)
2. **Oracle binary32**: สุ่ม bit pattern 6 แบบ — 32 บิตใด ๆ · normal · exponent ใกล้ 127 (ค่าที่ใช้ทั่วไป) และคู่ที่ค่าใกล้กัน (ลบหักล้าง) · subnormal · ขอบ (expField 0, 1, 2, 125–128, 253–255 × fraction 0, 1, ค่ามากสุด) · significand สั้น (เกิด tie บ่อย) → ผลของ `addSub`/`mul`/`div` ต้องได้บิตเท่ากับ `Math.fround(a op b)` (อ่าน/เขียนบิตด้วย `DataView`) — NaN เทียบแค่ว่าเป็น NaN ทั้งคู่ · ±0 ต้องเทียบบิต
   - ทำไม `Math.fround` เชื่อได้: ค่า binary32 สองตัวคำนวณใน binary64 แล้วปัดเป็น binary32 จะได้ผลเหมือนคำนวณตรงใน binary32 เสมอสำหรับ + − × ÷ เพราะ 53 ≥ 2·24 + 2
   - `npm test`: แบบละ ≥ 20,000 ครั้งต่อ operation · `npm run test:long`: รวม ≥ 1,000,000 ครั้ง (รันจบ Phase 1 และใน Phase 9)
3. **Exhaustive MINI8** (1-4-3, bias 7): ทุกคู่ 256 × 256 × 4 operation เทียบกับ oracle แบบ brute force ที่เขียนแยก (หาค่า finite ที่ใกล้ที่สุดจากทั้ง 256 ค่า, tie เลือกตัวที่ LSB เป็น 0, ถ้า ≥ ค่ามากสุด + ulp/2 ได้ ∞) — ห้ามเรียก `roundPack` ใน oracle
4. **encodeDecimal**: สุ่มทศนิยมไม่เกิน 9 หลักสำคัญ (exponent −45 ถึง 38) เทียบกับ `Math.fround(Number(s))` + แถว E1–E15 ในภาคผนวก C — ตอนเขียนแผนลองสุ่ม 400,000 ค่าแล้วสองทางตรงกันทั้งหมด ถ้าเจอค่าที่ไม่ตรง ให้ตัดสินด้วยการเทียบระยะแบบ exact (Rational) ว่าผลไหนใกล้ค่าจริงกว่า ถ้าของเราถูกให้เพิ่มเป็น golden vector แทนการแก้ engine ให้ตาม `Number`
5. **Round-trip**: bit pattern สุ่ม (ไม่ใช่ NaN) → `encodeDecimal(shortestDecimal(bits))` ได้บิตเดิม
6. **Invariant ของ steps**: ผลรวม partial products = product · แถวการหารประกอบเป็น Q ได้ตรง · step สุดท้ายเป็น `encode` ที่บิตเท่าผลลัพธ์ · คูณ/หาร normalize ไม่เกิน 1 ตำแหน่ง · `id` ของ step ไม่ซ้ำกัน
7. **บทที่ 1–2**: แถว I1–I3 และ F1–F5 ในภาคผนวก C
8. **parseDecimal**: ข้อความผิดทุกแบบได้ error ถูกประเภท (ว่าง, ตัวอักษรแปลก, มี `,`, ยาวเกิน, exponent ใหญ่เกิน)

---

## 5. Tech stack + นโยบาย version

### 5.1 Stack (latest บน npm ณ 30 ต.ค. 2569 — ใช้เป็น "ขั้นต่ำ")

| package | version | หมายเหตุ |
|---|---|---|
| next / eslint-config-next | 16.4.3 | App Router, Turbopack (ค่าเริ่มต้น), `typedRoutes: true` |
| react / react-dom | 19.3.1 | |
| typescript | **~6.0.3** | TS 7.0.2 ออกแล้ว แต่ `typescript-eslint` 8.72.1 (ที่ eslint-config-next ใช้) ยังรองรับแค่ `<6.1.0` |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | ตั้งค่าใน CSS (`@theme`, `@plugin`) ไม่มี tailwind.config |
| daisyui | 5.7.50 | `@plugin "daisyui"` ใน globals.css |
| motion | 14.8.0 | import จาก `motion/react` (v14 ไม่มี breaking change จาก v13) |
| lucide-react | 1.64.0 | |
| clsx / tailwind-merge | 2.1.1 / 3.7.0 | ฟังก์ชัน `cn()` |
| vitest / @vitest/coverage-v8 | 5.0.5 | ต้องมี `vite` (peer แบบไม่ optional) ล่าสุด 8.3.5 |
| fast-check | 4.10.2 | |
| @playwright/test | 1.64.1 | browser: chromium + webkit |
| @axe-core/playwright | 4.14.0 | ตรวจ accessibility ใน e2e |
| eslint | **^9 (9.39.5)** | ESLint 10.13.0 ออกแล้ว แต่ `eslint-plugin-react` 7.37.5 (ใน eslint-config-next) ยังรองรับแค่ ESLint 9 |
| prettier / prettier-plugin-tailwindcss | 3.9.10 / 0.8.1 | |
| @types/node | **^24 (24.19.2)** | ให้ตรงกับ Node 24 บน Vercel (latest คือ 26.x) |
| tsx | 4.23.15 | รัน script (`test:long`, `shots`) |
| @fontsource/chakra-petch | 5.3.0 | เอาไฟล์ .woff ไปใช้กับ `next/og` (ภาษาไทย) |
| Node | เครื่อง 26.11.1 · Vercel 24.x (ค่าเริ่มต้น) | `"engines": { "node": ">=24" }` |
| npm | 11.20.0 | ใช้ npm ตัวเดียว (lockfile เดียว) |

### 5.2 นโยบาย version
- ติดตั้งด้วย `@latest` แล้วจด version ที่ได้จริงลง `docs/STACK.md` · ถ้า latest ตอนติดตั้งใหม่กว่าตาราง ใช้ตัวใหม่ได้เลย (ตารางคือขั้นต่ำ)
- ข้อยกเว้น 3 ตัว (TypeScript, ESLint, @types/node): ก่อนติดตั้งให้ตรวจซ้ำด้วย `npm view typescript-eslint peerDependencies` และ `npm view eslint-plugin-react peerDependencies` ถ้ารองรับ TS 7 / ESLint 10 แล้วค่อยขยับ แล้วจดเหตุผลใน STACK.md
- ใช้ stable เท่านั้น (ไม่ใช้ beta / rc / canary)
- รัน `npm audit --omit=dev` หลังติดตั้ง แล้วจดผลใน STACK.md

### 5.3 สิ่งที่ตั้งใจ "ไม่ใช้"
- shadcn/ui และ Magic UI แบบติดตั้ง — component ที่ต้องใช้ (BlurFade, AnimatedShinyText, BeamRing) port จาก CoE-Shop เป็นไฟล์ในโปรเจกต์
- KaTeX/MathJax, state library, i18n library, analytics, React Compiler (`--no-react-compiler`), Cache Components (`--no-cache-components`)

---

## 6. โครงสร้างโปรเจกต์
```
ProjectComArch/
├── PLAN.md · CLAUDE.md · AGENTS.md (Next.js สร้าง) · README.md
├── floating_website_requirement/            requirement (ห้ามแก้ 2 ไฟล์เดิมของเพื่อน)
├── docs/
│   ├── PROGRESS.md · QUESTIONS.md · STACK.md · ENGINE.md · REVIEW.md · DEPLOY.md · FINAL_REPORT.md
│   └── reference/coe-shop/                   ไฟล์ธีมจาก CoE-Shop (.txt, อ่านอย่างเดียว)
├── public/
├── scripts/
│   ├── shot.mts                              ถ่าย screenshot (port จาก CoE-Shop)
│   └── test-long.mts                         oracle 1 ล้านกรณี
├── src/
│   ├── app/
│   │   ├── layout.tsx · globals.css · page.tsx (หน้าแรก)
│   │   ├── not-found.tsx · error.tsx · icon.tsx · opengraph-image.tsx · sitemap.ts · robots.ts
│   │   ├── learn/
│   │   │   ├── number-systems/page.tsx       บทที่ 1
│   │   │   ├── binary-fractions/page.tsx     บทที่ 2
│   │   │   ├── ieee-754/page.tsx             บทที่ 3
│   │   │   ├── add-sub/page.tsx              บทที่ 4
│   │   │   └── mul-div/page.tsx              บทที่ 5
│   │   └── lab/page.tsx
│   ├── components/
│   │   ├── glass/      Glass, GlassPill, GlassPointer, LiquidBackground, BeamRing (port)
│   │   ├── ui/         BlurFade, AnimatedShinyText, AnimatedNumber, MotionProvider, CopyButton
│   │   ├── layout/     SiteHeader, MobileNav (drawer), SiteFooter, ChapterHeader, ChapterNav, Toc
│   │   ├── bits/       BitCell, BitRow, FieldLegend, Register, BinaryPoint, HexView, BitInfo
│   │   ├── player/     StepPlayer, StepControls, StepIndicator, Flowchart, usePlayer, PlayerSpeedContext
│   │   ├── viz/        PlaceValue, NumberLine, MultiplyByTwo, Normalize, ExponentCalc, Align, SigAdd,
│   │   │               PartialProducts, LongDivision, RoundGRS, RangeGauge, SpecialCase, ResultCard
│   │   ├── tools/      IntegerExplorer, FractionExplorer, FractionConverter, Ieee754Converter,
│   │   │               FpSimulator (ops ที่เปิดให้เลือก), OperandInput, QuickPicks
│   │   └── content/    Objectives, Callout, Formula, WorkedExample, Summary, Term
│   ├── content/        chapters.ts · glossary.ts · step-text.ts · examples.ts
│   └── lib/
│       ├── fp/         engine (หัวข้อ 4)
│       ├── site.ts     ชื่อเว็บ คำโปรย เครดิต ลิงก์ GitHub siteUrl (ค่าสมมติรวมที่นี่)
│       ├── utils.ts    cn()
│       └── use-media-query.ts (port) · url-state.ts (query ของ Lab)
└── tests/
    ├── unit/fp/*.test.ts
    └── e2e/*.spec.ts
```
- `WorkedExample` รับ input (เช่น `{ op: '*', a: '6.5', b: '2.75' }`) แล้วเรียก engine render เอง — เป็นวิธีเดียวที่ใส่ตัวเลขตัวอย่างลงในเนื้อหาได้ (หัวข้อ 2.6)
- `FpSimulator` ตัวเดียวใช้ทั้งบทที่ 4 (`ops={['+', '-']}`), บทที่ 5 (`ops={['*', '/']}`) และ Lab (ครบ 4)
- input ของตัวอย่าง (A1–A6, M1–M11, D1–D13) และชื่อ/คำอธิบายสั้นเก็บใน `src/content/examples.ts` ที่เดียว ใช้ร่วมกันทั้ง QuickPicks และ WorkedExample · golden test import input จากไฟล์นี้ แต่ค่าที่คาดหวัง (bits, G/R/S) พิมพ์ไว้ในไฟล์ test ตามภาคผนวก C — ตัวอย่างที่โชว์บนเว็บจึงเป็นชุดเดียวกับที่ test ตรวจแล้วเสมอ

---

## 7. หน้าเว็บ เนื้อหา และ acceptance criteria

### 7.1 Layout ทั้งเว็บ
- **Header**: แถบกระจกทรงแคปซูล sticky (แบบ navbar ของ CoE-Shop) — โลโก้ (ไอคอน lucide `Binary` หรือ `Cpu` + ชื่อเว็บ) · desktop: ลิงก์บท 1–5 + Lab (เน้นบทปัจจุบัน) · มือถือ: ปุ่มเมนูเปิด daisyUI `drawer` ด้านขวา มีรายชื่อบทพร้อมคำอธิบายสั้น ๆ
- **หน้าบท (`/learn/*`)**: `ChapterHeader` (เลขบท, ชื่อบท, เวลาอ่านโดยประมาณ, วัตถุประสงค์เป็น GlassPill) → `Toc` (desktop: sticky ด้านข้าง · มือถือ: `collapse` ใต้หัวบท) → เนื้อหาเป็น section ละการ์ดกระจก → เครื่องมือ interactive → **สรุปท้ายบท** (requirement บังคับทุกบท) → `ChapterNav` บทก่อนหน้า/ถัดไป
- **Footer**: ชื่อวิชา (Computer Architecture), แหล่งอ้างอิง (IEEE 754-2019; Patterson & Hennessy, *Computer Organization and Design*), ลิงก์ GitHub repo และเครดิตตามนี้ (Pisit ให้ข้อมูลแล้ว — เก็บใน `site.ts` และพิมพ์ตามนี้ทุกตัวอักษร):
  - จัดทำโดย (เรียงตามรหัสนักศึกษา):
    - 673040127-5 นายพัชรวัฒน์ วิพัธครตระกูล
    - 673040128-3 นายพิสิษฐ์ ศรีชำนาจ
    - 673040136-4 นายเอกสิทธิ์ สุวรรณวงษ์
    - 673040386-1 นายณัฐิวุฒิ แสงสารพันธ์
  - อาจารย์ผู้สอน: ผศ. ดร. จิระเดช พลสวัสดิ์
  - รหัสนักศึกษาใช้ JetBrains Mono (`tabular-nums`) · มือถือแสดงเป็นรายการแนวตั้ง desktop เป็น 2 คอลัมน์ · ยังไม่ใส่รหัสวิชาและชื่อภาค/มหาวิทยาลัย (Q10)
- `metadata` ทุกหน้า: title แบบ `%s · Binary Lab`, description ภาษาไทย, `metadataBase` จาก `site.ts` (Q4) · `viewport`: `themeColor: '#ECF5FF'`, `colorScheme: 'light'`
- ถ้าเครื่องมือ throw error ให้แสดงการ์ด "เครื่องมือนี้มีปัญหา ลองรีเฟรชหน้า" เฉพาะส่วนนั้น ไม่ให้ทั้งหน้าพัง

### 7.2 หน้าแรก `/`
- Hero: ชื่อเว็บ + คำโปรยสั้น ๆ (เช่น "เข้าใจ Floating-Point ทีละบิต") + GlassPill ที่ใช้ AnimatedShinyText "Computer Architecture · IEEE 754" + **demo สด**: register 32 บิตของ `0.1 + 0.2` เล่นทีละขั้นอัตโนมัติแบบช้า ๆ (หยุดเมื่อแตะ/hover/โฟกัส มีปุ่มไปบทที่ 4) — ให้เห็นตั้งแต่หน้าแรกว่า 0.1 + 0.2 ใน float ไม่ได้ 0.3 พอดี
- เส้นทางการเรียน: การ์ด `glass-interactive` 5 บท + Lab แบบ timeline (มือถือแนวตั้ง, desktop เป็น grid) แต่ละใบมีเลขบท ชื่อ สิ่งที่จะได้เรียน และไอคอน
- ทางลัด "ลองเลย": encoder (บทที่ 3), simulator บวก/ลบ, simulator คูณ/หาร, Lab — การ์ดที่เด่นที่สุดใส่ `BeamRing`

### 7.3 บทที่ 1 — `/learn/number-systems` (requirement 3.1–3.4)
- เนื้อหา: ระบบเลขฐานสิบและค่าประจำหลัก (animation แยก 345 = 3×100 + 4×10 + 5×1) → เลขฐานสองใช้แค่ 0 กับ 1 → น้ำหนัก 2⁰…2⁷ → ตัวอย่าง `1011₂ = 8 + 2 + 1 = 11` (StepPlayer) → ช่วงของ unsigned 8 บิตคือ 0–255
- เครื่องมือ **Integer Explorer 8 บิต**: กดบิตสลับ 0/1 (ปุ่มใหญ่ ≥ 44px), แสดงน้ำหนักและค่าที่แต่ละบิตเพิ่ม, ค่าฐานสิบอัปเดตทันที (ตัวเลขนับขึ้นลงแบบ animation), แสดงเลข 8 บิตคู่กับฐานสิบ, preset 0 / 10 / 128 / 255 · เสริม: พิมพ์ฐานสิบ 0–255 แล้วบิตพลิกตาม
- สรุปท้ายบท

### 7.4 บทที่ 2 — `/learn/binary-fractions` (requirement 4.1–4.4)
- เนื้อหา: ค่าประจำหลักทศนิยม 10⁻¹, 10⁻², 10⁻³ → น้ำหนักเศษส่วนฐานสอง 2⁻¹, 2⁻², … → รูปแบบ `0.b₁b₂…` → ตัวอย่าง `0.101₂ = 0.5 + 0.125 = 0.625` → 0.1 ในฐานสองซ้ำไม่จบ → เก็บบิตได้จำกัดจึงได้ค่าประมาณ
- เครื่องมือ **Fraction Explorer 16 บิต**: บิต 2⁻¹…2⁻¹⁶ กดสลับได้ แสดงน้ำหนัก (ทั้งแบบ 1/2…1/65536 และทศนิยม exact) และค่าที่แต่ละบิตเพิ่ม ค่าฐานสิบอัปเดตทันที + **number line 0–1** ที่ marker เลื่อนตามค่า
- เครื่องมือ **Fraction Converter**: พิมพ์ทศนิยม 0 ≤ x < 1 → StepPlayer แสดงการคูณ 2 ทีละแถว (ส่วนจำนวนเต็มที่ได้ "หล่น" ลงช่องบิต) · เลือกจำนวนบิต 8 / 16 / 23 / 32 · ถ้าไม่จบ แสดงค่าประมาณ + ผลต่าง และไฮไลต์ช่วงที่ซ้ำ (0.1 = `0.0(0011)₂`)
- สรุปท้ายบท

### 7.5 บทที่ 3 — `/learn/ieee-754` (requirement 5.1–5.5)
- เนื้อหา: scientific notation ฐานสิบ (`1.25 × 10³`) → normalized ฐานสอง `1.xxx × 2ᵉ` → ทำไมต้องมี floating-point → layout 1-8-23 (register สีตามหัวข้อ 9.4) → bias 127 (และเหตุผล: เทียบขนาดได้ง่ายเหมือนจำนวนเต็ม) → hidden bit → ตัวอย่าง encode `5.75` และ `−13.25` → ตัวอย่าง decode `0x3E200000` = 0.15625 → `0.1` เก็บไม่พอดี → ตารางสั้น ๆ ว่า exponent field 0 และ 255 หมายถึงอะไร (zero/subnormal, ∞/NaN)
- เครื่องมือ **IEEE 754 Converter** เป็น daisyUI `tabs` 2 โหมด (requirement 5.3):
  - Encode: พิมพ์ทศนิยม → StepPlayer 7 ขั้น (หัวข้อ 4.3) + register 32 บิต + hex · **แจ้งชัดเจนเมื่อค่าที่เก็บจริงไม่เท่ากับค่าที่ป้อน** พร้อมผลต่าง · ค่าเกินช่วงบอกว่ากลายเป็น ∞ · ค่าเล็กมากบอกว่าเป็น subnormal หรือ 0
  - Decode: กดบิตได้ทั้ง 32 ช่อง + ช่องพิมพ์บิต (รับช่องว่าง/ขีดคั่น) หรือ hex 8 หลัก → แยก field แสดงวิธีตีความทีละขั้น และค่าที่ถอดได้
  - ระบุข้อจำกัดในหน้า (Single Precision, ปัดแบบ ties to even)
- สรุปท้ายบท

### 7.6 บทที่ 4 — `/learn/add-sub` (requirement 6.1–6.4)
- เนื้อหา: ทำไมบวกเลข floating-point ตรง ๆ ไม่ได้ (exponent ไม่เท่ากัน) → 7 ขั้นตาม requirement 6.2 → บิต Guard/Round/Sticky และกฎ Round to nearest, ties to even → ระบุว่าเป็นแบบจำลองเพื่อการเรียนรู้ ไม่ใช่รายละเอียดของวงจรจริงทุกแบบ (requirement บังคับ)
- ตัวอย่าง (render จาก engine): A1 `0.5 + (−0.4375)` · A2 `0.1 + 0.2` · A3 `1 + 1e-8` (ตัวเล็กหายไปทั้งตัว) · A4 `16777216 + 1` และ A5 `16777216 + 3` (tie ไปทางเลขคู่) · A6 `1.0000001 − 1` (ลบหักล้างแล้ว normalize ซ้ายหลายบิต)
- เครื่องมือ **FpSimulator (+/−)** ตาม requirement 6.3 + flowchart + แผงเทียบ 3 ค่า "ค่าที่พิมพ์ / ผลแม่นยำของค่าที่เก็บจริง / ผล float" พร้อมผลต่าง + QuickPicks A1–A6
- สรุปท้ายบท

### 7.7 บทที่ 5 — `/learn/mul-div` (requirement ส่วนเพิ่ม 7.1–7.6)
- เนื้อหา: ตารางเทียบกับบวก/ลบ → คูณ 8 ขั้น (เน้นว่าทำไมต้องลบ bias หนึ่งครั้ง และผลคูณอยู่ใน [1, 4)) → หาร 8 ขั้น (บวก bias กลับหนึ่งครั้ง, ผลหารอยู่ใน (0.5, 2), sticky มาจากเศษ) → ตารางกรณีพิเศษ + IEEE exception → ข้อผิดพลาดที่เจอบ่อย (ลืมลบ bias, ลืม hidden bit, ใส่ sign ผิด)
- ตัวอย่าง M1–M6 และ D1–D5 ตาม requirement (render จาก engine) — M3 และ D3 อธิบายละเอียดทุกขั้น
- เครื่องมือ **FpSimulator (×/÷)**: PartialProducts, LongDivision, ExponentCalc (ฐานสิบ + ฐานสอง 8 บิต), RoundGRS, RangeGauge, SpecialCase, flowchart, QuickPicks (M1–M6, D1–D5, `0`, `−0`, `∞`, `−∞`, `NaN`)
- สรุปท้ายบท

### 7.8 Lab — `/lab`
- daisyUI `tabs` 2 แท็บ: **Converter** (encode/decode จากบทที่ 3) และ **Calculator** (FpSimulator ครบ + − × ÷)
- **Share link**: state อยู่ใน query string เช่น `/lab?tab=calc&op=mul&a=0.1&b=3&step=round` · ปุ่ม "คัดลอกลิงก์" (lucide `Link`) · component ที่อ่าน `useSearchParams` ต้องอยู่ใน `<Suspense>` (ไม่งั้น build พัง) · ค่าใน URL ผิดรูปแบบให้ใช้ค่าเริ่มต้นและแจ้งเตือนสั้น ๆ
- (stretch, Phase 7) เลือก format binary16 / binary32 / binary64 — engine รองรับอยู่แล้ว เหลือ UI ที่ต้องรองรับ 16/64 บิต (64 บิตบนมือถือตัดเป็น 2 แถว)

### 7.9 คำศัพท์ (ใช้ให้ตรงกันทั้งเว็บ — เก็บใน `src/content/glossary.ts` + `Term` แสดงความหมายเมื่อเจอครั้งแรกในแต่ละบท แตะดูได้บนมือถือ)

| คำที่ใช้ | ความหมาย | หมายเหตุ |
|---|---|---|
| บิต (bit) | หลักของเลขฐานสอง | |
| Sign / Sign bit | บิตเครื่องหมาย 0 = บวก, 1 = ลบ | |
| Exponent | ส่วนเลขชี้กำลัง เก็บแบบมี bias | |
| Bias | ค่าที่บวกเพิ่มให้ exponent (Single Precision = 127) | |
| Biased exponent | ค่าที่อยู่ใน field Exponent = exponent จริง + 127 | |
| Fraction | 23 บิตหลังจุดที่เก็บจริง | ใช้แทน "mantissa" (บอกครั้งเดียวว่าบางตำราเรียก mantissa) |
| Significand | `1.Fraction` รวม hidden bit (24 บิต) | |
| Hidden bit | เลข 1 หน้าจุดที่ไม่ได้เก็บจริงในค่า normalized | |
| Normalize | เลื่อนจุดให้อยู่ในรูป `1.xxx × 2ᵉ` | |
| Guard / Round / Sticky (G/R/S) | 3 บิตถัดจากบิตสุดท้ายที่เก็บได้ ใช้ตัดสินการปัด · Sticky = OR ของบิตที่เหลือทั้งหมด | |
| Round to nearest, ties to even | ปัดไปค่าที่ใกล้ที่สุด ถ้าอยู่กึ่งกลางพอดีให้บิตสุดท้ายเป็น 0 | |
| Overflow / Underflow | ผลใหญ่เกินช่วง (ได้ ±∞) / เล็กกว่าค่า normalized ที่เล็กที่สุด (ได้ subnormal หรือ 0) | |
| Subnormal | ค่าที่ exponent field = 0 ไม่มี hidden bit | บางตำราเรียก denormal |
| Infinity (∞), NaN | ค่าพิเศษเมื่อ exponent field = 255 | NaN = Not a Number |
| Partial product | ผลคูณย่อยแต่ละแถว | |
| Multiplicand / Multiplier | ตัวตั้ง / ตัวคูณ | |
| Dividend / Divisor / Quotient / Remainder | ตัวตั้ง / ตัวหาร / ผลหาร / เศษ | |
| Single Precision (binary32) | รูปแบบ 32 บิต: 1-8-23 | |

---

## 8. Animation แบบกดได้ (StepPlayer) — FR-07

### 8.1 StepPlayer (component กลาง ใช้ทุกบท)
- รับ `steps` (จาก engine หรือ helper ของบทที่ 1–2), `renderStep(step, index)` และ `flow` (ข้อมูล flowchart ถ้ามี)
- **ปุ่มควบคุม** (daisyUI `join` + `btn`): ย้อนกลับ (`ChevronLeft`) · เล่น/หยุด (`Play`/`Pause` สลับด้วย daisyUI `swap`) · ถัดไป (`ChevronRight`) · เริ่มใหม่ (`RotateCcw`) · ความเร็ว 0.5× / 1× / 1.5× / 2× · ตัวนับ "ขั้นที่ 3/8"
- **StepIndicator** (daisyUI `steps`): ทุกขั้นกดกระโดดได้ (แต่ละ `li` มี `button` ข้างใน), ขั้นที่ผ่านแล้วและขั้นปัจจุบันใช้ `step-primary` · มือถือเลื่อนแนวนอนได้และเลื่อนให้ขั้นปัจจุบันอยู่ในจอเสมอ
- **เล่นอัตโนมัติ**: ขั้นละ ~2.4 วินาที ÷ ความเร็ว หยุดเองที่ขั้นสุดท้าย · ผู้ใช้กดอะไรระหว่างเล่น → หยุดเล่นอัตโนมัติ
- **คีย์บอร์ด** (เฉพาะเมื่อโฟกัสอยู่ใน player ห้ามดักทั้งหน้า): ← → เปลี่ยนขั้น, Space เล่น/หยุด, Home เริ่มใหม่ · player เป็น `role="region"` มี `aria-label` และ `tabIndex={0}` · desktop แสดง `kbd` บอกปุ่มลัด
- `aria-live="polite"` อ่านชื่อขั้นเมื่อเปลี่ยน
- **ย้อนกลับได้จริง**: แต่ละขั้น render สถานะของตัวเองครบ (ไม่ขึ้นกับว่าดูขั้นก่อนหน้ามาหรือไม่) แล้วให้ motion animate ระหว่างสถานะทั้งไปและกลับ
- **แตะที่บิตได้**: ทุกบิตใน register เป็น `button` → แผง `BitInfo` ใต้ภาพบอก field, ตำแหน่งบิต, น้ำหนัก, ค่าที่บิตนั้นเพิ่ม — ไม่ใช้ hover อย่างเดียว
- input เปลี่ยน → สร้าง steps ใหม่แล้วกลับไปขั้นแรก (Lab อ่าน `?step=` ได้)
- จองพื้นที่ภาพแต่ละขั้นด้วย `min-height` กันหน้ากระตุก (CLS)

### 8.2 รายการ animation ตามบท

| บท | ภาพ/animation | ผู้ใช้กดทำอะไรได้ |
|---|---|---|
| 1 | PlaceValue: ตัวเลข 3-4-5 แยกลงช่องหลักร้อย/สิบ/หน่วยแล้วคูณน้ำหนัก · บิตพลิกแบบการ์ด · น้ำหนักของบิตที่เป็น 1 ลอยเข้าผลรวม · เลขฐานสิบนับขึ้น/ลง (AnimatedNumber) | กดบิต, preset, พิมพ์ฐานสิบ, step ตัวอย่าง 1011₂ |
| 2 | NumberLine 0–1: marker เลื่อนตามค่า + แถบสะสมความยาว 2⁻ᵏ · MultiplyByTwo: คูณ 2 ทีละแถวแล้วส่วนจำนวนเต็มหล่นลงช่องบิต · วงซ้ำไฮไลต์ + ขีดบน | กดบิต, เลือกจำนวนบิต, step การแปลง |
| 3 | Encode: แยกส่วนเต็ม/ส่วนเศษ → Normalize (จุดเลื่อนทีละตำแหน่ง ตัวนับ exponent วิ่งตาม) → ExponentCalc (`e + 127` เป็นฐานสอง) → บิต fraction บินเข้าช่อง 23 บิต + G/R/S → 3 field ประกอบเป็น register แล้วแปลง hex ทีละ 4 บิต · Decode: ทางกลับกัน + สูตรเติมค่าทีละส่วน | step, กดบิตในโหมด decode, **ปุ่มเลื่อนจุดเองในขั้น Normalize** (← → จนได้ 1.xxx แล้วขึ้นว่าถูก) |
| 4 | Align: significand ตัวเล็กเลื่อนขวาทีละบิต บิตที่ตกขอบไหลลงช่อง Sticky · SigAdd: บวก/ลบแนวตั้งพร้อมตัวทด · Normalize · RoundGRS: ดู G/R/S แล้วชี้ทางปัดขึ้น/ลง/tie · Flowchart ไฮไลต์ขั้นปัจจุบัน | step, **ปุ่ม "เลื่อนทีละบิต"** ในขั้น Align, กดกล่อง flowchart, QuickPicks |
| 5 | Sign: XOR สองขา · ExponentCalc: บวก/ลบ exponent แล้วแก้ bias (ฐานสิบ + ฐานสอง 8 บิต) · PartialProducts: แถวโผล่ทีละแถวตามบิต 1 ของตัวคูณ แล้วรวมเป็นผลคูณ 48 บิต · LongDivision: แถวเทียบ/ลบ/บิตผลหารทีละแถว (มีปุ่มข้ามไปแถวสุดท้าย) เศษสุดท้ายกลายเป็น Sticky · Normalize (คูณเลื่อนขวา หารเลื่อนซ้าย) · RoundGRS · RangeGauge: exponent อยู่ในช่วง 1–254 หรือเกิน · SpecialCase: การ์ดกฎ เช่น 0 × ∞ = NaN | step, กดกล่อง flowchart, ดูทุกแถวของการหาร, QuickPicks รวมค่าพิเศษ |

**Flowchart** (บทที่ 4–5 และ Lab): กล่องตามขั้นของ algorithm เช่น คูณ: Decode → Sign → Exponent → Multiply significands → Normalize → Overflow/Underflow? → Round → Still normalized? → Encode · กล่องปัจจุบันเรืองแสง + `BeamRing` · กดกล่องแล้วกระโดดไปขั้นนั้น · desktop วางด้านข้างภาพ · มือถือย่อเป็นแถบแนวนอนเหนือภาพ · วาดเอง ไม่ยก figure จากตำรา

### 8.3 กติกาเทคนิค
- ใช้ `motion/react`: `layout`/`layoutId` ให้บิตเลื่อนตำแหน่งเอง, `AnimatePresence` กับแถวที่โผล่/หาย, spring `{ type: 'spring', stiffness: 420, damping: 36 }` สำหรับบิต · duration ทั้งหมดหารด้วยความเร็วของ player (`PlayerSpeedContext`)
- motion รายบิตใช้กับ register หลักเท่านั้น (ไม่เกิน ~100 บิตบนจอ) · ตาราง partial products / การหารยาว render แต่ละแถวเป็น element เดียว (ข้อความ mono) แล้ว animate ทั้งแถว — ห้ามทำ motion รายบิตกับแถว 48 บิตหลายสิบแถว
- animate เฉพาะ `transform` และ `opacity` (ห้าม animate blur, width/height, box-shadow บน element จำนวนมาก)
- `MotionConfig reducedMotion="user"` + CSS `prefers-reduced-motion`: ลดการเคลื่อนไหวแล้วยังเปลี่ยนขั้นได้ครบ แค่ตัดภาพทันที
- client component เท่าที่จำเป็น: เนื้อหาบทเป็น server component เฉพาะเครื่องมือ/player เป็น `'use client'`

---

## 9. UI/UX: Liquid Glass ฟ้า-ขาว + daisyUI

### 9.1 ทิศทางการออกแบบ (ธีมเดียวกับ CoE Shop — coekku.shop)
Liquid Glass ของ CoE Shop คือแผงกระจกขาวโปร่งลอยบนพื้นไล่สีฟ้า-ขาว:
- **กระจกปกติ** `.glass`: พื้นขาวโปร่ง `#FFFFFFB8` + `backdrop-filter: blur(12px) saturate(160%)` + ring 1px สี foreground/10 + เงา inset ขาวที่ขอบบน (แสงสะท้อนขอบกระจก) + เงานุ่มด้านล่าง มุม `rounded-xl`
- **กระจกลอยสูง** `.glass-raised`: `blur(16px) saturate(170%)` เงาลึกขึ้น — ที่นี่ใช้กับแถบควบคุม player, drawer เมนู, การ์ดผลลัพธ์
- **กระจกเกือบทึบ** `.glass-solid`: ขาว 94% — ใช้กับ **register บิต ตาราง partial product ตารางการหาร** และข้อมูลแน่น ๆ ที่ต้องอ่านง่าย
- **กระจกที่กดได้** `.glass-interactive`: แสง specular วิ่งตามเมาส์ (GlassPointer เขียน `--gx/--gy/--go`) + ขอบสว่างตามเมาส์ + ยกขึ้น 2px ตอน hover + ยุบ scale .98 ตอนกด · จอสัมผัส: แสงขึ้นตรงจุดที่แตะแล้วจางใน ~600ms
- ของประกอบ: GlassPill (ป้ายกระจกทรงแคปซูล), BeamRing (ไฟวิ่งรอบขอบด้วย conic-gradient), ตัวหนังสือ shiny (AnimatedShinyText)
- **พื้นใต้กระจก** (LiquidBackground): fixed layer ไล่สี `#F5FAFF` → `#ECF5FF` → `#FFFFFF` + blob สีฟ้า 5 ก้อน (radial-gradient ไม่ใช้ blur filter) + grid blueprint เส้น `#C8D6EC` ช่อง 32px opacity 25% (เข้ากับเรื่องบิตและวงจรของวิชานี้พอดี)
- เป็นกระจกแบบ blur + saturate + แสงสะท้อน **ไม่ทำ**การหักเหแสงด้วย SVG displacement
- **Performance**: จอสัมผัสปิด backdrop blur และแสงตามเมาส์ (iPhone Safari กระตุก) ใช้พื้นทึบขึ้นแทน · กระจกซ้อนกันไม่เกิน 3–4 ชั้นต่อจอ · blur บนพื้นที่ใหญ่ไม่เกิน 20px · Safari ต้องใส่ค่า `backdrop-filter` ตรง ๆ ห้ามใช้ CSS variable · มี fallback ทึบเมื่อ `prefers-reduced-transparency` หรือ browser ไม่รองรับ backdrop-filter
- **สว่างอย่างเดียว** ไม่มี dark mode · ไม่ใช้ emoji ใช้ lucide-react
- สี: ตัวหนังสือ `#0B1B4D` · primary `#2563EB` · navy `#102880` / `#0A1A5C` · ฟ้าสด `#38B6FF` · ฟ้าอ่อน `#CCE7FF` / `#ECF5FF` · เส้น `#C8D6EC`
- ฟอนต์ (`next/font/google`): หัวข้อ Chakra Petch · เนื้อหา IBM Plex Sans Thai (ทั้งคู่ subset `thai` + `latin`) · ตัวเลข/บิต/โค้ด JetBrains Mono (subset `latin` อย่างเดียว ใส่ thai แล้ว error) ใช้ `tabular-nums`
- animation ของหน้า: `rise` / `pop` ตอนโผล่, BlurFade ตอนเลื่อนถึง — ปิดทั้งหมดเมื่อ `prefers-reduced-motion`
- ภาษาไทย: line-height เนื้อหา ≥ 1.5, หัวข้อ ≥ 1.35 (ห้ามใช้ `leading-none` กับข้อความไทยเพราะสระ/วรรณยุกต์โดนตัด) · input font-size 16px กัน iOS ซูม

### 9.2 ยกโค้ดจาก CoE-Shop (`docs/reference/coe-shop/` อ่านอย่างเดียว)

| ไฟล์อ้างอิง (ต่อท้าย `.txt`) | ไปเป็น | ต้องปรับ |
|---|---|---|
| `src/app/globals.css` | `src/app/globals.css` | ตัด import `tw-animate-css`, `shadcn/tailwind.css` และ token แบบ shadcn ออก · เพิ่ม daisyUI (ข้อ 9.3) · `var(--primary)` ใน `.glass-interactive::after` → `var(--color-primary)` · `@layer base` เปลี่ยน `border-border outline-ring/50` เป็น `border-line outline-sky-400/50` |
| `src/components/glass/glass.tsx` | ที่เดิม | ใช้ `bg-card`, `ring-foreground/10` ได้เลยเพราะประกาศ `--color-card`, `--color-foreground` ใน `@theme` |
| `src/components/glass/glass-pointer.tsx`, `liquid-background.tsx`, `beam-ring.tsx` | ที่เดิม | ไม่ต้องแก้ |
| `src/components/ui/blur-fade.tsx` | ที่เดิม | ไม่ต้องแก้ |
| `src/components/ui/animated-shiny-text.tsx` | ที่เดิม | ตัด class `dark:` และเปลี่ยน `text-neutral-600/70` เป็น `text-ink/60` |
| `src/components/providers/motion-provider.tsx` | `src/components/ui/motion-provider.tsx` | ไม่ต้องแก้ |
| `src/components/shop/navbar.tsx` | แนวทางของ `SiteHeader` | เอาโครงแถบแคปซูล + `[@media(hover:none)]:bg-white/92` ตัด next-intl/ตะกร้า/บัญชี |
| `src/components/shop/animated-baht.tsx` | แนวทางของ `AnimatedNumber` | ตัดเรื่องเงิน/locale เหลือ tween ตัวเลข + reduced motion |
| `src/lib/utils.ts` | `src/lib/utils.ts` | ใช้ `clsx` + `tailwind-merge` แทน package `cn` |
| `src/lib/use-media-query.ts` | ที่เดิม | ไม่ต้องแก้ |
| `src/app/layout.tsx` | แนวทางของ `layout.tsx` | ฟอนต์ 3 ตัว (ไม่เอา Barlow), `viewport`, ลำดับ `MotionProvider` > `LiquidBackground` + `GlassPointer` · ตัด next-intl/cart/in-app gate/Toaster · `lang="th"` |
| `src/components/brand/icon-art.tsx` | แนวทางของ `icon.tsx` / `opengraph-image.tsx` | `next/og` + โหลดฟอนต์ .woff จาก `@fontsource/chakra-petch` (ข้อความไทยใช้ไฟล์ subset `thai`) |
| `src/app/not-found.tsx`, `src/app/error.tsx` | แนวทาง | เขียนข้อความใหม่ทั้งหมด |
| `scripts/shot.mts`, `playwright.config.ts`, `vitest.config.mts`, `eslint.config.mjs`, `.prettierrc.json`, `postcss.config.mjs` | ไฟล์เดียวกัน | ตัดส่วน DB/auth/env/login ออก |

### 9.3 โครง `src/app/globals.css`
```css
@import 'tailwindcss';

/* daisyUI 5: theme ของเราตัวเดียว · exclude glass เพราะ .glass ของ daisyUI ชื่อชนกับ .glass ของเรา
   · exclude rootcolor เพราะเราตั้งพื้นหลัง html เอง */
@plugin "daisyui" {
  themes: false;
  exclude: glass, rootcolor;
  logs: false;
}
@plugin "daisyui/theme" {
  name: "binarylab";
  default: true;
  prefersdark: false;
  color-scheme: light;
  --color-base-100: #ffffff;
  --color-base-200: #f5faff;
  --color-base-300: #ecf5ff;
  --color-base-content: #0b1b4d;
  --color-primary: #2563eb;
  --color-primary-content: #ffffff;
  --color-secondary: #102880;
  --color-secondary-content: #ffffff;
  --color-accent: #38b6ff;
  --color-accent-content: #0a1a5c;
  --color-neutral: #0a1a5c;
  --color-neutral-content: #ecf5ff;
  --color-info: #0369a1;
  --color-info-content: #ffffff;
  --color-success: #15803d;
  --color-success-content: #ffffff;
  --color-warning: #b45309;
  --color-warning-content: #ffffff;
  --color-error: #c62828;
  --color-error-content: #ffffff;
  --radius-selector: 1rem;
  --radius-field: 0.75rem;
  --radius-box: 0.875rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 1;
  --noise: 0;
}

/* ไม่ต้องสแกนเอกสาร (มีชื่อ class ใน code block เยอะ) */
@source not "../../docs";
@source not "../../floating_website_requirement";
@source not "../../PLAN.md";

@theme inline {
  --font-sans: var(--font-plex-sans-thai), 'IBM Plex Sans Thai', system-ui, sans-serif;
  --font-display: var(--font-chakra-petch), 'Chakra Petch', var(--font-plex-sans-thai), sans-serif;
  --font-mono: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
}

@theme {
  /* โทนฟ้า-ขาวของ CoE Shop */
  --color-navy-950: #0a1a5c;
  --color-navy-900: #102880;
  --color-sky-400: #38b6ff;
  --color-sky-200: #cce7ff;
  --color-ice-100: #ecf5ff;
  --color-ice-50: #f5faff;
  --color-line: #c8d6ec;
  --color-ink: #0b1b4d;
  --color-muted: #54648a;
  --color-card: #ffffffb8;
  --color-foreground: #0b1b4d;
  /* สีของบิต (ข้อ 9.4) */
  --color-bit-sign: #d55e00;
  --color-bit-sign-ink: #a64300;
  --color-bit-exp: #009e73;
  --color-bit-exp-ink: #007553;
  --color-bit-frac: #2563eb;
  --color-bit-frac-ink: #1d4ed8;
  --color-bit-grs: #cc79a7;
  --color-bit-grs-ink: #963f73;
  /* + --animate-shiny-text และ @keyframes shiny-text ยกจาก reference */
}

:root { --tb-border: #c8d6ec; }

@layer base {
  /* ยกจาก reference: html พื้น #f5faff, body โปร่ง + line-height 1.6, h1–h3 1.35, input 16px, -webkit-tap-highlight-color */
}

@layer utilities {
  /* ยกจาก reference ทั้งชุด: .num, .glass, .glass-raised, .glass-solid, .glass-interactive (+ ::before/::after),
     .tb-blueprint, .tb-rise, .tb-pop, .tb-glow + keyframes, media (hover: none), @supports,
     prefers-reduced-transparency, prefers-reduced-motion, .beam-ring + @property --beam-angle */
}
```
- เปิด Context7 ตรวจก่อนว่า syntax ของ daisyUI 5.7 (`themes`, `exclude`, `daisyui/theme`) และ `@source not` ยังเป็นแบบนี้ ถ้าต่างให้ทำตาม docs แล้วจดใน PROGRESS.md
- daisyUI ให้ utility สี `bg-primary`, `text-base-content` ฯลฯ ส่วนสีของเรา (`bg-ice-50`, `text-ink`, `bg-bit-exp/14`) มาจาก `@theme`

### 9.4 สีของบิต (FR-08) — ใช้ชุดนี้ทุกบท

| ส่วน | สีหลัก (ขอบ/พื้น) | สีตัวอักษร | หมายเหตุ |
|---|---|---|---|
| Sign | `#D55E00` | `#A64300` | |
| Exponent | `#009E73` | `#007553` | |
| Fraction / Significand | `#2563EB` | `#1D4ED8` | |
| Hidden bit | สีเดียวกับ Fraction | `#1D4ED8` | ขอบเส้นประ + ป้าย "hidden" |
| Guard / Round / Sticky | `#CC79A7` | `#963F73` | |
| ไฮไลต์ "เปลี่ยนในขั้นนี้" | `#38B6FF` | — | วงแหวน + `tb-glow` |

- สีหลักมาจากชุด Okabe-Ito ที่คนตาบอดสีแยกได้ · สีตัวอักษรตรวจ contrast แล้ว ≥ 4.5:1 ทั้งบนพื้นขาว บนกระจก และบนพื้นอ่อน 14% ของสีตัวเอง
- `BitCell`: บิต 1 = พื้นสีของ field 14% + ตัวหนา · บิต 0 = พื้น 6% · ขอบล่าง 2px สีหลัก · ตัวอักษร JetBrains Mono
- ต้องมีป้ายชื่อ field (S / Exponent / Fraction) เหนือกลุ่มบิตเสมอ ไม่ใช้สีอย่างเดียว · จุดฐานสอง (`.`) เป็น element แยก (`BinaryPoint`) เพื่อ animate การเลื่อนจุดได้

### 9.5 ใช้ daisyUI ร่วมกับกระจก

| ใช้ทำอะไร | daisyUI | วิธีทำให้เข้ากับกระจก |
|---|---|---|
| ปุ่ม | `btn btn-primary`, `btn-ghost`, `btn-sm`, `btn-circle` | ปุ่มรองบนกระจกใช้ `btn-ghost` + `glass bg-card` |
| ควบคุม player | `join`, `swap` (เล่น/หยุด), `range` หรือ `select` (ความเร็ว), `kbd` | แถบควบคุมวางบน `glass-raised` |
| ตัวบอกขั้น | `steps` | พื้นโปร่ง, `step-primary` |
| เลือกโหมด/operation | `tabs tabs-box` | ใส่ `glass bg-card` ที่ตัว tabs |
| ช่องกรอก | `input`, `fieldset`, `label`, `validator` | error ภาษาไทยใต้ช่อง ผูกด้วย `aria-describedby` |
| แจ้งเตือน | `alert alert-warning` / `alert-info` / `alert-error` | ค่าที่เก็บ ≠ ค่าที่ป้อน, overflow, ข้อจำกัดของเครื่องมือ |
| ป้าย | `badge` | ชื่อ field, flags (inexact, overflow, …) |
| เนื้อหาพับได้ | `collapse` | "ดูทุกแถว", "ค่าที่เก็บจริงแบบเต็ม", TOC บนมือถือ |
| ตาราง | `table table-sm` | วางใน `glass-solid` |
| เมนูมือถือ | `drawer drawer-end` + `menu` | แผงเมนู `glass-raised` (มือถือเป็นพื้นทึบ) |
| tooltip | `tooltip` | ใช้กับปุ่มไอคอนบน desktop เท่านั้น ข้อมูลสำคัญต้องแตะดูได้ (`BitInfo`, `Term`) |

- ไม่ใช้ `card` ของ daisyUI เป็นพื้นผิว — พื้นผิวทั้งหมดใช้ `<Glass>`

### 9.6 Mobile-first + ขนาดจอ
- ออกแบบที่ 390×844 ก่อน แล้วไล่ 360, 430, 768, 1280 และ 1920 (จอโปรเจกเตอร์) — ห้ามมี horizontal scroll ทั้งหน้า
- register 32 บิตบนจอ 360px แคบเกินกว่าจะกดทีละบิต → มือถือแสดง 2 แถว (Sign + Exponent / Fraction) หรือแถวเดียวที่ย่อไว้แล้วแตะเพื่อขยายเป็นแผงกดบิต — เครื่องมือที่ต้องกดบิตต้องมีเป้ากด ≥ 44×44px
- ตาราง 48 บิต (partial products) เลื่อนแนวนอนได้เฉพาะในกล่องของตัวเอง
- ระยะขอบข้าง 16px · ใช้ `100dvh` ไม่ใช้ `100vh` · เผื่อ safe-area · ทุก interaction ทำได้ด้วยการแตะ
- desktop 1280+: เนื้อหากว้างสุด ~72ch เครื่องมือกว้างได้ถึง ~1100px flowchart อยู่ข้างภาพ
- จอโปรเจกเตอร์ 1920: บิตและตัวเลขต้องใหญ่พออ่านจากท้ายห้อง (ใช้ `clamp()` กับขนาดบิต)

### 9.7 Accessibility
- คีย์บอร์ดใช้ได้ทุกอย่าง, focus ring ชัด (outline ฟ้าสด), ลำดับ tab สมเหตุสมผล
- บิตที่กดได้: `button` + `aria-pressed` + `aria-label` เช่น "บิตที่ 30, Exponent, ค่า 1" · ใน explorer ใช้ลูกศรซ้าย/ขวาย้ายโฟกัสระหว่างบิต (roving tabindex)
- ผลลัพธ์ที่เปลี่ยนตาม input ใช้ `aria-live="polite"` · ข้อความ error ผูกกับช่องกรอกด้วย `aria-describedby`
- contrast ≥ 4.5:1 สำหรับข้อความทั้งหมดบนพื้นที่แย่ที่สุด · axe ต้องไม่มี serious/critical (หัวข้อ 10)

### 9.8 ของเล็ก ๆ ที่ต้องมี
- `icon.tsx` ทำเอง (เช่นกล่อง 3 สี Sign/Exponent/Fraction เรียงกัน) ห้าม emoji
- `opengraph-image.tsx` 1200×630 สไตล์เดียวกับเว็บ: ชื่อเว็บ + register 32 บิต 3 สี + "สื่อการสอน Floating-Point · IEEE 754" (ต้องโหลดฟอนต์ไทยให้ `next/og` ไม่งั้นภาษาไทยเป็นกล่อง) — สำคัญเพราะลิงก์จะถูกแชร์ใน LINE
- `sitemap.ts`, `robots.ts` · หน้า 404 / error ตามธีม
- `next.config.ts`: `typedRoutes: true` · headers `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` · **ไม่ตั้ง** `X-Frame-Options` (หัวข้อ 3.2)

---

## 10. Testing

### 10.1 Unit
- engine ตามหัวข้อ 4.5 + helper ของ UI ที่มี logic (`url-state.ts`, glossary มีครบทุกคำที่ `Term` เรียกใช้)

### 10.2 E2E (Playwright)
- projects: `pixel7` (Chromium), `iphone13` (WebKit), `desktop` (Desktop Chrome), `shots` · `reporter: 'line'`
- `webServer`: `npm run build && npm run start -- -p 3100` (ตั้ง `E2E_DEV=1` เพื่อใช้ `next dev` ตอนทำงานเร็ว ๆ) — แนวทางจาก `docs/reference/coe-shop/playwright.config.ts.txt`
- ข้อที่ต้องมี:
  1. หน้าแรก → ไปได้ครบ 5 บท + Lab ทั้งจากเมนู desktop และ drawer มือถือ · ปุ่มบทก่อน/ถัดไป · ทุกบทมี section สรุปท้ายบท
  2. บทที่ 1: กดบิตให้เป็น `00001010` → ฐานสิบ 10 · preset 255 → `11111111`
  3. บทที่ 2: converter `0.1` ที่ 16 บิต → `0001100110011001`, ค่าประมาณ `0.0999908447265625`, ผลต่าง `0.0000091552734375` และไฮไลต์วงซ้ำ · `0.375` → `0.011` ผลต่าง 0
  4. บทที่ 3: encode `5.75` → `0x40B80000` · `-13.25` → `0xC1540000` · `0.1` ขึ้นแจ้งเตือนว่าค่าที่เก็บไม่เท่ากับค่าที่ป้อน · decode บิตของ 5.75 → 5.75 · ใส่ 31 บิต → error ภาษาไทยที่อ่านรู้เรื่อง
  5. บทที่ 4: `0.1 + 0.2` → `0x3E99999A` · ปุ่มถัดไป/ย้อนกลับ/เล่น, กดขั้นใน indicator และปุ่มลูกศรบนคีย์บอร์ดทำงาน · กดกล่อง flowchart แล้วกระโดดขั้น
  6. บทที่ 5: `6.5 × 2.75` → `0x418F0000` มี partial product 3 แถว · `1 ÷ 3` → `0x3EAAAAAB` ขั้นปัดแสดง G=1 R=0 S=1 · `1 ÷ 0` → +∞ พร้อมคำอธิบาย · `0 ÷ 0` → NaN · `3e38 × 10` → +∞ (overflow)
  7. Lab: เปิด URL ที่มี query → ได้ state เดียวกัน · ปุ่มคัดลอกลิงก์ให้ URL ที่เปิดซ้ำแล้วได้หน้าเดิม
  8. Reduced motion (`reducedMotion: 'reduce'`): StepPlayer ยังเปลี่ยนขั้นได้ครบ
  9. ไม่มี console error ทุกหน้า
  10. axe (`@axe-core/playwright`) ทุกหน้า: ไม่มี violation ระดับ serious/critical

### 10.3 Visual review
- `npm run shots` ถ่ายทุกหน้า (และ state สำคัญ เช่น simulator ตอนอยู่ขั้น round) ที่ 360 / 390 / 430 / 768 / 1280 / 1920 เก็บใน `test-results/shots/` (gitignore) — **เปิดดูรูปจริง** แล้วจดปัญหาใน `docs/REVIEW.md`
- ถ่ายทั้ง Chromium และ WebKit อย่างน้อยหน้าแรกและบทที่ 5 (Safari แสดง backdrop-filter ต่างจาก Chrome)

### 10.4 Lighthouse (Phase 7 และ 9)
- `npx lighthouse@latest http://localhost:3100/<path> --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --output=json --output-path=test-results/lh-<page>.json --chrome-flags="--headless=new"` (ถ้าหา Chrome ไม่เจอ ตั้ง `CHROME_PATH` เป็น chromium ของ Playwright) — อ่านแค่คะแนนกับ audit ที่ไม่ผ่าน
- เป้า (มือถือ): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90 ที่หน้าแรก บทที่ 4 และบทที่ 5

---

## 11. Phases + Definition of Done
> ทุก phase จบด้วย: lint/typecheck/test ผ่าน → อัปเดต `docs/PROGRESS.md` → commit → push

**ลำดับ**: engine ถูกต้อง (Phase 1) → ธีม + StepPlayer (Phase 2) → บทที่ 1–5 (Phase 3–6) → **Milestone "พร้อมใช้สอน"** → Lab + polish → deploy prep → review 3 รอบ → รายงาน
- งานตกแต่งที่ติดเกิน ~30 นาที ให้ทำแบบเรียบง่ายไปก่อน จดใน PROGRESS.md แล้วกลับมาทำใน Phase 7
- ห้ามตัด: test ของ engine, golden vectors, acceptance criteria ใน requirement, StepPlayer ของทุกกระบวนการหลายขั้น

### Phase 0 — Setup และกติกา
- อ่าน PLAN.md ทั้งไฟล์ + requirement ทั้ง 4 ไฟล์ + ไฟล์ใน `docs/reference/coe-shop/`
- ตรวจเครื่อง: `node -v`, `npm -v`, `git status`, `gh auth status`
- Git (ก่อน scaffold): (1) commit การลบ `floating_web/` (หัวข้อ 2.3) (2) `git rm --cached .DS_Store` + สร้าง `.gitignore` ที่มี `.DS_Store` (3) commit `PLAN.md`, `floating_website_requirement/` (ทั้ง 4 ไฟล์ — ตอนนี้ยังไม่ถูก track) และ `docs/reference/` เป็น `docs: add plan, requirements and theme reference`
- **Scaffold ในโฟลเดอร์ที่ไม่ว่าง**: create-next-app ไม่ยอมสร้างในโฟลเดอร์ที่มีไฟล์อื่น (PLAN.md, requirement) → สร้างใน temp แล้ว copy เข้ามา
  1. `npx create-next-app@latest --help` ดู flag ของ version ปัจจุบันก่อน
  2. `npx create-next-app@latest /tmp/binary-lab-scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-react-compiler --no-cache-components --agents-md --disable-git --skip-install --yes` (ปรับตาม `--help` ถ้า flag เปลี่ยน · ห้ามรันแบบที่ต้องรอกด Enter)
  3. copy เข้ามาโดยไม่ทับไฟล์ที่มีอยู่: `rsync -a --ignore-existing /tmp/binary-lab-scaffold/ ./` (ถ้า rsync ของ macOS ไม่รองรับ flag นี้ ใช้ `cp -Rn /tmp/binary-lab-scaffold/. ./`) — ห้ามทับ PLAN.md, `docs/`, `floating_website_requirement/`, `.gitattributes` · แก้ `"name"` ใน package.json เป็น `binary-lab` แล้ว `npm install`
  4. ถ้า scaffold มี `CLAUDE.md` มาด้วย ให้แทนที่ด้วยเนื้อหาภาคผนวก B (มี `@AGENTS.md` บรรทัดบนอยู่แล้ว)
- ติดตั้ง dependency ตามหัวข้อ 5 (`@latest` ยกเว้น typescript `~6.0.3`, eslint `^9`, @types/node `^24`) · ตั้งค่า Prettier (+ plugin tailwind), Vitest (environment `node`, include `tests/unit/**`), Playwright (`npx playwright install chromium webkit`) — ใช้ไฟล์ใน reference เป็นแนวทาง
- `tsconfig.json`: `strict: true`, `target` อย่างน้อย `ES2020` (ใช้ BigInt literal `123n`), `"exclude"` เพิ่ม `docs`
- scripts ใน `package.json`: `dev`, `build`, `start`, `lint`, `typecheck` (`next typegen && tsc --noEmit`), `test` (`vitest run --reporter=dot`), `test:watch`, `test:cov`, `test:long` (`tsx scripts/test-long.mts`), `test:e2e`, `shots`, `format` · `"engines": { "node": ">=24" }`
- `.gitignore`: `.DS_Store`, `node_modules/`, `.next/`, `.vercel/`, `test-results/`, `playwright-report/`, `coverage/`, `*.tsbuildinfo`, `next-env.d.ts`, `.env*`
- สร้าง `CLAUDE.md` (ภาคผนวก B), `docs/PROGRESS.md` (checklist ทุก phase), `docs/QUESTIONS.md` (เริ่มด้วยหัวข้อ 14), `docs/STACK.md` (version จริง)
- **DoD**: `npm run dev` เปิดหน้าเริ่มต้นได้ · lint/typecheck/test ผ่าน · `npm run build` ผ่าน · STACK.md มี version จริง · push แล้ว

### Phase 1 — Floating-point engine (ยังไม่มี UI)
- ทำ `src/lib/fp/*` ตามหัวข้อ 4 ทั้งหมด + test ตามหัวข้อ 4.5 + `scripts/test-long.mts` + `src/content/examples.ts`
- **DoD**: golden vectors ภาคผนวก C ผ่านทุกแถว · oracle binary32 ผ่าน · exhaustive MINI8 ผ่าน · `npm run test:long` (1 ล้านกรณี) ผ่าน · coverage `src/lib/fp/**` ≥ 95% · สรุป API + Step type สั้น ๆ ใน `docs/ENGINE.md`

### Phase 2 — Design system + StepPlayer
- globals.css (หัวข้อ 9.3), ฟอนต์, port glass component (9.2), SiteHeader + MobileNav + SiteFooter, หน้าแรกแบบโครง, `ChapterHeader` / `Toc` / `ChapterNav` / `Summary`
- `bits/*` ตามสีหัวข้อ 9.4 · `player/*` ตามหัวข้อ 8.1 — ทดสอบกับ steps จริงจาก engine (เช่น `mul` ของ `6.5 × 2.75`) บนหน้า `/lab` แบบชั่วคราว
- **DoD**: screenshot หน้าแรกและ StepPlayer ที่ 390 และ 1280 ดูแล้วสวย อ่านง่าย ให้ความรู้สึกเดียวกับ coekku.shop (จดความเห็นใน REVIEW.md) · player ใช้คีย์บอร์ด แตะ และ reduced motion ได้

### Phase 3 — บทที่ 1 และ 2
- เนื้อหา + Integer Explorer + Fraction Explorer + Fraction Converter + animation หัวข้อ 8.2 + สรุปท้ายบท
- **DoD**: acceptance ของบทที่ 1–2 ใน requirement ผ่าน · e2e ข้อ 2–3 ผ่าน · screenshot 390 เปิดดูแล้ว

### Phase 4 — บทที่ 3
- เนื้อหา + IEEE 754 Converter (encode/decode) + animation + สรุป
- **DoD**: acceptance บทที่ 3 ผ่าน · e2e ข้อ 4 ผ่าน (Chromium + WebKit)

### Phase 5 — บทที่ 4
- เนื้อหา + FpSimulator (+/−) + Align / SigAdd / Normalize / RoundGRS + flowchart + ตัวอย่าง A1–A6 + สรุป
- **DoD**: acceptance บทที่ 4 ผ่าน · e2e ข้อ 5 ผ่าน (Chromium + WebKit)

### Phase 6 — บทที่ 5 (คูณ/หาร)
- เนื้อหา + FpSimulator (×/÷) + PartialProducts / LongDivision / ExponentCalc / RangeGauge / SpecialCase + flowchart + ตัวอย่าง M1–M6, D1–D5 + สรุป
- **DoD**: acceptance ใน requirement ส่วนเพิ่มผ่านครบ · e2e ข้อ 6 ผ่าน (Chromium + WebKit)

### Milestone "พร้อมใช้สอน" (ทำทันทีหลัง Phase 6)
- acceptance criteria ทั้งหมดของ requirement (4 ไฟล์) ผ่าน · e2e ทุกข้อผ่านใน `pixel7` + `iphone13` · `npm run build` ผ่าน ทุก route เป็น static · README (วิธีรันในเครื่อง) + `docs/DEPLOY.md` (คัดจากหัวข้อ 13)
- เขียนบรรทัดแรกของ `docs/PROGRESS.md` ว่า **"พร้อม deploy แล้ว"** + บอกใน chat แล้วทำ Phase 7 ต่อทันที ไม่ต้องรอ
- หลังจากนี้ทุก push อาจขึ้นเว็บจริง (ถ้า Pisit ต่อ Vercel แล้ว): push ได้เฉพาะงานที่ test และ build ผ่านแล้วเท่านั้น

### Phase 7 — Lab + polish
- `/lab` (หัวข้อ 7.8) + share link · หน้าแรกฉบับเต็ม (demo สด, timeline) · OG image, icon, sitemap, robots, 404/error · Lighthouse ตามเป้า · งานตกแต่งที่จดไว้
- stretch (ทำเมื่อข้างบนเสร็จหมด): เลือก format binary16/binary64 ใน Lab · โหมดนำเสนอ (ตัวใหญ่ ซ่อนเมนู ลูกศรเลื่อนขั้นได้ทั้งหน้า) · print stylesheet ของสรุปท้ายบท
- **DoD**: Lighthouse ผ่านเป้าหัวข้อ 10.4 · ไม่มี console error · e2e ข้อ 7–10 ผ่าน

### Phase 8 — พร้อม deploy (Claude Code ไม่ deploy เอง)
- `npm run build && npm start` ผ่านแบบ production · ไม่มี secret ใน repo · อัปเดต `docs/DEPLOY.md` และ README ให้ตรงงานล่าสุด
- **DoD**: ทำตาม DEPLOY.md แล้วไม่มีขั้นไหนขาด

### Phase 9 — Review 3 รอบ (หัวข้อ 15)

### Phase 10 — รายงานสุดท้าย + รวมคำถาม (หัวข้อ 15)

---

## 12. เครื่องของ Pisit + local dev (ตรวจแล้ว 30 ต.ค. 2569)
- macOS 26.6.2 · MacBook M2 RAM 8 GB · Node 26.11.1 · npm 11.20.0 · Homebrew 7.0.9 · VS Code 1.143.1 · Claude Code CLI 2.1.220 (ต้องอัปเดต) · gh 2.101.0 login เป็น `Pisit-s` · git credential helper `osxkeychain` (push ได้)
- ไม่ต้องมี database, env หรือ secret ใด ๆ
- dev server พอร์ต 3000 (รันแบบ background แล้วปิดเมื่อเลิกใช้ อย่าเปิดค้างหลายตัวเพราะ RAM น้อย) · Playwright `webServer` พอร์ต 3100 (production build) · `npm run shots` ใช้ base `http://localhost:3200`
- Node ในเครื่อง (26) ใหม่กว่าบน Vercel (24): อย่าใช้ API ที่มีเฉพาะ Node 26 ในโค้ดที่รันตอน build

---

## 13. คู่มือ deploy บน Vercel (สำหรับ Pisit — Claude Code ห้าม deploy เอง)
1. vercel.com → **Add New → Project** → Import `Pisit-s/ProjectComArch` (ให้สิทธิ์ GitHub ถ้าถูกถาม)
2. Framework Preset: Next.js (ตรวจเจอเอง) · Root Directory: `./` · Build/Install Command: ค่าเริ่มต้น · Node.js Version: 24.x (ค่าเริ่มต้น)
3. **ไม่ต้องตั้ง Environment Variables**
4. กด **Deploy** → ได้ `https://<ชื่อโปรเจกต์>.vercel.app`
5. ทดสอบบนมือถือจริง (iPhone Safari + Android Chrome): ทุกบท, ปุ่มของ StepPlayer, กดบิต, ลองเปิด Reduce Motion (iOS: Settings → Accessibility → Motion), เปิด share link ของ Lab จาก LINE
6. หลังต่อแล้ว ทุก push เข้า `main` = deploy production อัตโนมัติ · branch อื่น/PR = preview URL
7. (ถ้าต้องการ) ต่อ domain เอง เช่น `float.mypisit.com`: Settings → Domains → Add → ตั้ง CNAME ตามที่ Vercel บอก → รอ SSL แล้วแก้ `siteUrl` ใน `src/lib/site.ts` (Q4)

---

## 14. รายการคำถาม (`docs/QUESTIONS.md`)
รูปแบบทุกข้อ (Claude Code เพิ่มต่อท้ายได้เรื่อย ๆ):
```md
### Q<n> [ด่วน | ยืนยันค่าเริ่มต้น | ไม่ด่วน] หัวข้อสั้น ๆ
- คำถาม: ...
- ค่าที่สมมติไว้ตอนนี้: ...
- ถ้าคำตอบต่าง ต้องแก้: ไฟล์/ค่าไหน
- สถานะ: รอคำตอบ
```

คำถามตั้งต้น — ข้อที่ **ตอบแล้ว** ให้ใส่ใน QUESTIONS.md เป็นสถานะ "ตอบแล้ว" พร้อมคำตอบ ไม่ต้องถามซ้ำ:

| # | ระดับ | คำถาม | ค่าที่ใช้ไปก่อน |
|---|---|---|---|
| Q1 | ยืนยันค่าเริ่มต้น | ชื่อเว็บใช้ "Binary Lab" ตาม prototype เดิมไหม | **ตอบแล้ว**: ใช้ Binary Lab |
| Q2 | ไม่ด่วน | ชื่อผู้จัดทำ รหัสนักศึกษา และชื่ออาจารย์ที่จะใส่ใน footer | **ตอบแล้ว**: สมาชิก 4 คน + อาจารย์ ผศ. ดร. จิระเดช พลสวัสดิ์ (รายชื่อในหัวข้อ 7.1) |
| Q3 | ยืนยันค่าเริ่มต้น | บทที่ 5 อธิบายกรณีพิเศษ (÷0, 0÷0, 0×∞, overflow, underflow) แบบเต็ม ส่วนบทที่ 3–4 แสดงค่าพิเศษแบบสั้น — ตรงกับที่อาจารย์ต้องการไหม | ตามนั้น |
| Q4 | ไม่ด่วน | ใช้ domain `*.vercel.app` หรือจะต่อ subdomain เอง (เช่น float.mypisit.com) | `*.vercel.app` |
| Q5 | ยืนยันค่าเริ่มต้น | ภาษาไทยอย่างเดียว (ศัพท์เทคนิคอังกฤษ) พอไหม | ไทยอย่างเดียว |
| Q6 | ยืนยันค่าเริ่มต้น | ลบ prototype เก่าใน `floating_web/` ออกจาก repo (ยังดูย้อนหลังได้ที่ `ed29a5c`) | **ตอบแล้ว**: ลบถาวร (เพื่อนทำไว้) |
| Q7 | ไม่ด่วน | อยากได้ Half (16 บิต) / Double (64 บิต) ใน Lab ไหม | ทำเป็น stretch ใน Phase 7 |
| Q8 | ไม่ด่วน | อยากได้โหมดนำเสนอสำหรับอาจารย์ไหม | ทำเป็น stretch ใน Phase 7 |
| Q9 | ไม่ด่วน | ใส่ Vercel Web Analytics เพื่อดูจำนวนคนเข้าไหม | ไม่ใส่ |
| Q10 | ไม่ด่วน | ใส่รหัสวิชา และชื่อภาควิชา/มหาวิทยาลัยใน footer ด้วยไหม | ยังไม่ใส่ (แสดงแค่ชื่อวิชา Computer Architecture) |

---

## 15. Review 3 รอบก่อนจบ + รายงานสุดท้าย
> Pisit ต้องการแบบนี้: พอคิดว่าเสร็จแล้ว **ให้ย้อนกลับมา review อีก 3 รอบ** ดูว่าคนใช้จริงจะใช้ยังไง หน้าตาน่าใช้ไหม ยังมีบั๊กไหม แล้วแก้ ไม่ใช่ประกาศว่าเสร็จทันที

แต่ละรอบ: ทำ → จดสิ่งที่เจอ/แก้ใน `docs/REVIEW.md` → test ทั้งหมดผ่าน → commit + push
1. **รอบ 1 — ใช้งานจริง**
   - แบบนักศึกษา (มือถือ WebKit 390px): เริ่มที่หน้าแรก → เรียนบท 1 ถึง 5 ตามลำดับ → ลองทุกเครื่องมือ ใส่ค่าผิด ๆ (ว่าง, มี `,`, ตัวอักษร, `1e999`) → ใช้ StepPlayer ทั้งกดเองและเล่นอัตโนมัติ → จดจุดที่งง ต้องกดเยอะ หรืออ่านยาก แล้วแก้
   - แบบอาจารย์ (desktop 1920 จำลองโปรเจกเตอร์): เปิด Lab ทำตัวอย่างด้วยคีย์บอร์ดล้วน (Tab, ลูกศร, Space) → คัดลอก share link → เปิดลิงก์นั้นในมือถือ
2. **รอบ 2 — ความสวยและ interface**: screenshot ทุกหน้าทุกขนาดจอ เทียบหัวข้อ 9 — กระจกอ่านง่ายไหม, spacing/alignment, ตัวอักษรไทยไม่โดนตัด, สีบิตตรงกันทุกบท, animation ลื่นและไม่รก (ลอง reduced motion ด้วย), ไม่มี emoji, ภาษาไทยเป็นธรรมชาติและศัพท์ตรงตาราง 7.9
3. **รอบ 3 — ความถูกต้อง**: `npm run test` + `npm run test:long` + e2e ทุก browser · ไล่อ่านเนื้อหาทุกบทเทียบ requirement (สูตร bias, ทิศทาง normalize, กฎ ties to even, กรณีพิเศษ) · ตรวจว่าไม่มีตัวเลขในเนื้อหาที่พิมพ์เอง (grep หา `0x` และสตริงบิตยาว ๆ ใน `src/app`, `src/content`, `src/components`) · `npm run build` ผ่าน · ไม่มี console error

**รายงานสุดท้าย** (`docs/FINAL_REPORT.md` และพิมพ์ใน chat):
- สรุปสิ่งที่ทำเสร็จตาม phase + สิ่งที่ยังไม่ได้ทำ/ข้อจำกัด
- ตาราง acceptance criteria ทุกข้อของ requirement 4 ไฟล์ พร้อมสถานะและวิธีที่ตรวจ
- ผล test ล่าสุด (จำนวน test, coverage ของ engine, คะแนน Lighthouse) + path screenshot สำคัญ
- **คำถามทั้งหมดจาก `docs/QUESTIONS.md` เรียงตามความสำคัญ** (ด่วน → ยืนยันค่าเริ่มต้น → ไม่ด่วน) พร้อมค่าที่สมมติไว้
- ขั้นต่อไปของ Pisit: ตอบคำถาม → deploy ตาม `docs/DEPLOY.md` (ถ้ายังไม่ได้ทำ)

---

## ภาคผนวก A — kickoff prompt (วางใน Claude Code)

ก่อนวาง: `/model` เลือก Opus 5.5 → `/effort high` → mode **Auto** → รัน `caffeinate -dimsu` ทิ้งไว้ (หัวข้อ 1)

```text
อ่าน PLAN.md ให้ครบทั้งไฟล์ 1 รอบก่อน (ไฟล์ยาว อ่านเป็นช่วงด้วย offset/limit) แล้วอ่าน requirement ทั้ง 4 ไฟล์ใน floating_website_requirement/ จากนั้นพัฒนาเว็บนี้ตาม Phase 0 ถึง Phase 10 แบบ autonomous ได้เลย — Phase 0 เริ่มด้วยการสร้าง CLAUDE.md ตามภาคผนวก B, docs/PROGRESS.md, docs/QUESTIONS.md, docs/STACK.md

ลำดับความสำคัญ
- ความถูกต้องของ engine มาก่อน (หัวข้อ 4): golden vectors ในภาคผนวก C, oracle Math.fround และ exhaustive minifloat ต้องผ่านก่อนเริ่มทำ UI
- ทุกกระบวนการที่มีหลายขั้นต้องเป็น animation ที่กดได้ผ่าน StepPlayer (หัวข้อ 8)
- ไปให้ถึง Milestone "พร้อมใช้สอน" (หัวข้อ 11) แล้วเขียนบรรทัดแรกของ docs/PROGRESS.md ว่า "พร้อม deploy แล้ว" + บอกใน chat แล้วทำ Phase 7 ต่อทันทีไม่ต้องรอฉัน

วิธีทำงาน
- ฉันเปิดคอมทิ้งไว้ ไม่มีคนตอบระหว่างทาง: ห้ามใช้ AskUserQuestion และห้ามหยุดถาม → จดคำถามลง docs/QUESTIONS.md ตามหัวข้อ 14 พร้อมค่าที่สมมติไว้ แล้วทำงานส่วนอื่นต่อ
- ก่อนใช้ library ไหนให้ query Context7 ก่อนทุกครั้ง (โดยเฉพาะ daisyUI 5, Next.js 16, Tailwind v4, motion) และใช้ version ตามหัวข้อ 5
- ธีม Liquid Glass ให้ port จาก docs/reference/coe-shop/ ตามหัวข้อ 9 — ห้ามแก้อะไรใน repo CoE-Shop
- ประหยัด token ตามหัวข้อ 2.8: test output สั้น, log ดูแค่ tail/grep, หลังรอบแรกอ่าน PLAN.md เฉพาะหัวข้อที่ใช้
- commit ทุกงานย่อยที่ test ผ่าน, push ทุกครั้งที่จบ phase, อัปเดต docs/PROGRESS.md ตลอด (session ถูกตัดหรือชน limit จะได้ทำต่อได้ทันที)
- พอคิดว่าเสร็จแล้ว ให้ review ซ้ำ 3 รอบตามหัวข้อ 15 ก่อน แล้วค่อยสรุปผลใน docs/FINAL_REPORT.md พร้อมรวมคำถามทั้งหมดให้ฉันตอบทีเดียว

จุดที่ห้ามพลาด
- ผลลัพธ์ทุก operation ต้องตรง IEEE 754 binary32 (round to nearest, ties to even) ทุกบิต — engine ใช้ BigInt ห้ามคำนวณผลด้วย Number
- ตัวเลขบิต/hex/ค่าที่เก็บจริงในเนื้อหาบทเรียนต้อง render จาก engine ห้ามพิมพ์เอง
- ห้าม deploy เอง, ห้าม force push, ห้าม emoji ทุกที่, ห้ามแก้ requirement 2 ไฟล์เดิมของเพื่อน
```

ถ้าหยุดเพราะชน usage limit หรือเปิด session ใหม่ ให้พิมพ์: `ทำต่อ — อ่าน CLAUDE.md กับ docs/PROGRESS.md แล้วทำงานถัดไป`

---

## ภาคผนวก B — `CLAUDE.md` (สร้างใน Phase 0)

```md
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
```

---

## ภาคผนวก C — Golden test vectors (ตรวจแล้ว)

ทุกแถวคำนวณตอนเขียนแผนด้วย Python reference 3 ทางที่ให้ผลตรงกัน (algorithm หัวข้อ 4.3 / exact rational + ปัดครั้งเดียว / numpy float32) — test ใน Phase 1 ต้องผ่านทุกแถว · ตัวอย่างในเนื้อหาเลือกจากตารางนี้ (เก็บใน `src/content/examples.ts`)

### C.1 Encode (ทศนิยม → binary32)

| # | input | bits | ค่าที่เก็บจริง (exact) | หมายเหตุ |
|---|---|---|---|---|
| E1 | `5.75` | `0x40B80000` | 5.75 | 101.11₂ = 1.0111 × 2² · E = 129 |
| E2 | `-13.25` | `0xC1540000` | −13.25 | 1101.01₂ = 1.10101 × 2³ · E = 130 |
| E3 | `0.1` | `0x3DCCCCCD` | 0.100000001490116119384765625 | ปัดขึ้น |
| E4 | `0.2` | `0x3E4CCCCD` | 0.20000000298023223876953125 | |
| E5 | `0.3` | `0x3E99999A` | 0.300000011920928955078125 | |
| E6 | `1` | `0x3F800000` | 1 | |
| E7 | `0.15625` | `0x3E200000` | 0.15625 | ใช้เป็นตัวอย่าง decode ด้วย |
| E8 | `3.4028235e38` | `0x7F7FFFFF` | 340282346638528859811704183484516925440 | ค่าจำกัดที่มากที่สุด |
| E9 | `3.5e38` | `0x7F800000` | +∞ | overflow |
| E10 | `1e-40` | `0x000116C2` | 9.999946101114759581525919…e−41 | subnormal |
| E11 | `1e-45` | `0x00000001` | 2⁻¹⁴⁹ = 1.401298464324817070923729…e−45 | subnormal ที่เล็กที่สุด |
| E12 | `7e-46` | `0x00000000` | +0 | น้อยกว่าครึ่งหนึ่งของ 2⁻¹⁴⁹ |
| E13 | `1.00000017881393432617187499` | `0x3F800001` | 1.00000011920928955078125 | ถ้าแปลงผ่าน `Number` ได้ `0x3F800002` (ผิด) |
| E14 | `16777217` | `0x4B800000` | 16777216 | tie → เลือกตัวคู่ |
| E15 | `-0` | `0x80000000` | −0 | |

### C.2 Decode

| # | bits | ประเภท | ค่า |
|---|---|---|---|
| X1 | `0x3E200000` | normal | 0.15625 (= 1.01₂ × 2⁻³) |
| X2 | `0x00000001` | subnormal | 2⁻¹⁴⁹ |
| X3 | `0x00800000` | normal (normalized ที่เล็กที่สุด) | 2⁻¹²⁶ = 1.175494350822287507968736…e−38 |
| X4 | `0x80000000` | zero | −0 |
| X5 | `0x7F800000` / `0xFF800000` | infinity | +∞ / −∞ |
| X6 | `0x7FC00000` | NaN | NaN |

### C.3 บวก/ลบ (บทที่ 4)

| # | operation | ผลลัพธ์ | รายละเอียดที่ต้องตรง |
|---|---|---|---|
| A1 | `0.5 + (-0.4375)` | `0x3D800000` = 0.0625 | d = 1 · 1.000 − 0.111 = 0.001 → normalize ซ้าย 3 บิต · ไม่ต้องปัด |
| A2 | `0.1 + 0.2` | `0x3E99999A` | d = 1 · G=1 R=1 S=0 → ปัดขึ้น · exact ของค่าที่เก็บ = 0.300000004470348358154296875 |
| A3 | `1 + 1e-8` | `0x3F800000` = 1 | d = 27 · sticky = 1, G=0 R=0 → ปัดลง (1e−8 หายทั้งตัว) |
| A4 | `16777216 + 1` | `0x4B800000` = 16777216 | d = 24 · G=1 R=0 S=0 (tie), LSB = 0 → ปัดลง |
| A5 | `16777216 + 3` | `0x4B800002` = 16777220 | d = 23 · G=1 R=0 S=0 (tie), LSB = 1 → ปัดขึ้นเป็นเลขคู่ |
| A6 | `1.0000001 - 1` | `0x34000000` = 2⁻²³ ≈ 1.1920929e−7 | d = 0 · ลบหักล้าง → normalize ซ้าย 23 บิต · exact |

### C.4 คูณ/หาร (บทที่ 5)

| # | operation | ผลลัพธ์ | รายละเอียดที่ต้องตรง |
|---|---|---|---|
| M1 | `1.5 × 2.5` | `0x40700000` = 3.75 | E = 127 + 128 − 127 = 128 · 1.1 × 1.01 = 1.111 (ไม่ normalize) · partial product 2 แถว |
| M2 | `0.5 × -0.4375` | `0xBE600000` = −0.21875 | sign 0 XOR 1 = 1 · E = 126 + 125 − 127 = 124 · 1.000 × 1.110 = 1.110 |
| M3 | `6.5 × 2.75` | `0x418F0000` = 17.875 | E = 129 + 128 − 127 = 130 → 131 · 1.101 × 1.011 = 10.001111 → เลื่อนขวา 1 · partial product 3 แถว |
| M4 | `0.1 × 3` | `0x3E99999A` | E = 123 + 128 − 127 = 124 → 125 · P = 10.011001100110011001100111₂ → เลื่อนขวา 1 · G=1 R=1 S=0 → ปัดขึ้น · exact = 0.300000004470348358154296875 |
| M5 | `3e38 × 10` | `0x7F800000` = +∞ | E = 254 + 130 − 127 = 257 → 258 หลัง normalize > 254 → overflow |
| M6 | `1e-30 × 1e-30` | `0x00000000` = +0 | E = 27 + 27 − 127 = −73 → underflow จนเป็น 0 |
| M7 | `1e-20 × 1e-20` | `0x000116C2` | underflow → denormalize 7 บิต · G=0 → ปัดลง · ได้ subnormal |
| M8 | `1.5 × -6` | `0xC1100000` = −9 | sign = 1 · 1.1 × 1.1 = 10.01 → เลื่อนขวา 1 |
| M9 | `0.1 × 0.1` | `0x3C23D70B` = 0.010000000707805156707763671875 | partial product 13 แถว · G=1 R=0 S=1 → ปัดขึ้น |
| M10 | `-2 × 0` | `0x80000000` = −0 | กฎค่าพิเศษ: sign = XOR |
| M11 | `0 × Infinity` | `0x7FC00000` = NaN | invalid |
| D1 | `7.5 ÷ 2.5` | `0x40400000` = 3 | E = 129 − 128 + 127 = 128 · 1.111 ÷ 1.01 = 1.1 เศษ 0 |
| D2 | `9 ÷ 12` | `0x3F400000` = 0.75 | E = 130 − 130 + 127 = 127 → 126 · 1.001 ÷ 1.1 = 0.11 → เลื่อนซ้าย 1 |
| D3 | `1 ÷ 3` | `0x3EAAAAAB` = 0.3333333432674407958984375 | E = 127 − 128 + 127 = 126 → 125 · Q (27 บิต) = 0.10101010101010101010101010 เศษ ≠ 0 · G=1 R=0 S=1 → ปัดขึ้น |
| D4 | `1 ÷ 0` | `0x7F800000` = +∞ | divideByZero |
| D5 | `0 ÷ 0` | `0x7FC00000` = NaN | invalid |
| D6 | `2 ÷ 3` | `0x3F2AAAAB` = 0.666666686534881591796875 | G=1 R=0 S=1 → ปัดขึ้น |
| D7 | `1 ÷ 10` | `0x3DCCCCCD` (ค่าเดียวกับ E3) | E = 127 − 130 + 127 = 124 → 123 · G=1 R=1 S=1 → ปัดขึ้น |
| D8 | `-6 ÷ 0.75` | `0xC1000000` = −8 | sign = 1 · 1.1 ÷ 1.1 = 1.0 เศษ 0 · E = 129 − 126 + 127 = 130 |
| D9 | `3e38 ÷ 0.1` | `0x7F800000` = +∞ | E = 254 − 123 + 127 = 258 → overflow |
| D10 | `1e-30 ÷ 1e10` | `0x000116C2` | E = 27 − 160 + 127 = −6 → underflow → denormalize 7 บิต → subnormal |
| D11 | `1e-38 ÷ 1e10` | `0x00000000` = +0 | 1e−38 เป็น subnormal อยู่แล้ว (`0x006CE3EE`) → ผลเล็กเกิน → 0 |
| D12 | `-1 ÷ 0` | `0xFF800000` = −∞ | divideByZero |
| D13 | `0 ÷ 5` | `0x00000000` = +0 | |

### C.5 บทที่ 1–2

| # | input | ผลที่ต้องได้ |
|---|---|---|
| I1 | บิต `00001010` | 10 |
| I2 | บิต `00001011` | 11 = 8 + 2 + 1 |
| I3 | บิต `11111111` | 255 |
| F1 | `0.375`, 8 บิต | `0.011₂` ผลต่าง 0 (จบ) |
| F2 | `0.625`, 8 บิต | `0.101₂` ผลต่าง 0 |
| F3 | `0.1`, 16 บิต | `0.0001100110011001₂` = 0.0999908447265625 · ผลต่าง 0.0000091552734375 · วงซ้ำ `0011` เริ่มบิตที่ 2 |
| F4 | `0.1`, 23 บิต | 0.099999904632568359375 · ผลต่าง 0.000000095367431640625 |
| F5 | `0.1`, 8 บิต | `0.00011001₂` = 0.09765625 · ผลต่าง 0.00234375 |
