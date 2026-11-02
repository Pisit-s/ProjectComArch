# WP-0 หน้าแรกใหม่ + เปลี่ยนชื่อ + ปรับโครงสร้าง: ความคืบหน้า
- branch: wp0-hub · ผู้รับผิดชอบ: Pisit (ทำต่อโดยสมาชิกกลุ่มผ่าน Claude Code) · สถานะ: รอ review

## งาน (ตาม PLAN.md หัวข้อ 7)
- [x] 1. เตรียม: branch `wp0-hub` · แผน (`PLAN.md`, `docs/plans/`) ถูก commit ไว้บน `main` แล้วใน 6d87a64 จึงไม่ต้อง commit ซ้ำ · `CLAUDE.md` = ภาคผนวก B · ไฟล์ progress 4 ไฟล์ · บรรทัดประวัติระยะที่ 1 · comment อ้าง `PLAN.md` → `docs/plans/stage1-floating-point.md`
- [x] 2. เปลี่ยนชื่อเป็น comkrub: site.ts ตามภาคผนวก C, githubUrl null + footer ซ่อนลิงก์, package name, ธีม daisyUI `comkrub`, โลโก้ชิปใหม่ (`LogoMark`) + `FpMark` (3 แถบเดิม), icon, OG, README
- [x] 3. Topic registry: `src/content/topics.ts` (+ `TOPICS_IN_ORDER`, `firstReadyLesson`, `topicOfPath`), `TopicIcon`, `StatusBadge`, `tests/unit/topics/topics.test.ts`
- [x] 4. ย้าย route: `src/app/floating-point/{5 บท,lab}` (git mv), `/floating-point` = หน้าแรกเดิม, `layout.tsx` + `FpSubnav` (breadcrumb + แถบบท), redirect 308 ใน `next.config.ts` (ตรวจด้วย curl: query ติดไป), e2e ใช้ path ใหม่ (FP 15 tests ผ่านบน pixel7)
- [x] 5. หน้าแรกใหม่: `src/app/page.tsx` + `TopicCard` (ปกติ/กว้าง + BeamRing) · มือถือ 390×844 เห็นการ์ดแรกโดยไม่ต้องเลื่อน (`test-results/shots/hub-390-fold.png`)
- [x] 6. หน้า "กำลังพัฒนา": `ComingSoon` + `comingSoonMetadata` (noindex) + `src/app/{multiply,divide,mips}/page.tsx` (ทำก่อนขั้นที่ 5 ดูบันทึก)
- [x] 7. การนำทาง: header (`NavLinks` หัวข้อ 4 อัน + จุดเทา/title กำลังพัฒนา + active ตาม prefix), drawer (หัวข้อ + บท FP ซ้อนใต้เมื่ออยู่ใน FP, พื้นทึบ), footer (หัวข้อจาก registry), sitemap (ready เท่านั้น) · `tests/e2e/hub.spec.ts` ใหม่ + `site.spec.ts` ปรับตามเมนูใหม่ (48 tests ผ่านบน pixel7 + desktop)
- [x] 8. โครงร่วมสำหรับทีม: tokens 6.1 ใน `globals.css` + `FieldKind` 11 ตัว, `BitRow` (+ `bit-format.ts`), `LessonLayout` (`ChapterLayout` เรียกใช้ หน้า FP เหมือนเดิม), `TalkingPoints`, `SelfCheck`, `OpenInSim` + `mips-example-ids.ts`, `src/components/hw/` (`HwDiagram`, `HwRegister`, `HwAlu`, `HwControl`, `HwWire`), glossary แยกโฟลเดอร์ (`arith.ts` 25 คำ), หน้า `/dev/kit` · unit test `tests/unit/topics/shared.test.ts`
- [x] 9. ลิงก์ข้ามหัวข้อ: callout ในบทที่ 5 (การคูณ Significand → `/multiply`, การหารยาว → `/divide`) ผ่าน `TopicLink` (ใช้สถานะจาก registry · ยังไม่พร้อมเป็นข้อความ "(กำลังพัฒนา)" ไม่มีลิงก์)
- [x] 10. ทีม: `.github/workflows/ci.yml` (Node 24, `actions/checkout@v7` + `actions/setup-node@v7` ตรวจ tag ล่าสุดด้วย `git ls-remote` วันนี้), `.github/pull_request_template.md`, `docs/TEAM.md`, `docs/DEPLOY.md` หัวข้อ "ระยะที่ 2"
- [x] 11. ทดสอบ: unit 185 ผ่าน · e2e 119/119 ผ่านบน pixel7 + iphone13 + desktop · build ผ่าน ทุก route static · screenshot ครบ · Lighthouse ยังไม่ได้วัด (WP0-Q7)
- [x] 12. Review 3 รอบ (หัวข้อ Review) · push branch แล้ว · PR: เครื่องนี้ไม่มี `gh` ต้องกดเปิดบน GitHub เอง (ดูรายงานท้าย WP)

## คำถาม
### WP0-Q1 [ด่วน] ลิงก์ GitHub ใน footer
- คำถาม: repo เป็น private คนทั่วไปกดลิงก์ "โค้ดบน GitHub" ใน footer จะเจอ 404 จะเปิด repo เป็น public หรือซ่อนลิงก์
- ค่าที่สมมติไว้ตอนนี้: ซ่อนลิงก์ (`githubUrl: null`)
- ถ้าคำตอบต่าง ต้องแก้: ใส่ URL ใน `src/lib/site.ts` (ระวัง `EMIPS.pdf` อยู่ในประวัติ git)
- สถานะ: รอคำตอบ

### WP0-Q2 [ไม่ด่วน] ใครทำ WP-1 / WP-2 / WP-3
- คำถาม: ชื่อผู้รับผิดชอบแต่ละ WP (ใช้ในไฟล์ progress ไม่แสดงบนเว็บ)
- ค่าที่สมมติไว้ตอนนี้: WP-1 Pisit · WP-2 และ WP-3 เพื่อน (รอชื่อ)
- ถ้าคำตอบต่าง ต้องแก้: บรรทัดผู้รับผิดชอบใน `docs/progress/*.md`
- สถานะ: รอคำตอบ

### WP0-Q3 [ไม่ด่วน] วันนำเสนอ
- คำถาม: วันนำเสนอคือวันไหน
- ค่าที่สมมติไว้ตอนนี้: ยังไม่มีกำหนด ทำตามลำดับในแผน
- ถ้าคำตอบต่าง ต้องแก้: เรียงความสำคัญของงาน
- สถานะ: รอคำตอบ

### WP0-Q4 [ยืนยันค่าเริ่มต้น] โลโก้ใหม่
- คำถาม: โลโก้ใหม่เป็นชิปที่มีแถบ 3 สีเดิมอยู่ข้างใน
- ค่าที่สมมติไว้ตอนนี้: ใช้ตามนั้น
- ถ้าคำตอบต่าง ต้องแก้: `src/components/layout/logo.tsx`, `src/app/icon.tsx`
- สถานะ: รอคำตอบ

### WP0-Q5 [ยืนยันค่าเริ่มต้น] path ใหม่
- คำถาม: path ใหม่ `/multiply`, `/divide`, `/floating-point`, `/mips`
- ค่าที่สมมติไว้ตอนนี้: ใช้ตามนั้น
- ถ้าคำตอบต่าง ต้องแก้: `src/content/topics.ts`, โฟลเดอร์ใน `src/app/`, redirect
- สถานะ: รอคำตอบ

### WP0-Q6 [ยืนยันค่าเริ่มต้น] ข้อความหน้าแรก
- คำถาม: ข้อความหน้าแรก (tagline, คำอธิบาย, blurb ของแต่ละหัวข้อ) ตามภาคผนวก C
- ค่าที่สมมติไว้ตอนนี้: ใช้ตามนั้น
- ถ้าคำตอบต่าง ต้องแก้: `src/lib/site.ts`, `src/content/topics.ts`, `src/app/page.tsx`
- สถานะ: รอคำตอบ

### WP0-Q7 [ไม่ด่วน] Lighthouse ยังไม่ได้วัด
- คำถาม: ขั้นที่ 11 ให้วัด Lighthouse หน้า `/` และ `/floating-point` (เป้า stage1 10.4: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90) แต่ session นี้ระบบอนุญาตไม่ให้รัน `npx -y lighthouse@latest` (ต้องดาวน์โหลดแพ็กเกจนอก lockfile)
- ค่าที่สมมติไว้ตอนนี้: ยังไม่ได้วัด · ช่อง Lighthouse ใน PR ยังไม่ติ๊ก · ระยะที่ 1 หน้าแรกเดิมได้ 93/98/100/100
- ถ้าคำตอบต่าง ต้องแก้: รัน `npm run build && npx next start -p 3100` แล้ว `npx lighthouse@latest http://localhost:3100/ --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --chrome-flags="--headless=new"` (และ `/floating-point`) ถ้าต่ำกว่าเป้าให้เปิดงานแก้
- สถานะ: รอวัด

## แก้ไฟล์ร่วม
- (WP-0 แก้ได้ทุกไฟล์)

## ผลทดสอบ (2 พ.ย. 2569)
- `npm run lint` · `npm run typecheck`: ผ่าน
- `npm test`: 185 tests ผ่าน (เดิม 172 + registry 7 + shared 6)
- e2e: 119/119 ผ่านบน pixel7 + iphone13 + desktop (`hub.spec.ts` ใหม่ + spec เดิมทั้งหมดที่ path ใหม่)
- `npm run build`: ผ่าน ทุก route เป็น static (○) · `/dev/kit` build เป็น static แต่ใน production เรียก `notFound()` จึงได้หน้า 404 (e2e ตรวจแล้ว) และไม่อยู่ใน sitemap
- Lighthouse: ยังไม่ได้วัด (WP0-Q7)

## Review
- รอบ 1 ใช้งานจริง (WebKit 390px แบบนักศึกษา + desktop 1920 แบบคนนำเสนอ):
  - เจอ: ลิงก์ที่มี `#anchor` ในหัวข้อ Floating-Point (เช่น `/floating-point/mul-div#simulator` ที่ปุ่มลัดใช้) เปิดแล้วเด้งกลับบนสุดบน iPhone เพราะ `FpSubnav` ใช้ `scrollIntoView` จัดปุ่มบทให้อยู่กลาง ซึ่ง WebKit เลื่อนทั้งหน้าด้วย → แก้ให้เลื่อนเฉพาะแถบแนวนอน (`c9077c2`) · test โหมดนำเสนอบน iphone13 ที่ล้มราวครึ่งหนึ่งผ่าน 12/12 หลังแก้ · เพิ่ม e2e `chapter pills keep the page at a #anchor` (ผ่าน แต่บั๊กนี้ขึ้นกับจังหวะ hydration จึงไม่ใช่ test ที่จับได้ทุกครั้ง)
  - เจอ: drawer มือถือโปร่งจนเนื้อหาข้างหลังทะลุ → พื้นขาวทึบ
  - เจอ: "เร็ว ๆ นี้" บนหน้า "กำลังพัฒนา" ตัดบรรทัดจน "ๆ นี้" ตกบรรทัด → ห่อไม่ให้ตัด
  - หน้าแรกบน 390×844 เห็นการ์ดหัวข้อแรกโดยไม่ต้องเลื่อน · ทุกการ์ดกดได้ · ปุ่มกลับหน้าแรกใช้ได้ · เมนู desktop ใช้คีย์บอร์ด Tab ได้ (เป็น link ทั้งหมด)
- รอบ 2 ความสวยและ interface (screenshot `test-results/shots/`: `hub-390-fold.png`, `hub-390-webkit.png`, `hub-1440.png`, `multiply-390-webkit.png`, `mips-1440.png`, `mips-390-webkit.png`, `fp-390-webkit.png`, `fp-ch3-390.png`, `fp-ch3-1920.png`, `drawer-390.png`, `kit-390.png`, `kit-1440.png`, `kit-hw-390.png`):
  - เจอ: pill บน hero ถูกตัดด้วย "..." บนมือถือ → ให้ขึ้นบรรทัดใหม่ได้
  - เจอ: ไอคอน Floating-Point (3 แถบ) บนปุ่มเมนูที่ active สีน้ำเงิน แถบน้ำเงินกลืนกับพื้น → ใส่พื้นขาวรองไอคอนเฉพาะตอน active
  - เจอ: ภาพ SVG ฮาร์ดแวร์บนมือถือเล็กจนอ่านไม่ออก → `HwDiagram` มี `minWidth` ให้เลื่อนแนวนอน
  - เจอ: `BlurFade` ยัง fade อยู่แม้ตั้ง reduced motion (MotionConfig "user" ปิดแค่ transform) → ไม่ทำ animation เมื่อ reduced motion
  - ธีม Liquid Glass เดิม · สีบิตและ token ใหม่ผ่าน contrast 4.5:1 · ตัวอักษรไทยไม่โดนตัด · ไม่มี emoji
- รอบ 3 ความถูกต้อง:
  - unit 185 tests ผ่าน · build ผ่าน ทุก route static (○) · e2e 3 อุปกรณ์ (ผลล่าสุดดูหัวข้อ "ผลทดสอบ")
  - grep `0x` และสตริงบิตยาวในไฟล์ที่เปลี่ยน: ไม่มีเลขที่พิมพ์เองในเนื้อหาใหม่ (ที่เจอเป็น input เดิมของระยะที่ 1 และค่าตัวอย่างใน `/dev/kit` ที่ประกอบจาก field ด้วยโค้ด)
  - ไม่มีคำว่า "Binary Lab" ใน UI, metadata, README (เหลือเฉพาะเอกสารประวัติระยะที่ 1 และ `docs/plans/stage1-floating-point.md`)
  - เจอ: axe ใน e2e วัด contrast ตอนการ์ดหน้าแรกยัง fade อยู่ (WebKit) → test รอให้ opacity เป็น 1 ก่อนวัด

## บันทึกการตัดสินใจ / ต่างจากแผน
- ขั้นที่ 1: ไฟล์แผนถูก commit บน `main` แล้ว (6d87a64 "ระยะที่ 2 comkrub") ก่อนสร้าง branch จึงไม่มี commit `docs: stage 2 plan for comkrub` แยกบน branch นี้
- `@source not '../../docs'` มีอยู่แล้วใน `globals.css` ตั้งแต่ระยะที่ 1
- ขั้นที่ 2: `package-lock.json` แก้เฉพาะชื่อ (2 บรรทัด) แทน `npm install --package-lock-only` เพราะ npm 11.13 ในเครื่องนี้เติม entry ของ `@tailwindcss/oxide-wasm32-wasi` เพิ่ม 60 กว่าบรรทัดที่ไม่เกี่ยว
- ขั้นที่ 2: รูป 3 แถบเดิมแยกเป็น `FpMark` ใน `logo.tsx` (ไอคอนหัวข้อ Floating-Point) ส่วน `LogoMark` เป็นโลโก้ชิปของเว็บ
- ขั้นที่ 5/6: commit หน้า "กำลังพัฒนา" (ขั้นที่ 6) ก่อนหน้าแรก (ขั้นที่ 5) เพราะ `typedRoutes` ไม่ยอมให้การ์ดลิงก์ไป `/multiply`, `/divide`, `/mips` ก่อนที่ route จะมีอยู่จริง
- ขั้นที่ 8 สี ink ที่ใช้จริง (contrast บนพื้นขาว / พื้นสี 14%): mips-op `#102880` (12.8 / 9.8), mips-rs และ md-operand `#00629a` (6.5 / 5.4), mips-rt `#1f6f9f` (5.5 / 4.9), mips-rd และ md-acc `#007553` (5.7 / 4.9), mips-const และ md-alu `#963f73` (6.5 / 5.6), mips-funct และ md-step `#8a5a00` (5.9 / 5.3), md-test `#a64300` (6.1 / 5.1)
- ขั้นที่ 8 `BitRow.kind` รับได้ 3 แบบ: `FieldKind`, array ตามตำแหน่งบิต (index 0 = LSB) หรือ function · function ส่งจาก server component ไม่ได้ (Next.js ส่ง function ข้าม boundary ไม่ได้) ให้ใช้ array แทนถ้าหน้าเป็น server component · `formatBitValue` อยู่ใน `bit-format.ts` (ไม่ใช่ไฟล์ client) เรียกจาก server ได้
- ขั้นที่ 8 `HwDiagram` มี `minWidth` ให้ภาพเลื่อนแนวนอนบนมือถือแทนการย่อจนตัวหนังสืออ่านไม่ออก · สีใน SVG อยู่ที่ `src/components/hw/colors.ts` (unit test ตรวจว่าตรงกับ `globals.css`)
- ขั้นที่ 8 key ใน glossary ห้ามซ้ำข้ามไฟล์ (unit test ตรวจ) · คำใน `arith.ts` ที่ซ้ำความหมายกับของ FP ใช้ key ขึ้นต้น `md` เช่น `mdMultiplicand`, `mdPartialProduct`
- Context7 MCP ไม่มีใน session นี้ (ไม่มี tool ให้เรียก) จึงอ่าน docs ใน `node_modules/next/dist/docs/` (redirects) และใช้ API ของ daisyUI/lucide ที่ใช้อยู่แล้วในโปรเจกต์ (ตรวจชื่อไอคอนในโฟลเดอร์ของ lucide-react)

## รายงานท้าย WP-0
- เสร็จ: ขั้นที่ 1–12 ตาม PLAN.md หัวข้อ 7 ทุกข้อ ยกเว้นการวัด Lighthouse (WP0-Q7) · PR ต้องกดเปิดบน GitHub เอง
- ยังไม่ทำ: Lighthouse · การตรวจบนเว็บจริงหลัง merge (PLAN.md 12 ข้อ 1)
- ผล test: ดูหัวข้อ "ผลทดสอบ"
- screenshot: `test-results/shots/` (`hub-390-fold.png`, `hub-390-webkit.png`, `hub-1440.png`, `multiply-390-webkit.png`, `multiply-1440.png`, `mips-390-webkit.png`, `mips-1440.png`, `fp-390-webkit.png`, `fp-1440.png`, `fp-ch3-390.png`, `fp-ch3-1440.png`, `fp-ch3-1920.png`, `drawer-390.png`, `kit-390.png`, `kit-1440.png`, `kit-hw-390.png`) · โฟลเดอร์นี้ไม่ถูก commit
- คำถามเรียงตามความสำคัญ: WP0-Q1 (ด่วน: ลิงก์ GitHub) · WP0-Q4, Q5, Q6 (ยืนยันค่าเริ่มต้น) · WP0-Q7, Q2, Q3 (ไม่ด่วน)
- PR: https://github.com/Pisit-s/ProjectComArch/compare/main...wp0-hub?expand=1 (merge แบบ "Create a merge commit")
