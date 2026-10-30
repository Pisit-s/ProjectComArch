# comkrub: แผนพัฒนาเว็บไซต์เพื่อการเรียนรู้และ Simulation วิชา Computer Architecture (ระยะที่ 2)

> แผนนี้เขียนให้ **Claude Code** ของ Pisit และของเพื่อนในกลุ่มทำงานแบบ autonomous · เขียนเมื่อ 31 ต.ค. 2569
> repo `Pisit-s/ProjectComArch` (private) · เว็บจริง https://comkrub.mypisit.com บน Vercel (Pisit ดูแลและ deploy เอง)
> **ระยะที่ 1 เสร็จแล้ว**: สื่อการสอน Floating-Point 5 บท + Lab (ชื่อเดิม Binary Lab) · แผนเดิมย้ายไปไว้ที่ `docs/plans/stage1-floating-point.md` ใช้อ้างอิงเรื่อง engine, StepPlayer, ธีม และ testing ได้ทุกหัวข้อ (ในไฟล์นี้เรียกว่า "stage1 x.y")
> **ระยะที่ 2 (ไฟล์นี้)**: เปลี่ยนชื่อเป็น **comkrub** ทำหน้าแรกเป็นหน้าเลือกหัวข้อ แล้วเพิ่มหัวข้อการคูณ การหาร และ MIPS Simulator โดยแบ่งงานเป็น 4 work package (WP)

## สารบัญ
- 0. สรุปงาน
- 1. หลักการ "อธิบายได้" (ใช้กับทุก WP)
- 2. โครงสร้างเว็บใหม่
- 3. ทีมและการทำงานร่วมกัน
- 4. กติกาของ Claude Code (ทุก WP)
- 5. Stack และ version
- 6. Design system ที่เพิ่ม
- 7. WP-0: หน้าแรกใหม่ + เปลี่ยนชื่อ + ปรับโครงสร้าง (Pisit ทำก่อน)
- 8. WP-1: MIPS Simulator (สรุป)
- 9. WP-2: การคูณแบบ MIPS (สรุป)
- 10. WP-3: การหารแบบ MIPS (สรุป)
- 11. Testing, review 3 รอบ และรายงานท้าย WP
- 12. Deploy และงานของ Pisit หลัง merge
- 13. คำถามตั้งต้นของระยะที่ 2
- ภาคผนวก A: prompt สำหรับวางใน Claude Code
- ภาคผนวก B: `CLAUDE.md` ฉบับใหม่
- ภาคผนวก C: ข้อมูลหัวข้อและข้อความหน้าแรก
- ภาคผนวก D: ไฟล์ golden ที่ตรวจแล้ว

---

## 0. สรุปงาน

- หัวข้อของกลุ่ม (กลุ่ม 2 สาย software): **เว็บไซต์เพื่อการเรียนรู้ และ Simulation**
- อาจารย์ย้ำว่าคะแนนมาจากการ**อธิบายได้** ("อธิบายได้ เข้าใจก็ได้คะแนนเยอะครับ") → ทุกหน้าต้องช่วยทั้งคนเรียนและคนนำเสนอให้อธิบายได้ทีละขั้น (หัวข้อ 1)
- หน้าแรกใหม่เป็นหน้าเลือกหัวข้อ: หัวข้อเรียน 3 เรื่อง (เรียงตามตำรา Patterson & Hennessy บทที่ 3) + MIPS Simulator 1 อัน

| ลำดับ | หัวข้อ | route | สถานะตอนเริ่มระยะที่ 2 | ใครทำ | ตำรา P&H |
|---|---|---|---|---|---|
| 1 | การคูณแบบ MIPS | `/multiply` | กำลังพัฒนา | เพื่อน (WP-2) | 3.3 Multiplication |
| 2 | การหารแบบ MIPS | `/divide` | กำลังพัฒนา | เพื่อน (WP-3) | 3.4 Division |
| 3 | Floating-Point (IEEE 754) | `/floating-point` | พร้อมเรียน (ย้ายจากเว็บเดิม) | เสร็จในระยะที่ 1 | 3.5 Floating Point |
| Sim | MIPS Simulator | `/mips` | กำลังพัฒนา | Pisit (WP-1, ค่าเริ่มต้น) | MIPS Reference Data (`EMIPS.pdf`) |

| WP | งาน | ใครทำ | เริ่มได้เมื่อ | branch | spec |
|---|---|---|---|---|---|
| WP-0 | เปลี่ยนชื่อ + หน้าแรก (hub) + ย้าย route + เตรียมโครงร่วมให้ทีม | Pisit | **ตอนนี้ (ทำก่อน)** | `wp0-hub` | หัวข้อ 7 ของไฟล์นี้ |
| WP-1 | MIPS Simulator | Pisit (เปลี่ยนได้) | หลัง WP-0 merge | `wp1-mips-sim` | `docs/plans/wp1-mips-sim.md` |
| WP-2 | การคูณแบบ MIPS | เพื่อน | หลัง WP-0 merge | `wp2-multiply` | `docs/plans/wp2-multiply.md` |
| WP-3 | การหารแบบ MIPS | เพื่อน | หลัง WP-0 merge | `wp3-divide` | `docs/plans/wp3-divide.md` |

- WP-1, WP-2, WP-3 ทำพร้อมกันได้ เพราะแต่ละ WP แก้เฉพาะโฟลเดอร์ของตัวเอง (หัวข้อ 3.3) และเปลี่ยนสถานะหัวข้อของตัวเองด้วยการแก้บรรทัดเดียว
- ข้อมูลที่ตรวจแล้วตอนเขียนแผน (ภาคผนวก D): รหัสเครื่อง MIPS 41 คำสั่ง + pseudo-instruction 12 แบบ (ยืนยันด้วย Capstone), โปรแกรมตัวอย่าง 12 โปรแกรม (ยืนยันด้วย Unicorn), ทดสอบสุ่มเทียบ Unicorn 23,700 โปรแกรม และขั้นตอนคูณ/หารตามตำราครบทุกคู่ 4 บิตและ 8 บิต
- ไม่มี backend, database, login หรือ env เหมือนเดิม: ทุกอย่างคำนวณใน browser และทุก route เป็น static

---

## 1. หลักการ "อธิบายได้" (ใช้กับทุก WP)

1. ทุกกระบวนการหลายขั้นเล่นผ่าน `StepPlayer` ตัวเดิม (ย้อน/ถัดไป/เล่น/ความเร็ว/กดกระโดดขั้น/คีย์บอร์ด/โหมดนำเสนอ) และทุกขั้นมีคำอธิบาย 2 ส่วน: **ทำอะไร** (พร้อมตัวเลขจริงของขั้นนั้น) และ **ทำไม** เขียนเป็นประโยคไทยสั้น ๆ ที่คนนำเสนออ่านออกเสียงได้ทันที
2. ทุกตัวเลข บิต และ hex ที่แสดง คำนวณจาก engine หรือโมเดลของหัวข้อนั้น ห้ามพิมพ์เอง (เหมือนระยะที่ 1)
3. สิ่งที่เปลี่ยนในขั้นนั้นต้องเห็นชัด: บิตหรือ register ที่เปลี่ยนมี highlight และบอกค่าเดิม → ค่าใหม่
4. ภาพฮาร์ดแวร์ (register, ALU, control, เส้นข้อมูล) วาดเองเป็น SVG ด้วยชุด `src/components/hw/` และไฮไลต์ส่วนที่ทำงานในขั้นนั้น · ห้ามใช้รูปหรือตารางจากตำราหรือ `EMIPS.pdf` (ใช้เป็นข้อมูลอ้างอิงได้ แต่ต้องวาดและเขียนเอง)
5. ท้ายทุกหัวข้อมี 3 ส่วนเสมอ: **สรุป**, **ประเด็นสำหรับอธิบาย** (4–6 ข้อ ให้คนนำเสนอใช้พูด) และ **คำถามชวนคิด** (3–5 ข้อ กดดูเฉลยได้ ใช้ซ้อมตอบคำถามอาจารย์)
6. สีเดียวกันหมายถึงสิ่งเดียวกันทั้งเว็บ (หัวข้อ 6.1) และทุกสีมีป้ายข้อความกำกับ (สีไม่ใช่สิ่งเดียวที่บอกความหมาย)
7. เชื่อมหัวข้อเข้าหากัน: หน้าคูณ/หารมีปุ่ม "ลองใน MIPS Simulator" ที่เปิดโปรแกรมตัวอย่างที่ตรวจแล้ว · บทคูณ/หาร Floating-Point ชี้ไปหัวข้อคูณ/หาร (การคูณ Significand ใช้ shift-and-add แบบเดียวกัน)
8. ทำให้เห็นข้อจำกัดของฮาร์ดแวร์จริง เพราะเป็นเรื่องที่อาจารย์มักถาม เช่น ทำไมผลคูณต้องยาว 64 บิต, ทำไมบาง register ต้องมีบิตเพิ่ม 1 บิต, ทำไม `mult` ไม่ตรวจ overflow, ทำไม `jal` ใน Green Card เขียนว่า PC+8

---

## 2. โครงสร้างเว็บใหม่

### 2.1 Route
| route | หน้า | ใครทำ |
|---|---|---|
| `/` | หน้าแรก: เลือกหัวข้อ (hub) | WP-0 |
| `/multiply` | การคูณแบบ MIPS | WP-0 ทำหน้า "กำลังพัฒนา" ไว้ก่อน → WP-2 แทนที่ |
| `/divide` | การหารแบบ MIPS | WP-0 ทำหน้า "กำลังพัฒนา" ไว้ก่อน → WP-3 แทนที่ |
| `/floating-point` | ภาพรวมหัวข้อ Floating-Point (ย้ายเนื้อหาหน้าแรกเดิมมา) | WP-0 |
| `/floating-point/number-systems`, `/floating-point/binary-fractions`, `/floating-point/ieee-754`, `/floating-point/add-sub`, `/floating-point/mul-div` | 5 บทเดิม (ย้ายจาก `/learn/<slug>`) | WP-0 |
| `/floating-point/lab` | Lab (ย้ายจาก `/lab`) | WP-0 |
| `/mips` | MIPS Simulator | WP-0 ทำหน้า "กำลังพัฒนา" ไว้ก่อน → WP-1 แทนที่ |

Redirect แบบถาวร (308) ใน `next.config.ts` → `redirects()` เพื่อให้ลิงก์เก่าที่เคยแชร์ยังเปิดได้ (query string ติดไปด้วย เช่น share link ของ Lab · ตรวจวิธีเขียนกับ docs ของ Next.js 16 ก่อน):
| จาก | ไป |
|---|---|
| `/learn` | `/floating-point` |
| `/learn/:slug` | `/floating-point/:slug` |
| `/lab` | `/floating-point/lab` |

### 2.2 Topic registry: `src/content/topics.ts` (แหล่งข้อมูลเดียวของหัวข้อ)
- หน้าแรก เมนูบน เมนูมือถือ footer sitemap หน้า "กำลังพัฒนา" และปุ่ม "ลองใน MIPS Simulator" อ่านข้อมูลจากไฟล์นี้ทั้งหมด ห้าม hardcode รายชื่อหรือสถานะหัวข้อที่อื่น
- โครง (ข้อมูลจริงอยู่ในภาคผนวก C):
```ts
export type TopicId = 'multiply' | 'divide' | 'floating-point' | 'mips';
export type TopicStatus = 'ready' | 'coming-soon';
export interface Topic {
  id: TopicId;
  kind: 'lesson' | 'simulator';
  /** ลำดับบนหน้าแรก: บทเรียน 1-3 ตามตำรา แล้วตามด้วย Simulator */
  order: number;
  href: `/${TopicId}`;
  title: string;      // ชื่อเต็ม เช่น "การคูณแบบ MIPS"
  short: string;      // ชื่อสั้นในเมนู เช่น "คูณ"
  blurb: string;      // 1 บรรทัดบนการ์ด
  covers: string[];   // สิ่งที่จะได้เรียน (การ์ดและหน้า "กำลังพัฒนา")
  textbook: string;   // เช่น "Patterson & Hennessy หัวข้อ 3.3"
  icon: TopicIconName;
  status: TopicStatus;
}
export const TOPICS: readonly Topic[];
export function topicById(id: TopicId): Topic;
export const isReady = (id: TopicId): boolean => topicById(id).status === 'ready';
```
- **เปลี่ยนสถานะ = แก้ `status` บรรทัดเดียว** โดย WP เจ้าของหัวข้อ เมื่องาน Must ของ WP นั้นเสร็จ (WP-1 → `mips`, WP-2 → `multiply`, WP-3 → `divide`)
- unit test: id ไม่ซ้ำ, `href === '/' + id`, `order` เป็น 1..4 ไม่ซ้ำ, ทุกหัวข้อมี `covers` อย่างน้อย 3 ข้อ

### 2.3 หน้าแรก `/` (hub)
- เป้าหมาย: เลือกหัวข้อได้ทันที · บนมือถือ 390×844 ต้องเห็นการ์ดหัวข้อแรกโดยไม่ต้องเลื่อน (hero สั้น)
- โครง:
  1. Hero สั้น: pill "Computer Architecture · เว็บไซต์เพื่อการเรียนรู้และ Simulation" → H1 **comkrub** → tagline → ประโยคแนะนำ 1 ประโยค (ข้อความในภาคผนวก C)
  2. **เลือกหัวข้อเรียน** (คำรอง "เรียงตามตำรา Patterson & Hennessy บทที่ 3"): การ์ด 3 ใบเรียงตาม `order` (มือถือ 1 คอลัมน์, tablet 2, desktop 3) แต่ละใบมี: ไอคอน, ป้าย "หัวข้อที่ n", ชื่อ, blurb, ป้ายสถานะ, `covers` 2 ข้อแรกเป็นรายการสั้น และ `textbook` ตัวเล็ก
  3. **ทดลองด้วย Simulator**: การ์ด MIPS Simulator ใบกว้าง (เต็มแถวบน desktop) ใช้ `BeamRing` เป็นจุดเด่น
  4. แถบ "วิธีใช้เว็บนี้" 3 ข้อสั้น ๆ (ข้อความในภาคผนวก C)
- การ์ดสถานะ "กำลังพัฒนา" ยังกดได้ (ไปหน้า "กำลังพัฒนา" ตามที่ Pisit ต้องการ) แต่ดูจางกว่าการ์ดที่พร้อมเรียนเล็กน้อย · การ์ดที่พร้อมเรียนมีป้าย "พร้อมเรียน" และยกขึ้นตอน hover แบบ `Glass interactive`
- ใช้ `BlurFade` เล็กน้อยตอนเข้า (ปิดเมื่อ reduced motion) · ไม่มี demo หนัก ๆ ในหน้านี้ (demo 0.1 + 0.2 ย้ายไปหน้า `/floating-point`)

### 2.4 หน้า "กำลังพัฒนา" (component `ComingSoon`)
- ใช้กับทุกหัวข้อที่ `status === 'coming-soon'` (`/multiply`, `/divide`, `/mips` ตอนเริ่ม)
- เนื้อหา: ไอคอนหัวข้อ, ชื่อหัวข้อ, ป้าย "กำลังพัฒนา", ข้อความแจ้ง, รายการ "สิ่งที่จะได้เรียน" จาก `covers`, อ้างอิงตำรา, ปุ่ม "กลับหน้าแรก" และปุ่มไปหัวข้อเรียนที่พร้อมแล้ว (เลือกจาก registry ไม่ hardcode)
- metadata: `title` = ชื่อหัวข้อ, `robots: { index: false }` · ไม่อยู่ใน sitemap · เป็นหน้า static (HTTP 200)
- ไฟล์หน้า (`src/app/<id>/page.tsx`) มีแค่ metadata + `<ComingSoon id="<id>" />` เพื่อให้ WP เจ้าของแทนที่ไฟล์นี้ได้ทั้งไฟล์

### 2.5 การนำทาง
- **Header (desktop ≥ 1024px)**: โลโก้ comkrub + ลิงก์หัวข้อ 4 อันจาก registry (ใช้ `short`) · หัวข้อที่ยังไม่พร้อมมีจุดเล็กสีเทาและ `title="กำลังพัฒนา"` · active เมื่อ pathname ขึ้นต้นด้วย href ของหัวข้อ
- **เมนูมือถือ (drawer เดิม)**: หัวข้อ 4 อัน (ไอคอน ชื่อ blurb ป้ายสถานะ) · ถ้ากำลังอยู่ในหัวข้อ Floating-Point ให้แสดงบท 1–5 และ Lab ซ้อนอยู่ใต้หัวข้อนั้น
- **แถบบทของ Floating-Point**: `src/app/floating-point/layout.tsx` แสดงแถบ pill เลื่อนแนวนอนได้ (ภาพรวม · 1 เลขฐานสอง · 2 เศษส่วนฐานสอง · 3 IEEE 754 · 4 บวก/ลบ · 5 คูณ/หาร · Lab) แทน `NavLinks` เดิมที่อยู่ใน header พร้อม breadcrumb "comkrub / Floating-Point / บทที่ n"
- **Footer**: คำอธิบายเว็บแบบใหม่ (ทั้งเว็บ), รายการหัวข้อจาก registry (แทนรายการบท), อ้างอิง, เครดิตผู้จัดทำ 4 คนและอาจารย์ (ไม่เปลี่ยน), ป้าย Analytics (ไม่เปลี่ยน) · ลิงก์ GitHub แสดงเฉพาะเมื่อ `site.githubUrl` ไม่เป็น `null` (คำถาม WP0-Q1)
- ปุ่มบทก่อน/ถัดไปของ Floating-Point (`ChapterNav`) ทำงานเหมือนเดิมแต่ใช้ route ใหม่

### 2.6 Metadata และ SEO
- `site.name = 'comkrub'` · title template `%s · comkrub` · หน้าแรกใช้ `comkrub · <tagline>`
- OG image (`src/app/opengraph-image.tsx`) เปลี่ยนเป็น comkrub + `site.ogSubtitle` (ฟอนต์ไทยเดิม)
- sitemap: `/`, `/floating-point`, 5 บท, `/floating-point/lab` และหัวข้ออื่นเฉพาะที่ `status === 'ready'`
- ทุกหน้าหัวข้อมี `title` และ `description` ของตัวเอง

---

## 3. ทีมและการทำงานร่วมกัน

### 3.1 บทบาท
- **Pisit**: เจ้าของ repo และ Vercel · ทำ WP-0 ก่อน แล้วทำ WP-1 (ค่าเริ่มต้น) · review และ merge ทุก PR · ตอบคำถามในไฟล์ progress ของแต่ละ WP
- **เพื่อน 2 คน**: WP-2 การคูณ และ WP-3 การหาร (ใช้ Claude Code เหมือนกัน) · สมาชิกคนที่ 4 ช่วยตรวจเนื้อหา ทดสอบบนมือถือ ซ้อมนำเสนอ หรือรับ WP-1 แทน Pisit ได้ (WP0-Q2)
- ทุกคนทำงานผ่าน Claude Code ตาม spec ของ WP ตัวเองและกติกาเดียวกันใน `CLAUDE.md`

### 3.2 Git flow
- 1 WP = 1 branch จาก `main` ล่าสุด: `wp0-hub`, `wp1-mips-sim`, `wp2-multiply`, `wp3-divide`
- **ห้าม commit หรือ push เข้า `main` ตรง ๆ** (ทุก push เข้า `main` ขึ้นเว็บจริงทันที) · commit บน branch ของตัวเองแล้ว push branch บ่อย ๆ
- อัปเดต branch ให้ทัน `main` ด้วย `git fetch origin && git merge origin/main` (ห้าม rebase branch ที่ push แล้ว เพราะต้อง force push) · ถ้า conflict ในไฟล์ที่ไม่ใช่ของ WP ตัวเอง ให้เลือกฝั่ง `main` แล้วจดไว้ในไฟล์ progress
- จบ WP (หรือจบ phase ใหญ่ที่อยากให้ขึ้นเว็บ): เปิด Pull Request เข้า `main` (`gh pr create` ถ้าเครื่องมี gh ไม่งั้นบอกเจ้าของ branch ให้กดเปิดบน GitHub) ใส่สรุป checklist (3.5) และ path screenshot
- **Pisit เป็นคน merge** ด้วยปุ่ม **"Create a merge commit"** เท่านั้น (ไม่ใช้ squash หรือ rebase เหตุผลใน 3.6)
- ห้าม `git push --force`, `git reset --hard`, rewrite history, ลบ branch ของคนอื่น, commit secret

### 3.3 ไฟล์ที่แต่ละ WP แก้ได้
| WP | แก้/สร้างได้ | ไฟล์ร่วมที่แก้ได้แบบจำกัด |
|---|---|---|
| WP-0 | ทุกไฟล์ (เป็นคนวางโครง) | - |
| WP-1 | `src/app/mips/**`, `src/lib/mips/**`, `src/components/mips/**`, `src/content/mips/**`, `src/content/glossary/mips.ts`, `tests/unit/mips/**`, `tests/e2e/mips.spec.ts`, `docs/progress/wp1-mips-sim.md` | `src/content/topics.ts` (เฉพาะ `status` ของ `mips`) · `package.json` + `package-lock.json` (เพิ่ม dependency ของ WP-1 เท่านั้น) · `src/lib/site.ts` (เพิ่มบรรทัดอ้างอิง MIPS Reference Data) · `docs/STACK.md` (เพิ่มแถว dependency ใหม่) |
| WP-2 | `src/app/multiply/**`, `src/lib/multiply/**`, `src/components/multiply/**`, `src/content/multiply/**`, `src/content/glossary/multiply.ts`, `tests/unit/multiply/**`, `tests/e2e/multiply.spec.ts`, `docs/progress/wp2-multiply.md` | `src/content/topics.ts` (เฉพาะ `status` ของ `multiply`) |
| WP-3 | `src/app/divide/**`, `src/lib/divide/**`, `src/components/divide/**`, `src/content/divide/**`, `src/content/glossary/divide.ts`, `tests/unit/divide/**`, `tests/e2e/divide.spec.ts`, `docs/progress/wp3-divide.md` | `src/content/topics.ts` (เฉพาะ `status` ของ `divide`) |

- ไฟล์ร่วมอื่นทั้งหมด (`src/components/{bits,player,glass,layout,topic,hw,content,ui,tools,viz}/**`, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/fp/**`, `next.config.ts`, `CLAUDE.md`, `PLAN.md`, `docs/plans/**`, test ของ WP อื่น) **ห้ามแก้**
- ถ้าจำเป็นจริง ๆ (เช่นเจอบั๊กใน component ร่วม): แก้แบบไม่ทำให้ของเดิมพัง แยกเป็น commit เดียวที่ขึ้นต้นด้วย `fix(shared):` และจดในไฟล์ progress หัวข้อ "แก้ไฟล์ร่วม" ว่าแก้อะไรเพราะอะไร ให้ Pisit ตรวจตอน review
- **ห้ามเพิ่ม dependency** ใน WP-2 และ WP-3 (ของที่ต้องใช้มีครบแล้ว) · ถ้าคิดว่าจำเป็นให้จดเป็นคำถาม

### 3.4 ไฟล์ความคืบหน้าและคำถาม (แยกต่อ WP เพื่อไม่ให้ชนกัน)
- `docs/progress/wp0-hub.md`, `wp1-mips-sim.md`, `wp2-multiply.md`, `wp3-divide.md` (WP-0 สร้างโครงไว้ให้ครบ 4 ไฟล์)
- รูปแบบ:
```md
# WP-2 การคูณแบบ MIPS: ความคืบหน้า
- branch: wp2-multiply · ผู้รับผิดชอบ: <ชื่อ> · สถานะ: กำลังทำ | รอ review | merge แล้ว
## งาน (ตาม phase ใน spec)
- [x] ... (สั้น ๆ ว่าทำอะไร / เหลืออะไร)
## คำถาม
### WP2-Q1 [ด่วน | ยืนยันค่าเริ่มต้น | ไม่ด่วน] หัวข้อสั้น ๆ
- คำถาม: ...
- ค่าที่สมมติไว้ตอนนี้: ...
- ถ้าคำตอบต่าง ต้องแก้: ...
- สถานะ: รอคำตอบ
## แก้ไฟล์ร่วม
- (ไม่มี) หรือ path + เหตุผล + commit
## Review
- รอบ 1 / 2 / 3: สิ่งที่เจอและแก้
## บันทึกการตัดสินใจ / ต่างจากแผน
```
- `docs/PROGRESS.md`, `docs/QUESTIONS.md`, `docs/REVIEW.md`, `docs/FINAL_REPORT.md` เดิมเป็นประวัติของระยะที่ 1 (WP-0 ใส่บรรทัดแรกว่าเป็นประวัติระยะที่ 1 และไม่แก้อย่างอื่น)

### 3.5 CI, PR และการ review
- WP-0 เพิ่ม `.github/workflows/ci.yml`: รันเมื่อมี pull request และ push เข้า `main` · Node 24 · `npm ci` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run build` · ใช้ major ล่าสุดของ `actions/checkout` และ `actions/setup-node` (ตรวจเมื่อ 31 ต.ค. 2569 เป็น `@v7` ทั้งคู่ ให้ตรวจซ้ำก่อนใช้) · e2e ไม่รันบน CI (รันในเครื่องตาม DoD)
- WP-0 เพิ่ม `.github/pull_request_template.md`:
```md
## WP และสรุป
## Checklist
- [ ] แก้เฉพาะไฟล์ของ WP นี้ (PLAN.md 3.3) หรือจด "แก้ไฟล์ร่วม" ไว้แล้ว
- [ ] lint + typecheck + test + build ผ่าน
- [ ] e2e ของ WP นี้ผ่านบน pixel7 + iphone13 + desktop
- [ ] เปิดดู screenshot มือถือ 390px และ desktop 1440px แล้ว (ใส่ path)
- [ ] docs/progress/<wp>.md อัปเดตแล้ว และ review 3 รอบเสร็จ
- [ ] ไม่มี emoji ไม่มีตัวเลขที่พิมพ์เอง ไม่มีรูปหรือตารางจากตำรา
```
- Pisit review: เปิด PR → CI ต้องเขียว → ดึง branch มาเปิด `npm run dev` ดูหน้าใหม่บนมือถือ (หรือดู preview ของ Vercel ถ้าขึ้น) → แท็บ Files changed ต้องไม่มีไฟล์นอกขอบเขต → merge แบบ merge commit

### 3.6 Vercel กับการทำงานเป็นทีม
- โปรเจกต์ Vercel เป็นแผน Hobby และ repo เป็น private · เอกสารของ Vercel ระบุว่าบัญชี Hobby ให้เฉพาะเจ้าของบัญชี trigger deployment ได้ และ Vercel ตรวจว่าผู้เขียน commit มีสิทธิ์ในโปรเจกต์ก่อน deploy → **commit ของเพื่อนจะไม่ขึ้น preview บน Vercel** (Vercel Bot จะ comment ว่า blocked) ถือว่าปกติ เพื่อนทดสอบในเครื่องด้วย `npm run dev` / `npm run build`
- ตอน merge ให้ Pisit ใช้ "Create a merge commit" เพื่อให้ commit ล่าสุดบน `main` เป็นของ Pisit · ถ้า production ยังไม่ deploy หลัง merge ให้ Pisit กด **Redeploy** ใน Vercel หรือ push commit ว่างจากเครื่องตัวเอง (`git commit --allow-empty -m "chore: deploy"` แล้ว `git push`)
- Claude Code ห้ามแก้ settings บน Vercel (Pisit ทำเอง)

### 3.7 เพื่อนเริ่มงานยังไง (WP-0 เขียนเป็น `docs/TEAM.md`)
1. Pisit เชิญเป็น collaborator: GitHub → repo → Settings → Collaborators → Add people (repo เป็น private) แล้วเพื่อนกดรับคำเชิญในอีเมล
2. ติดตั้ง Git, Node.js 24 ขึ้นไป, VS Code, Claude Code (ส่วนขยาย VS Code หรือ CLI) แล้วล็อกอินบัญชี Claude · ตั้ง Context7 MCP ด้วย `npx ctx7 setup --claude` (ตัวเดียวกับที่ Pisit ใช้) แล้วพิมพ์ `/mcp` ใน Claude Code ต้องเห็น context7
3. `git clone https://github.com/Pisit-s/ProjectComArch.git` → เปิดโฟลเดอร์ใน VS Code → `npm install` → `npx playwright install chromium webkit` (ครั้งแรก) → `npm run dev` แล้วเปิด http://localhost:3000 ต้องเห็นหน้าแรก comkrub
4. ใน Claude Code: เลือก model ที่ดีที่สุดที่บัญชีมี (Opus 5.5 effort high ถ้ามี) และโหมด Auto → วาง prompt ของ WP ตัวเองจากภาคผนวก A (A.3 หรือ A.4) → ปล่อยให้ทำงาน
5. ถ้าชน usage limit หรือเปิด session ใหม่ ให้วาง prompt "ทำต่อ" (A.5)
6. งานเสร็จ: Claude Code เปิด PR ให้ (หรือบอกให้กดเปิดบน GitHub) → แจ้ง Pisit
7. คำถามที่ Claude Code จดไว้อยู่ใน `docs/progress/<wp>.md` หัวข้อ "คำถาม" → คุยกับ Pisit แล้วพิมพ์คำตอบให้ Claude Code แก้ตาม

---

## 4. กติกาของ Claude Code (ทุก WP)

### 4.1 ห้ามหยุดรอคำตอบ
- ห้ามใช้ AskUserQuestion และห้ามจบ turn เพื่อถามระหว่างทาง → จดคำถามในไฟล์ progress ของ WP (รูปแบบ 3.4 มี "ค่าที่สมมติไว้") แล้ว**ทำงานต่อด้วยค่าสมมตินั้น** หรือข้ามไปทำงานอื่นที่ไม่ติด
- ข้อมูลของเว็บ (ชื่อ เครดิต ลิงก์) อยู่ที่ `src/lib/site.ts` จุดเดียว

### 4.2 เริ่มงานและทำต่อ
- ก่อนเริ่ม: `git status` ต้องสะอาด (ยกเว้นตอนเริ่ม WP-0 ที่ไฟล์แผนใหม่ `PLAN.md` และ `docs/plans/` ยังไม่ได้ commit: ให้ commit ตามขั้นที่ 1 ของหัวข้อ 7) · `git branch --show-current` ต้องเป็น branch ของ WP (ถ้าไม่ใช่ให้สร้างจาก `origin/main` ล่าสุด) · อ่าน `CLAUDE.md`, PLAN.md หัวข้อ 0–6 และ 11 และ spec ของ WP ให้ครบในรอบแรก จากนั้นเปิดอ่านเฉพาะหัวข้อที่ใช้ทุกครั้งที่เริ่ม phase ใหม่ (แผนยาว อย่าพึ่งความจำ)
- อัปเดตไฟล์ progress ทุกครั้งที่จบงานย่อย (checkbox + สั้น ๆ) เพื่อให้ session ใหม่ทำต่อได้ทันทีถ้าชน usage limit หรือ context ถูก compact
- ทำตามลำดับ phase ใน spec ห้ามข้าม DoD

### 4.3 Git
- Conventional Commits ภาษาอังกฤษ เช่น `feat(hub): topic picker home page`, `feat(mips): two-pass assembler`, `test(multiply): exhaustive 4-bit traces`
- commit ทุกงานย่อยที่ผ่าน quality gate · push branch ทุกครั้งที่จบ phase และอย่างน้อยทุก ~1 ชม. ของงาน · กติกาที่เหลือตาม 3.2

### 4.4 Quality gates
- ก่อน commit: `npm run lint` · `npm run typecheck` · `npm test` ผ่านหมด
- งานที่แตะ UI: รัน e2e ที่เกี่ยวข้อง (ระหว่างทำใช้ project `pixel7`) + ถ่าย screenshot 390×844 และ 1440×900 (`npm run shots`) แล้ว**เปิดดูรูปจริงด้วย Read** ก่อนบอกว่าเสร็จ
- จบ phase: `npm run build` ผ่านและทุก route เป็น static (○) · จบ WP: e2e ทั้งหมดผ่านบน pixel7 + iphone13 + desktop
- ห้ามบอกว่าเสร็จถ้ายังไม่ verify จริง · ห้ามปิดหรือ skip test เพื่อให้ผ่าน · ห้ามลด `numRuns` ที่ spec กำหนด

### 4.5 Context7 และ version
- ก่อนเขียนโค้ดที่ใช้ library ใด ให้เปิด docs ผ่าน Context7 ก่อนทุกครั้ง (`resolve-library-id` → `query-docs`) เพราะความรู้ใน training data อาจเก่ากว่า version ที่ติดตั้ง

| library | Context7 ID |
|---|---|
| Next.js 16 | `/vercel/next.js` + `node_modules/next/dist/docs/` (AGENTS.md ชี้ไว้) |
| daisyUI 5 | `/websites/daisyui` |
| Tailwind CSS v4 | `/tailwindlabs/tailwindcss.com` |
| motion | `/websites/motion_dev` |
| CodeMirror 6 (WP-1) | `/websites/codemirror_net`, `/codemirror/autocomplete`, `/codemirror/lint` |
| react-resizable-panels 4 (WP-1) | `/bvaughn/react-resizable-panels` |
| Vitest / fast-check / Playwright | resolve ตอนใช้ |

- นโยบาย version ตามหัวข้อ 5

### 4.6 ข้อห้าม
- ห้ามแก้ สร้าง หรือลบไฟล์ใด ๆ ใน `/Users/pisit/Documents/Development/CoE-Shop` (เว็บใช้งานจริง) · ใช้ `docs/reference/coe-shop/` แทน
- ห้ามแก้ requirement 2 ไฟล์เดิมของเพื่อนใน `floating_website_requirement/`
- ห้าม deploy เอง: ห้ามรัน `vercel` CLI และห้ามแตะ settings บน Vercel
- ห้ามใช้ `curl | bash` หรือติดตั้งของนอก npm
- ห้ามพิมพ์ตัวเลข บิต หรือ hex ของตัวอย่างในเนื้อหาเอง ต้อง render จาก engine/โมเดล
- `EMIPS.pdf` (MIPS Reference Data, © Elsevier) ใช้เป็นข้อมูลอ้างอิงเท่านั้น: ห้ามคัดลอก layout หรือรูป ห้ามนำไปไว้ใน `public/` หรือให้ดาวน์โหลดจากเว็บ · ตารางคำสั่งในเว็บต้องจัดและเขียนคำอธิบายเองเป็นภาษาไทย และใส่อ้างอิง "MIPS Reference Data (Green Card), Patterson & Hennessy, Computer Organization and Design, 4th ed."
- ห้ามใช้รูป figure หรือข้อความจากตำรา/เว็บอื่น · วาดและเขียนเองทั้งหมด อ้างอิงได้แค่ชื่อแหล่งที่มาและหมายเลขหัวข้อ

### 4.7 สไตล์
- ห้าม emoji ในทุกสิ่งที่สร้าง (UI ข้อความ comment commit docs) ใช้ `lucide-react` หรือ inline SVG
- ภาษาไทยอ่านเหมือนอาจารย์/วิศวกรไทยเขียน: สั้น ตรง เป็นกันเอง ใช้ศัพท์อังกฤษที่คนใช้จริง (Multiplicand, Multiplier, Product, Dividend, Divisor, Quotient, Remainder, register, ALU, shift, opcode, funct, immediate) ไม่แปลตรงตัว · ถ้าอยากให้คำไทย ใส่ในวงเล็บครั้งแรกครั้งเดียว · ห้ามสำนวนแบบ AI ("มาดำดิ่งกัน", "ไขความลับ", "เปิดโลก")
- ศัพท์ต้องตรงกันทั้งเว็บตาม glossary (หัวข้อ 6.3 และ stage1 7.9)
- โค้ด ชื่อตัวแปร commit เป็นภาษาอังกฤษ · docs เป็นภาษาไทย + ศัพท์เทคนิคภาษาอังกฤษ

### 4.8 ประหยัด token
- Vitest `--reporter=dot`, Playwright `reporter: 'line'` · log ยาวดูแค่ `| tail -40` หรือ `| grep -iE "error|warn"`
- แผนยาว: `grep -n "^## \|^### " <file>` หาเลขบรรทัดแล้ว Read เฉพาะหัวข้อ · screenshot เปิดดูเฉพาะหน้าที่เพิ่งแก้
- ไม่เปิดไฟล์ generate (`package-lock.json`, `.next/`, `node_modules/`, `coverage/`, `test-results/`)
- เครื่อง Pisit มี RAM 8 GB: เปิด dev server ตัวเดียวและปิดเมื่อเลิกใช้

---

## 5. Stack และ version
- stack เดิมไม่เปลี่ยน (ของที่ติดตั้งจริงอยู่ใน `docs/STACK.md`): Next.js 16.4.3 (App Router, static ทั้งเว็บ, `typedRoutes`) · React 19.3.1 · TypeScript ~6.0.3 · Tailwind CSS 4.3.3 (`@tailwindcss/turbopack`) · daisyUI 5.7.50 · motion 14 · lucide-react 1.x · Vitest 5 + fast-check 4 · Playwright 1.64 + axe · `@vercel/analytics`
- dependency ใหม่ของระยะที่ 2 มีเฉพาะใน **WP-1** (ติดตั้งตอนเริ่ม WP-1 ด้วย `@latest` แล้วจดใน `docs/STACK.md`) · latest บน npm ณ 31 ต.ค. 2569:

| package | version | ใช้ทำอะไร |
|---|---|---|
| `codemirror` | 6.0.2 | `basicSetup` ของ editor |
| `@codemirror/view` / `state` / `language` / `commands` | 6.43.15 / 6.7.6 / 6.13.1 / 6.11.1 | editor core และ `StreamLanguage` สำหรับ syntax ของ MIPS |
| `@codemirror/autocomplete` / `lint` / `search` | 6.20.4 / 6.9.7 / 6.7.2 | autocomplete, แสดง error ใน editor, ค้นหา |
| `@lezer/highlight` | 1.2.5 | `HighlightStyle`, tags |
| `react-resizable-panels` | 4.15.3 | แบ่ง panel บน desktop (API v4: `Group`, `Panel`, `Separator`, `orientation`, `defaultLayout`, `onLayoutChanged`) |

- เลือก CodeMirror 6 แทน Monaco (ที่ z80-workspace ใช้) เพราะเบากว่ามาก ใช้บนมือถือได้ (Monaco ไม่รองรับมือถือ) และไม่ต้องตั้ง web worker
- นโยบาย version: ใช้ latest stable ยกเว้น `typescript` ~6.0.x (`typescript-eslint` 8.72.1 รองรับ `<6.1.0`), `eslint` ^9 (`eslint-plugin-react` 7.37.5 รองรับถึง ^9.7), `@types/node` ^24 (Vercel ใช้ Node 24) · ตรวจซ้ำด้วย `npm view <pkg> version` และ `peerDependencies` ก่อนติดตั้งทุกครั้ง
- ไม่ใช้: Monaco, dockview, DOSBox/WASM, state library เพิ่ม (ใช้ React state + `useReducer`), UI kit อื่นนอกจาก daisyUI

---

## 6. Design system ที่เพิ่ม (WP-0 ทำให้ทุก WP ใช้)

### 6.1 สี
- เพิ่มใน `@theme` ของ `src/app/globals.css` ทั้งสีหลักและสี `*-ink` สำหรับตัวอักษร · สี ink ต้อง contrast ≥ 4.5:1 บนพื้นขาวและบนพื้นสี 14% (ตรวจด้วยสคริปต์หรือ axe แล้วปรับค่า ink ได้ถ้าไม่ผ่าน จดค่าที่ใช้จริงใน progress)

**Field ของคำสั่ง MIPS** (WP-1 และส่วน "ใน MIPS" ของ WP-2/WP-3)
| token | ใช้กับ | สีหลัก |
|---|---|---|
| `mips-op` | opcode | `#102880` (navy-900 เดิม) |
| `mips-rs` | rs | `#0072B2` |
| `mips-rt` | rt | `#56B4E9` (ink เข้มกว่า เช่น `#1F6F9F`) |
| `mips-rd` | rd | `#009E73` |
| `mips-const` | shamt, immediate, address (ค่าคงที่ที่อยู่ในคำสั่ง) | `#CC79A7` |
| `mips-funct` | funct | `#E69F00` (ink เข้มกว่า เช่น `#8A5A00`) |

**บทบาทของ register ในการคูณ/หาร** (WP-2 และ WP-3 ใช้ชุดเดียวกัน คู่ที่ทำหน้าที่คล้ายกันใช้สีเดียวกัน)
| token | การคูณ | การหาร | สีหลัก |
|---|---|---|---|
| `md-operand` | Multiplicand | Divisor | `#0072B2` |
| `md-step` | Multiplier (บิตที่ถูกใช้ทีละบิต) | Quotient (บิตที่ถูกสร้างทีละบิต) | `#E69F00` |
| `md-acc` | Product | Remainder | `#009E73` |
| `md-alu` | ผลของ ALU, carry | ผลของ ALU, บิตเครื่องหมายของผลลบ | `#CC79A7` |
| `md-test` | บิตที่ control ใช้ตัดสินใจในขั้นนั้น | เหมือนกัน | `#D55E00` |

- สีของ Floating-Point (`bit-sign`, `bit-exp`, `bit-frac`, `bit-grs`) ไม่เปลี่ยน
- เพิ่ม `FieldKind` ใน `src/components/bits/field-style.ts` ให้ครบทุก token ข้างบน (label ภาษาอังกฤษตามคอลัมน์ "ใช้กับ") เพื่อให้ `BitCell` ใช้ได้ทุกหัวข้อ

### 6.2 Component ร่วมใหม่ (WP-0 สร้าง · WP อื่นใช้ ห้ามสร้างซ้ำ)
| component | ที่อยู่ | ใช้ทำอะไร |
|---|---|---|
| `TopicIcon` | `src/components/topic/topic-icon.tsx` | ไอคอนของหัวข้อ: คูณ `X`, หาร `Divide`, Floating-Point = `LogoMark` 3 แถบสีเดิม, MIPS `SquareTerminal` (ตรวจชื่อไอคอนใน lucide-react ก่อนใช้) |
| `StatusBadge` | `src/components/topic/status-badge.tsx` | ป้าย "พร้อมเรียน" / "กำลังพัฒนา" (daisyUI `badge`) |
| `TopicCard` | `src/components/topic/topic-card.tsx` | การ์ดหัวข้อบนหน้าแรก 2 แบบ: ปกติ และกว้างสำหรับ Simulator |
| `ComingSoon` | `src/components/topic/coming-soon.tsx` | หน้า "กำลังพัฒนา" (2.4) |
| `LessonLayout` | `src/components/layout/lesson-layout.tsx` | layout ของหน้าเรียนทุกหัวข้อ: eyebrow (ไอคอน + "หัวข้อที่ n"), H1, วัตถุประสงค์, เวลาอ่าน, TOC (desktop sticky / มือถือพับได้), prev/next · ทำโดยยก `ChapterLayout` เดิมออกมาเป็นแบบทั่วไป แล้วให้ `ChapterLayout` ของ Floating-Point เรียกใช้ต่อ (หน้าตาบท FP ต้องเหมือนเดิม) · `Section` และ `Summary` เดิมใช้ได้ทุกหัวข้อ |
| `BitRow` | `src/components/bits/bit-row.tsx` | แถวบิตทั่วไป: `label`, `value: bigint`, `width`, `kind: FieldKind \| ((bit: number) => FieldKind)`, `group` (เว้นช่องทุก n บิต), `split` (เส้นแบ่งครึ่งซ้าย/ขวา), `changed: number[]` (ตำแหน่งบิต 0 = LSB), `extraBit?: { value: 0 \| 1; label: string }` (ช่องเส้นประด้านซ้าย เช่น carry), `showValue?: 'unsigned' \| 'signed' \| 'hex' \| false`, `size` · MSB อยู่ซ้าย · แตะบิตแล้วบอกตำแหน่งและน้ำหนัก (2^i) |
| `TalkingPoints` | `src/components/content/talking-points.tsx` | กล่อง "ประเด็นสำหรับอธิบาย" (4–6 ข้อ ไอคอน `MessageSquareText`) |
| `SelfCheck` | `src/components/content/self-check.tsx` | "คำถามชวนคิด": รายการ `{ q, a }` กด "ดูเฉลย" เปิดทีละข้อ (daisyUI `collapse`) ใช้คีย์บอร์ดได้ |
| `OpenInSim` | `src/components/topic/open-in-sim.tsx` | ปุ่ม "ลองใน MIPS Simulator" → `/mips?example=<id>` · ถ้า `mips` ยังไม่ `ready` แสดงปุ่ม disabled "MIPS Simulator (กำลังพัฒนา)" · prop `example: MipsExampleId`, `label?` |
| `MipsExampleId` | `src/content/mips-example-ids.ts` | union type ของ id ตัวอย่างที่ WP-1 ต้องมีครบ: `hello`, `sum-loop`, `array-sum`, `max`, `factorial`, `mult-div`, `div-signs`, `endian`, `overflow`, `io`, `shift-add-multiply`, `restoring-divide` (ไฟล์ต้นฉบับใน `docs/plans/golden/mips/`) |
| ชุด SVG ฮาร์ดแวร์ | `src/components/hw/` | primitive สำหรับวาดภาพฮาร์ดแวร์ให้หน้าตาเหมือนกันทุกหัวข้อ: `HwRegister` (กล่อง register มีชื่อ ความกว้างบิต ค่า และสัญลักษณ์ shift ซ้าย/ขวา), `HwAlu` (รูป ALU), `HwControl` (กล่อง Control test), `HwWire` (เส้นมีหัวลูกศร สถานะ active ใช้สี primary + เส้นประวิ่ง ปิดเมื่อ reduced motion) · ใช้ `viewBox` ย่อขยายตามจอ · ทุกชิ้นรับ `active` และ `role` (สีจาก 6.1) |

- WP-0 ทำหน้า `/dev/kit` (ใช้เฉพาะตอน dev: ใน production เรียก `notFound()` และไม่อยู่ใน sitemap) แสดงทุก component ข้างบนพร้อมตัวอย่าง ให้ Claude Code ของทุก WP เปิดดูและถ่าย screenshot ได้

### 6.3 Glossary แยกไฟล์
- ย้าย `src/content/glossary.ts` เป็นโฟลเดอร์ `src/content/glossary/`: `fp.ts` (ของเดิมทั้งหมด), `arith.ts` (ศัพท์ร่วมของคูณ/หาร/MIPS ที่ WP-0 เขียนให้), `multiply.ts`, `divide.ts`, `mips.ts` (export object ว่างไว้ให้ WP เจ้าของเติม), `index.ts` (รวมเป็น `GLOSSARY` และ `TermKey` เดิม) · `Term` ทำงานเหมือนเดิม
- ศัพท์ใน `arith.ts` (WP-0 เขียนความหมาย 1 ประโยคต่อคำ): Multiplicand, Multiplier, Product, Partial product, Dividend, Divisor, Quotient, Remainder, Restoring division, ALU, Shift left/right, Logical shift, Arithmetic shift, Sign extension, Zero extension, Two's complement, Overflow (จำนวนเต็ม), Register, HI, LO, Opcode, funct, Immediate, R/I/J format, Pseudo-instruction

---

## 7. WP-0: หน้าแรกใหม่ + เปลี่ยนชื่อ + ปรับโครงสร้าง (Pisit ทำก่อน)

> เป้าหมาย: เว็บชื่อ comkrub มีหน้าแรกเลือกหัวข้อ · Floating-Point ย้ายไปอยู่ใต้ `/floating-point` และทำงานเหมือนเดิมทุกอย่าง · หัวข้ออื่นแสดง "กำลังพัฒนา" · มีโครงร่วมพร้อมให้ WP-1/2/3 เริ่มได้ทันทีโดยไม่ชนกัน
> branch `wp0-hub` · ไฟล์ progress `docs/progress/wp0-hub.md`

ทำตามลำดับ แต่ละขั้น commit แยก:
1. **เตรียม**: `git switch -c wp0-hub` จาก `main` ล่าสุด (ไฟล์แผนที่ Pisit วางไว้แต่ยังไม่ commit คือ `PLAN.md` ที่แก้แล้ว และโฟลเดอร์ `docs/plans/` จะติดมาด้วย) → commit แรกของ branch คือไฟล์แผนเหล่านั้นอย่างเดียว `docs: stage 2 plan for comkrub` · แทน `CLAUDE.md` ทั้งไฟล์ด้วยภาคผนวก B · สร้าง `docs/progress/` 4 ไฟล์ตามรูปแบบ 3.4 (wp0 ใส่งานจากหัวข้อนี้และคำถามจากหัวข้อ 13, ไฟล์อื่นใส่หัวไฟล์ branch และ "ยังไม่เริ่ม") · ใส่บรรทัดแรก "> ประวัติระยะที่ 1 (Floating-Point) · งานระยะที่ 2 ดู docs/progress/" ใน `docs/PROGRESS.md`, `QUESTIONS.md`, `REVIEW.md`, `FINAL_REPORT.md` · เปลี่ยน comment ในโค้ดที่อ้าง `PLAN.md x.y` เป็น `docs/plans/stage1-floating-point.md x.y` (grep `PLAN.md` ใน `src/`, `tests/`, `scripts/`) · ใน `globals.css` คง `@source not '../../PLAN.md'` และเพิ่ม `@source not '../../docs'` (ไม่ให้ Tailwind สแกนเอกสาร) → `chore: stage 2 rules, progress files and plan references`
2. **เปลี่ยนชื่อ**: `src/lib/site.ts` ตามภาคผนวก C (`name`, `tagline`, `description`, `ogSubtitle`, `githubUrl: null` แล้วให้ footer ซ่อนลิงก์ GitHub เมื่อเป็น `null` ในขั้นเดียวกัน · เครดิตผู้จัดทำและอาจารย์**ห้ามแก้**) · `package.json` `"name": "comkrub"` แล้ว `npm install --package-lock-only` · ชื่อธีม daisyUI `binarylab` → `comkrub` (`globals.css` + `data-theme` ใน `layout.tsx`) · `aria-label` ของโลโก้ใช้ `site.name` · โลโก้ใหม่ `LogoMark`: กรอบชิปสี่เหลี่ยมมุมมนสีน้ำเงินมีขาเล็ก ๆ ด้านข้าง ข้างในมีแถบ 3 สีเดิม (ต่อเนื่องจากโลโก้เดิม) · เก็บรูป 3 แถบเดิมไว้เป็นไอคอนของหัวข้อ Floating-Point · อัปเดต `icon.tsx` และ OG image · README เขียนใหม่สำหรับ comkrub (หัวข้อทั้งหมด, วิธีรัน, คำสั่ง, โครงสร้าง, ทีม, ลิงก์ `docs/TEAM.md`, ผู้จัดทำเหมือนเดิม) → `feat: rename site to comkrub`
3. **Topic registry**: `src/content/topics.ts` ตาม 2.2 + ข้อมูลภาคผนวก C · `TopicIcon`, `StatusBadge` · unit test ของ registry → `feat(topics): topic registry`
4. **ย้าย route ของ Floating-Point**: ย้าย `src/app/learn/<slug>/` → `src/app/floating-point/<slug>/` และ `src/app/lab/` → `src/app/floating-point/lab/` (ใช้ `git mv`) · `chapters.ts`: `href` เป็น `` `/floating-point/${slug}` `` และ `LAB.href = '/floating-point/lab'` · ค้นหา `'/learn` และ `'/lab'` ทั้ง repo (src, tests, scripts, README, docs ที่ยังใช้งาน) แล้วแก้ให้หมด รวมถึง path ใน share link ของ Lab (`src/lib/url-state.ts` หรือที่สร้างลิงก์) · สร้าง `src/app/floating-point/page.tsx` จากหน้าแรกเดิม (pill "หัวข้อที่ 3 · IEEE 754", H1 "Floating-Point", tagline เดิม "เข้าใจ Floating-Point ทีละบิต", demo 0.1 + 0.2, เส้นทางการเรียน, ทางลัด) · `src/app/floating-point/layout.tsx` (แถบบท + breadcrumb ตาม 2.5) · เพิ่ม `redirects()` ใน `next.config.ts` ตาม 2.1 · แก้ e2e ทุกไฟล์ให้ใช้ path ใหม่ → `refactor(fp): move floating-point under /floating-point with redirects`
5. **หน้าแรกใหม่**: `src/app/page.tsx` ตาม 2.3 ด้วย `TopicCard` และข้อความจากภาคผนวก C → `feat(hub): topic picker home page`
6. **หน้า "กำลังพัฒนา"**: `ComingSoon` + `src/app/multiply/page.tsx`, `src/app/divide/page.tsx`, `src/app/mips/page.tsx` ตาม 2.4 → `feat(hub): coming-soon pages`
7. **การนำทาง**: header, drawer มือถือ, footer, sitemap ตาม 2.5–2.6 (อ่านจาก registry ทั้งหมด) → `feat(nav): topic navigation`
8. **โครงร่วมสำหรับทีม**: tokens 6.1 + `FieldKind` ใหม่, `BitRow`, `LessonLayout` (ให้ `ChapterLayout` ของ FP ใช้ต่อและหน้าตาเหมือนเดิม), `TalkingPoints`, `SelfCheck`, `OpenInSim` + `mips-example-ids.ts`, ชุด `src/components/hw/`, glossary แยกไฟล์ (6.3), หน้า `/dev/kit` → `feat(shared): building blocks for topics`
9. **ลิงก์ข้ามหัวข้อ**: บทที่ 5 ของ Floating-Point เพิ่ม callout สั้น ๆ ตรงเรื่องการคูณ Significand และการหารยาว ชี้ไป `/multiply` และ `/divide` (ใช้ `isReady` · ถ้ายังไม่พร้อมให้เขียนชื่อหัวข้อตามด้วย "(กำลังพัฒนา)" โดยไม่เป็นลิงก์) → `feat(fp): link to integer multiply and divide topics`
10. **ทีม**: `.github/workflows/ci.yml` และ `.github/pull_request_template.md` (3.5) · `docs/TEAM.md` (3.7 + ตาราง 3.3 + วิธีอ่านคำถามในไฟล์ progress) · `docs/DEPLOY.md` เพิ่มหัวข้อ "ระยะที่ 2": ตรวจ redirect บนเว็บจริง, merge แบบ merge commit, ข้อจำกัด Vercel Hobby (3.6) → `chore: CI, PR template and team guide`
11. **ทดสอบ**: unit ทั้งหมด · e2e ทุกไฟล์บน pixel7 + iphone13 + desktop (รวม test ใหม่ข้างล่าง) · build ผ่านและทุก route static · Lighthouse หน้า `/` และ `/floating-point` ผ่านเป้าเดิม (stage1 10.4) · screenshot 390 และ 1440 ของ `/`, `/multiply`, `/mips`, `/floating-point`, `/floating-point/ieee-754`, drawer มือถือที่เปิดอยู่ และ `/dev/kit` แล้วเปิดดูทุกรูป
12. **Review 3 รอบ** (หัวข้อ 11) → อัปเดต progress → push → เปิด PR `wp0-hub` → `main` (สรุป + checklist + path screenshot) → **หยุดและรายงาน** (Pisit merge เอง)

e2e ใหม่ของ WP-0 (`tests/e2e/hub.spec.ts` · **ห้าม hardcode สถานะ** ให้อ่านจาก `TOPICS` เพราะ WP อื่นจะเปลี่ยนสถานะทีหลัง):
- หน้าแรกมีการ์ดครบ 4 ใบเรียงตาม `order` และป้ายสถานะตรงกับ registry · มือถือ 390×844 เห็นการ์ดแรกโดยไม่ต้องเลื่อน
- ทุกหัวข้อที่ `coming-soon`: กดการ์ดแล้วไปหน้าที่มี "กำลังพัฒนา" + รายการ `covers` + ปุ่มกลับหน้าแรกใช้ได้ + มี `<meta name="robots">` ที่มี `noindex`
- ทุกหัวข้อที่ `ready`: กดการ์ดแล้วไม่เจอข้อความ "กำลังพัฒนา"
- redirect ทั้ง 3 แบบใน 2.1 (ตรวจ URL ปลายทางและ query string)
- header/drawer: ลิงก์หัวข้อครบ, active ถูกหน้า, เมื่ออยู่ในหัวข้อ FP แล้ว drawer แสดงบท 1–5 + Lab
- sitemap ไม่มีหัวข้อที่ `coming-soon` · ไม่มี console error · axe ไม่มี serious/critical ทุกหน้าใหม่

DoD ของ WP-0: ทุกข้อข้างบนผ่าน · หน้า Floating-Point ทุกหน้าทำงานเหมือนเดิมที่ path ใหม่ (e2e เดิมผ่านทั้งหมด) · ไม่มีคำว่า "Binary Lab" เหลือใน UI, metadata, README (ยกเว้นเอกสารประวัติระยะที่ 1 และ `docs/plans/stage1-floating-point.md`) · PR เปิดแล้ว

---

## 8. WP-1: MIPS Simulator (สรุป · spec เต็ม `docs/plans/wp1-mips-sim.md`)
- IDE + simulator ของ MIPS ในเบราว์เซอร์ แนวเดียวกับ z80-workspace ของเพื่อน (editor, หลายไฟล์, assemble, รันทีละคำสั่ง, console, listing) แต่เป็น MIPS ตาม `EMIPS.pdf` และเน้นการสอน: ทุกคำสั่งที่รันมีแผง "อธิบายขั้นนี้" (fetch → decode → execute → memory → write back → PC ถัดไป พร้อมค่าจริง), รหัสเครื่องระบายสีตาม R/I/J format, ย้อนกลับทีละคำสั่งได้, ตารางคำสั่งภาษาไทย, ตัวแปลงคำสั่ง ↔ รหัสเครื่อง และโปรแกรมตัวอย่าง 12 อันที่ตรวจแล้ว
- assembler + simulator เขียนเองด้วย TypeScript (`src/lib/mips/`) ทดสอบด้วย golden ใน `docs/plans/golden/mips/`
- ตัดสินใจสำคัญ (เหตุผลใน spec): ไม่มี branch delay slot เป็นค่าเริ่มต้น (`jal` เก็บ PC+4 ตามเนื้อหาตำราบทที่ 2 และค่าเริ่มต้นของ MARS) และอธิบายว่าทำไม Green Card เขียน PC+8 · big-endian และ memory map ตาม Green Card
- เปลี่ยน `mips` เป็น `ready` เมื่อ phase 1A–1C เสร็จ

## 9. WP-2: การคูณแบบ MIPS (สรุป · spec เต็ม `docs/plans/wp2-multiply.md`)
- หน้า `/multiply` ตาม P&H 3.3: คูณฐานสองด้วยมือ → ฮาร์ดแวร์รุ่นแรก → รุ่นปรับปรุง → คูณเลขมีเครื่องหมาย → คูณให้เร็วขึ้น (ภาพรวม) → การคูณใน MIPS (`mult`, `multu`, `mfhi`, `mflo`, HI/LO และการตรวจ overflow เอง)
- simulator ฮาร์ดแวร์การคูณทีละขั้น (4 บิตเป็นค่าเริ่มต้น เลือก 8 บิตได้) ที่ขั้นตอนตรงกับ `docs/plans/golden/multiply-traces.json` + ปุ่มเปิดโปรแกรม `shift-add-multiply` และ `mult-div` ใน MIPS Simulator

## 10. WP-3: การหารแบบ MIPS (สรุป · spec เต็ม `docs/plans/wp3-divide.md`)
- หน้า `/divide` ตาม P&H 3.4: หารยาวฐานสอง → ฮาร์ดแวร์รุ่นแรก (restoring) → รุ่นปรับปรุง → หารเลขมีเครื่องหมาย (เครื่องหมายของเศษ) → หารให้เร็วขึ้น (ภาพรวม) → การหารใน MIPS (`div`, `divu`, LO = ผลหาร, HI = เศษ, การหารด้วยศูนย์)
- simulator ฮาร์ดแวร์การหารทีละขั้นตรงกับ `docs/plans/golden/divide-traces.json` + ปุ่มเปิด `restoring-divide`, `div-signs`, `mult-div`

---

## 11. Testing, review 3 รอบ และรายงานท้าย WP
- unit (Vitest): engine/โมเดลของทุก WP ต้องผ่าน golden ใน `docs/plans/golden/` (อ่านไฟล์ JSON ด้วย `fs` ใน test ห้าม copy ตัวเลขมาพิมพ์ใหม่) + property test (fast-check) ตามที่ spec กำหนด · coverage ของ engine/โมเดลของ WP ≥ 95%
- e2e (Playwright): projects `pixel7`, `iphone13`, `desktop` เดิม · ทุก WP มี spec file ของตัวเอง · ทุกหน้าใหม่ต้องไม่มี console error, axe ไม่มี serious/critical, ใช้คีย์บอร์ดได้, reduced motion ใช้ได้
- **Review 3 รอบก่อนบอกว่าเสร็จ** (Pisit ต้องการแบบนี้ ไม่ใช่ประกาศว่าเสร็จทันที) จดผลในไฟล์ progress หัวข้อ "Review":
  1. **ใช้งานจริง**: แบบนักศึกษาบนมือถือ WebKit 390px (เรียนตั้งแต่ต้นจนจบหัวข้อ ลองค่าแปลก ๆ ค่าว่าง ค่าเกินช่วง) และแบบคนนำเสนอบน desktop 1920 (โหมดนำเสนอ ใช้คีย์บอร์ดล้วน) → จดจุดที่งงหรือต้องกดเยอะ แล้วแก้
  2. **ความสวยและ interface**: screenshot ทุกหน้าทุกขนาดจอ เทียบธีม Liquid Glass (stage1 9) · สีตรงตาม 6.1 · ตัวอักษรไทยไม่โดนตัด · animation ลื่นและไม่รก (ลอง reduced motion ด้วย) · ภาษาไทยเป็นธรรมชาติ
  3. **ความถูกต้อง**: test ทั้งหมด + อ่านเนื้อหาทั้งหัวข้อเทียบ spec · grep หาเลขที่พิมพ์เอง (`0x`, สตริงบิตยาว ๆ) ในไฟล์ของ WP ใน `src/app`, `src/content`, `src/components` · build ผ่าน
- รายงานท้าย WP (พิมพ์ในแชทและใส่ในไฟล์ progress): สิ่งที่เสร็จ/ยังไม่ทำ, ผล test, path screenshot, คำถามที่รอคำตอบเรียงตามความสำคัญ, ลิงก์ PR

---

## 12. Deploy และงานของ Pisit หลัง merge
1. หลัง merge PR ของ WP-0: ดูว่า Vercel deploy production แล้ว → เปิด https://comkrub.mypisit.com บนมือถือ: หน้าแรก, กดทุกการ์ด, เมนู, `/lab` (ต้องพาไป `/floating-point/lab`) และลิงก์ Lab เก่าที่เคยแชร์ใน LINE
2. เชิญเพื่อนเป็น collaborator (3.7) แล้วส่ง `docs/TEAM.md` + prompt A.3 / A.4 ให้เพื่อน
3. เริ่ม WP-1 ด้วย prompt A.2 (session ใหม่ branch ใหม่)
4. ทุก PR ต่อจากนี้ review ตาม 3.5 และ merge แบบ merge commit (3.6)
5. ถ้าตัดสินใจเปิด repo เป็น public (WP0-Q1): ตั้ง `site.githubUrl` กลับเป็น URL ของ repo · ระวังว่า `EMIPS.pdf` (เอกสารมีลิขสิทธิ์) อยู่ใน repo และในประวัติ git

---

## 13. คำถามตั้งต้นของระยะที่ 2 (WP-0 ใส่ใน `docs/progress/wp0-hub.md` แล้วทำงานต่อด้วยค่าที่สมมติ)
| # | ระดับ | คำถาม | ค่าที่ใช้ไปก่อน |
|---|---|---|---|
| WP0-Q1 | ด่วน | repo เป็น private คนทั่วไปกดลิงก์ "โค้ดบน GitHub" ใน footer จะเจอ 404 จะเปิด repo เป็น public หรือซ่อนลิงก์ | ซ่อนลิงก์ (`githubUrl: null`) |
| WP0-Q2 | ไม่ด่วน | ใครทำ WP-1 / WP-2 / WP-3 (ใช้ในไฟล์ progress ไม่แสดงบนเว็บ) | WP-1 Pisit · WP-2 และ WP-3 เพื่อน (รอชื่อ) |
| WP0-Q3 | ไม่ด่วน | วันนำเสนอคือวันไหน (ใช้เรียงความสำคัญของงาน) | ยังไม่มีกำหนด ทำตามลำดับในแผน |
| WP0-Q4 | ยืนยันค่าเริ่มต้น | โลโก้ใหม่เป็นชิปที่มีแถบ 3 สีเดิมอยู่ข้างใน | ใช้ตามนั้น |
| WP0-Q5 | ยืนยันค่าเริ่มต้น | path ใหม่ `/multiply`, `/divide`, `/floating-point`, `/mips` | ใช้ตามนั้น |
| WP0-Q6 | ยืนยันค่าเริ่มต้น | ข้อความหน้าแรก (tagline, คำอธิบาย, blurb ของแต่ละหัวข้อ) ตามภาคผนวก C | ใช้ตามนั้น |

---

## ภาคผนวก A: prompt สำหรับวางใน Claude Code

### A.1 WP-0 (Pisit ทำตอนนี้)
```
เริ่มระยะที่ 2 ของโปรเจกต์: เปลี่ยนชื่อเว็บเป็น comkrub และทำ WP-0 (หน้าแรกเลือกหัวข้อ + ย้าย Floating-Point ไปไว้ที่ /floating-point + โครงร่วมสำหรับทีม)

1. อ่าน PLAN.md ให้ครบทุกหัวข้อก่อนเริ่ม (โดยเฉพาะ 0-7, 11, 13 และภาคผนวก B, C) แผนระยะที่ 1 ย้ายไปอยู่ที่ docs/plans/stage1-floating-point.md แล้ว ข้อความใน CLAUDE.md เดิมที่อ้าง "PLAN.md x.y" หมายถึงไฟล์นั้น และขั้นแรกของ WP-0 คือเปลี่ยน CLAUDE.md เป็นภาคผนวก B
2. ตอนนี้ PLAN.md ที่แก้แล้วและโฟลเดอร์ docs/plans/ ยังไม่ได้ commit ให้สร้าง branch wp0-hub แล้ว commit ไฟล์แผนเหล่านี้เป็นงานแรก จากนั้นทำตาม PLAN.md หัวข้อ 7 ทีละขั้นจนครบ DoD ห้ามข้ามขั้น commit ทุกขั้นย่อย และอัปเดต docs/progress/wp0-hub.md ทุกครั้งที่จบงานย่อย
3. ทำแบบ autonomous: ห้ามใช้ AskUserQuestion และห้ามหยุดถาม ถ้าต้องตัดสินใจให้จดคำถามในไฟล์ progress พร้อมค่าที่สมมติ แล้วทำต่อ
4. ก่อนใช้ library ใดให้ query Context7 ก่อนทุกครั้ง
5. ห้าม push หรือ merge เข้า main และห้าม deploy เอง: ทำ review 3 รอบตามหัวข้อ 11 ให้เสร็จ แล้ว push branch เปิด PR เข้า main ด้วย gh และรายงานสรุปในแชท (สิ่งที่ทำ ผล test path screenshot คำถามที่รอคำตอบ ลิงก์ PR)

เริ่มได้เลย
```

### A.2 WP-1 MIPS Simulator (เริ่มหลัง WP-0 merge แล้ว)
```
ทำ WP-1: MIPS Simulator ของเว็บ comkrub

1. git switch main && git pull แล้วสร้าง branch wp1-mips-sim จาก main ล่าสุด (WP-0 ต้อง merge แล้ว ถ้ายังไม่ merge ให้หยุดและบอกฉัน)
2. อ่าน CLAUDE.md, PLAN.md หัวข้อ 0-6 และ 11 และ docs/plans/wp1-mips-sim.md ให้ครบทุกหัวข้อก่อนเริ่ม รวมถึงไฟล์ golden ใน docs/plans/golden/mips/
3. ทำตาม phase ใน spec (1A ถึง 1E) ทีละ phase จนครบ DoD แก้เฉพาะไฟล์ของ WP-1 ตาม PLAN.md 3.3 commit ทุกงานย่อย อัปเดต docs/progress/wp1-mips-sim.md ทุกครั้งที่จบงานย่อย และ push branch ทุกครั้งที่จบ phase
4. autonomous: ห้ามใช้ AskUserQuestion และห้ามหยุดถาม จดคำถามพร้อมค่าที่สมมติในไฟล์ progress แล้วทำต่อ · ใช้ Context7 ก่อนใช้ library ทุกครั้ง
5. ห้าม push เข้า main และห้าม deploy: จบแล้วทำ review 3 รอบ เปิด PR เข้า main ด้วย gh แล้วรายงานสรุปในแชท

เริ่มได้เลย
```

### A.3 WP-2 การคูณแบบ MIPS (ส่งให้เพื่อน)
```
ฉันเป็นสมาชิกกลุ่มที่รับผิดชอบหัวข้อ "การคูณแบบ MIPS" (WP-2) ของเว็บ comkrub

1. git switch main && git pull แล้วสร้าง branch wp2-multiply จาก main ล่าสุด (ถ้ามี branch นี้อยู่แล้วให้ switch ไปแล้ว git merge origin/main)
2. อ่าน CLAUDE.md, PLAN.md หัวข้อ 0-6 และ 11, docs/TEAM.md และ docs/plans/wp2-multiply.md ให้ครบทุกหัวข้อก่อนเริ่ม รวมถึง docs/plans/golden/multiply-traces.json
3. ทำตาม phase ใน spec ทีละ phase จนครบ DoD แก้เฉพาะไฟล์ที่ WP-2 แก้ได้ (PLAN.md 3.3) ห้ามเพิ่ม dependency commit ทุกงานย่อย อัปเดต docs/progress/wp2-multiply.md ทุกครั้งที่จบงานย่อย และ push branch ทุกครั้งที่จบ phase
4. autonomous: ห้ามใช้ AskUserQuestion และห้ามหยุดถาม จดคำถามพร้อมค่าที่สมมติในไฟล์ progress แล้วทำต่อ · ใช้ Context7 ก่อนใช้ library ทุกครั้ง
5. ห้าม push เข้า main และห้าม deploy: จบแล้วทำ review 3 รอบ เปิด PR เข้า main (ใช้ gh ถ้ามี ไม่งั้นบอกฉันว่าต้องกดอะไรบน GitHub) แล้วสรุปในแชท

เริ่มได้เลย
```

### A.4 WP-3 การหารแบบ MIPS (ส่งให้เพื่อน)
```
ฉันเป็นสมาชิกกลุ่มที่รับผิดชอบหัวข้อ "การหารแบบ MIPS" (WP-3) ของเว็บ comkrub

1. git switch main && git pull แล้วสร้าง branch wp3-divide จาก main ล่าสุด (ถ้ามี branch นี้อยู่แล้วให้ switch ไปแล้ว git merge origin/main)
2. อ่าน CLAUDE.md, PLAN.md หัวข้อ 0-6 และ 11, docs/TEAM.md และ docs/plans/wp3-divide.md ให้ครบทุกหัวข้อก่อนเริ่ม รวมถึง docs/plans/golden/divide-traces.json
3. ทำตาม phase ใน spec ทีละ phase จนครบ DoD แก้เฉพาะไฟล์ที่ WP-3 แก้ได้ (PLAN.md 3.3) ห้ามเพิ่ม dependency commit ทุกงานย่อย อัปเดต docs/progress/wp3-divide.md ทุกครั้งที่จบงานย่อย และ push branch ทุกครั้งที่จบ phase
4. autonomous: ห้ามใช้ AskUserQuestion และห้ามหยุดถาม จดคำถามพร้อมค่าที่สมมติในไฟล์ progress แล้วทำต่อ · ใช้ Context7 ก่อนใช้ library ทุกครั้ง
5. ห้าม push เข้า main และห้าม deploy: จบแล้วทำ review 3 รอบ เปิด PR เข้า main (ใช้ gh ถ้ามี ไม่งั้นบอกฉันว่าต้องกดอะไรบน GitHub) แล้วสรุปในแชท

เริ่มได้เลย
```

### A.5 ทำต่อ (ใช้ได้ทุก WP)
```
ทำต่อ: ดูชื่อ branch ปัจจุบันว่าเป็น WP ไหน อ่าน CLAUDE.md และ docs/progress/ ของ WP นั้น แล้วเปิดอ่านหัวข้อที่เกี่ยวข้องใน spec ของ WP ก่อนทำงานถัดไป
```

---

## ภาคผนวก B: `CLAUDE.md` ฉบับใหม่ (WP-0 ขั้นที่ 1 แทนทั้งไฟล์)

```md
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
```

---

## ภาคผนวก C: ข้อมูลหัวข้อและข้อความหน้าแรก

### C.1 `src/lib/site.ts` (เปลี่ยนเฉพาะค่าเหล่านี้)
```ts
name: 'comkrub',
tagline: 'เรียน Computer Architecture แบบเห็นทุกขั้นตอน',
description:
  'เว็บไซต์เพื่อการเรียนรู้และ Simulation วิชา Computer Architecture: การคูณและการหารแบบ MIPS, Floating-Point (IEEE 754) และ MIPS Simulator ทุกกระบวนการกดดูทีละขั้นได้เอง',
ogSubtitle: 'Computer Architecture · เรียนรู้และ Simulation',
githubUrl: null, // WP0-Q1: repo ยังเป็น private · ใส่ URL กลับเมื่อเปิดเป็น public
// course, siteUrl, references, authors, instructor: ไม่เปลี่ยน
```

### C.2 `TOPICS`
```ts
[
  {
    id: 'multiply', kind: 'lesson', order: 1, href: '/multiply',
    title: 'การคูณแบบ MIPS', short: 'คูณ',
    blurb: 'คูณเลขฐานสองแบบ shift-and-add ทีละบิตตามฮาร์ดแวร์ในตำรา และคำสั่ง mult / multu ที่เก็บผลใน HI กับ LO',
    covers: [
      'คูณเลขฐานสองด้วยมือ และทำไมผลคูณต้องยาวเป็นสองเท่า',
      'ฮาร์ดแวร์การคูณรุ่นแรกและรุ่นปรับปรุง ดูทีละขั้นทีละรอบ',
      'การคูณเลขมีเครื่องหมาย',
      'คำสั่ง mult, multu, mfhi, mflo และการตรวจ overflow เอง',
    ],
    textbook: 'Patterson & Hennessy หัวข้อ 3.3',
    icon: 'multiply', status: 'coming-soon',
  },
  {
    id: 'divide', kind: 'lesson', order: 2, href: '/divide',
    title: 'การหารแบบ MIPS', short: 'หาร',
    blurb: 'หารเลขฐานสองแบบ restoring ทีละบิตตามฮาร์ดแวร์ในตำรา และคำสั่ง div / divu ที่เก็บผลหารใน LO และเศษใน HI',
    covers: [
      'หารยาวฐานสอง: ผลหาร เศษ และตัวหาร',
      'ฮาร์ดแวร์การหารรุ่นแรกและรุ่นปรับปรุง ดูทีละขั้นทีละรอบ',
      'การหารเลขมีเครื่องหมาย และเครื่องหมายของเศษ',
      'คำสั่ง div, divu, mfhi, mflo และการหารด้วยศูนย์',
    ],
    textbook: 'Patterson & Hennessy หัวข้อ 3.4',
    icon: 'divide', status: 'coming-soon',
  },
  {
    id: 'floating-point', kind: 'lesson', order: 3, href: '/floating-point',
    title: 'Floating-Point (IEEE 754)', short: 'Floating-Point',
    blurb: 'ตั้งแต่เลขฐานสอง เศษส่วนฐานสอง และ IEEE 754 ไปจนถึงบวก ลบ คูณ หาร Floating-Point ทีละบิต พร้อม Lab',
    covers: [
      'ระบบเลขฐานและเศษส่วนฐานสอง',
      'IEEE 754 Single Precision: encode และ decode',
      'บวก ลบ คูณ หาร Floating-Point พร้อม Guard, Round, Sticky',
      'Lab คำนวณเองและแชร์ลิงก์ได้',
    ],
    textbook: 'Patterson & Hennessy หัวข้อ 3.5',
    icon: 'floating-point', status: 'ready',
  },
  {
    id: 'mips', kind: 'simulator', order: 4, href: '/mips',
    title: 'MIPS Simulator', short: 'MIPS Sim',
    blurb: 'เขียน assembly ของ MIPS แล้วรันทีละคำสั่ง ดู register, memory และรหัสเครื่องของทุกคำสั่ง พร้อมคำอธิบายทุกขั้น',
    covers: [
      'เขียนและ assemble โปรแกรม MIPS ในเบราว์เซอร์',
      'รันทีละคำสั่ง ย้อนกลับได้ เห็น register และ memory เปลี่ยน',
      'รหัสเครื่องแบบ R / I / J format ของทุกคำสั่ง',
      'โปรแกรมตัวอย่างและตารางคำสั่งตาม MIPS Reference Data',
    ],
    textbook: 'MIPS Reference Data (Green Card)',
    icon: 'mips', status: 'coming-soon',
  },
]
```

### C.3 ข้อความหน้าแรก
- pill: "Computer Architecture · เว็บไซต์เพื่อการเรียนรู้และ Simulation"
- H1: "comkrub" · tagline: `site.tagline`
- ประโยคแนะนำ: "เลือกหัวข้อที่อยากเรียน ทุกกระบวนการกดดูทีละขั้นได้เอง ย้อนกลับได้ และลองใส่ค่าของตัวเองได้ทุกหน้า"
- หัวข้อส่วนที่ 1: "เลือกหัวข้อเรียน" · คำรอง: "เรียงตามตำรา Patterson & Hennessy บทที่ 3"
- หัวข้อส่วนที่ 2: "ทดลองด้วย Simulator"
- ป้ายบนการ์ด: บทเรียน "หัวข้อที่ {order}" · Simulator "Simulator" · สถานะ "พร้อมเรียน" / "กำลังพัฒนา"
- "วิธีใช้เว็บนี้":
  1. "กดดูทีละขั้น: ปุ่มถัดไป ย้อนกลับ หรือกดเลขขั้นเพื่อกระโดด"
  2. "เล่นอัตโนมัติและโหมดนำเสนอ: ปรับความเร็วได้ ขยายเต็มจอ ใช้ลูกศรกับ Space ได้"
  3. "ใส่ค่าเอง: ทุกเครื่องมือรับค่าที่อยากลอง และคำนวณตรงกับคอมพิวเตอร์จริงทุกบิต"

### C.4 ข้อความหน้า "กำลังพัฒนา"
- ป้าย: "กำลังพัฒนา" · ข้อความ: "หัวข้อนี้ทีมกำลังพัฒนาอยู่ จะเปิดให้เรียนเร็ว ๆ นี้"
- หัวข้อรายการ: "สิ่งที่จะได้เรียน" · บรรทัดอ้างอิง: "อ้างอิง: {textbook}"
- ปุ่ม: "กลับหน้าแรก" และ "ไปเรียน {ชื่อหัวข้อเรียนแรกที่ ready}"

### C.5 Footer
- คำอธิบาย: "เว็บไซต์เพื่อการเรียนรู้และ Simulation วิชา Computer Architecture · คำนวณทุกอย่างใน browser"
- หัวข้อรายการ: "หัวข้อ" (แทน "บทเรียน") · เครดิตผู้จัดทำ อาจารย์ อ้างอิง และป้าย Analytics ใช้ของเดิม

---

## ภาคผนวก D: ไฟล์ golden ที่ตรวจแล้ว (`docs/plans/golden/`)
| ไฟล์ | เนื้อหา | ตรวจด้วย |
|---|---|---|
| `mips/encodings.json` | รหัสเครื่องของคำสั่งจริง 41 แบบ (ทุก format, branch/jump ที่ PC ต่าง ๆ) + pseudo-instruction 12 แบบพร้อมคำสั่งที่ขยายออกมา | คำนวณจากตาราง opcode/funct ใน Green Card แล้วยืนยันด้วย Capstone 5.0.7 (MIPS32 big-endian) · คำสั่งจริงตรงกับ Keystone ด้วย ยกเว้น `div`/`divu` ที่ Keystone ขยายเป็น macro |
| `mips/*.s` (12 ไฟล์) | โปรแกรมตัวอย่างพร้อม comment ภาษาไทย (id ตรงกับ `MipsExampleId`) | assembler อ้างอิง (Python) + Unicorn 2.1.4 |
| `mips/expected.json` | สถานะสุดท้ายของแต่ละโปรแกรม: register ทั้ง 32 ตัว, HI, LO, ข้อความที่พิมพ์, จำนวนคำสั่งที่ทำ, exception, ข้อมูลใน `.data` | interpreter อ้างอิงตามกติกาของ comkrub (ไม่มี delay slot) เทียบกับ Unicorn (เติม `nop` ใน delay slot และไม่เทียบ `$ra`) ตรงกันทุกโปรแกรม · ทดสอบสุ่มเพิ่ม 23,700 โปรแกรม (คำสั่ง ALU, shift, mult/div, load/store, overflow trap) ตรงกันทั้งหมด |
| `multiply-traces.json` | ขั้นตอนการคูณ 4 บิตของฮาร์ดแวร์รุ่นแรก (`v1`) และรุ่นปรับปรุง (`v2`) สำหรับ 2 × 3 และ 13 × 11 + ตัวอย่างคูณเลขมีเครื่องหมาย | โมเดลอ้างอิงตรงกับผลคูณจริงครบทุกคู่ 4 บิตและ 8 บิต และสุ่ม 20,000 คู่ 32 บิต · ตาราง 2 × 3 รุ่นแรกตรงกับตัวอย่างในตำรา |
| `divide-traces.json` | ขั้นตอนการหาร 4 บิตของรุ่นแรก (restoring) และรุ่นปรับปรุง สำหรับ 7 ÷ 2 และ 13 ÷ 3 + ตัวอย่างหารเลขมีเครื่องหมาย 5 กรณี | เหมือนข้างบน · ตาราง 7 ÷ 2 รุ่นแรกตรงกับตัวอย่างในตำรา |

- test ต้องอ่านไฟล์เหล่านี้โดยตรง (`fs.readFileSync` + `JSON.parse` ใน Vitest) ห้าม copy ค่ามาพิมพ์ใหม่ในโค้ด
- ถ้า engine ให้ผลไม่ตรง golden ให้ถือว่า engine ผิดก่อน · ถ้ามั่นใจว่า golden ผิดจริง ห้ามแก้ไฟล์ golden เอง ให้จดเป็นคำถาม "ด่วน" พร้อมหลักฐาน
