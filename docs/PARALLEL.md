# ทำงานพร้อมกัน 3 เครื่อง (เริ่ม 2 พ.ย. 2569)

> แผนที่ใช้มีฉบับเดียว: `PLAN.md` บน `addsub-redesign` (หน้าเดียว เรื่องบวก/ลบ Floating-Point)
> แผนระยะที่ 2 บน `main` (hub, `/floating-point`, คูณ/หาร, MIPS) **ยกเลิกแล้ว** ห้ามใช้ · ห้าม merge หรือหยิบงานจาก `wp0-hub`

## ใครทำอะไร

| branch | คน | งาน (PLAN.md) | e2e ของตัวเอง |
|---|---|---|---|
| `addsub-redesign` | Pisit (คนรวมงาน) | Phase 4 บทที่ 6 · Phase 7 ลองเอง + สรุป · Phase 8 รวมงาน review PR | chapter5/6, playground, player, lesson, redirects, a11y |
| `addsub-ch34` | เพื่อนคนที่ 1 | Phase 5: บทที่ 3 IEEE 754 (3.4) และบทที่ 4 แปลงเลข (3.5) | `tests/e2e/chapter3.spec.ts`, `chapter4.spec.ts` |
| `addsub-ch12` | เพื่อนคนที่ 2 | Phase 6: Hero (3.1) บทที่ 1 (3.2) บทที่ 2 (3.3) | `tests/e2e/chapter1.spec.ts`, `chapter2.spec.ts`, `hero.spec.ts` |

## ไฟล์ที่แต่ละ branch แก้ได้

**addsub-ch34**
- `src/components/scenes/chapter3.tsx`, `chapter4.tsx` (มี placeholder ลงทะเบียนไว้แล้ว แทนที่ได้เลย)
- component ใหม่ใน `src/components/stage/` ที่บทนี้ใช้คนเดียว: `exponent-window.tsx`, `times-two.tsx` และไฟล์ใหม่อื่นที่ขึ้นต้นด้วยชื่อบท
- `src/lib/lesson/encode-frames.ts`, `src/lib/lesson/window.ts` · test ใหม่ใน `tests/unit/lesson/ch34.test.ts`
- `src/content/lesson/captions/ch3.ts`, `ch4.ts`, `src/content/lesson/ui-ch34.ts` · แถวของบทที่ 3–4 ใน `quiz.ts`, `examples.ts`, `vocab.ts`, `copy.ts` (`TAKEAWAY`, `OTHER`, `FACTS`) และ `captions/rules.ts` (เพิ่มได้ ห้ามแก้ของเดิม)
- `docs/progress/addsub-ch34.md`

**addsub-ch12**
- `src/components/scenes/chapter1.tsx`, `chapter2.tsx`, `hero-scene.tsx`
- component ใหม่ใน `src/components/stage/`: `number-wheel.tsx`, `code-card.tsx` และไฟล์ใหม่อื่นที่ขึ้นต้นด้วยชื่อบท
- `src/lib/int/**`, `src/lib/sci/**`, `src/lib/lesson/int-frames.ts`, `src/lib/lesson/sci-frames.ts` (ห้ามแก้ `buildDec4Frames` ซึ่งบทที่ 5 ใช้) · test ใหม่ใน `tests/unit/lesson/ch12.test.ts`
- `src/content/lesson/captions/ch1.ts`, `ch2.ts`, `src/content/lesson/ui-ch12.ts` · แถวของ hero และบทที่ 1–2 ใน `quiz.ts`, `examples.ts`, `vocab.ts`, `copy.ts` (`HERO`, `TAKEAWAY`, `OTHER`, `BRIDGE.binary`)
- `docs/progress/addsub-ch12.md`

**ไฟล์ร่วม (ห้ามแก้ ถ้าจำเป็นจริงให้แก้แบบเพิ่ม prop ที่ไม่ทำของเดิมพัง แล้วจดในหัวข้อ "แก้ไฟล์ร่วม" ของ progress ตัวเอง)**
`src/lib/fp/**`, `src/lib/lesson/{fp-frames,bit-window,round-line,rounding-frames,circuit-map,keys,fun-fact}.ts`, `src/components/player/**`, `src/components/stage/{bit-track,bit-line,step-bar,exponent-tag,carry-arc,mini-alu,register32,field-brackets,grs-lens,sticky-bucket,round-line}.tsx`, `src/components/bits/**`, `src/components/hw/**`, `src/components/lesson/**`, `src/components/layout/**`, `src/components/scenes/{registry,fp-op-scene,chapter5,dec4-scene,circuit-scene,playground-scene}.tsx|ts`, `src/content/lesson/{sections,budget,circuit,config}.ts`, `src/app/**`, `globals.css`, `next.config.ts`, `package.json`, `PLAN.md`, `CLAUDE.md`, `docs/PROGRESS.md`, `docs/QUESTIONS.md`, `tests/unit/content/**`, `tests/e2e/helpers.ts` และ e2e ของคนอื่น
- caption key ใหม่ต้องเพิ่มใน `src/lib/lesson/keys.ts` (ไฟล์ร่วม): เพิ่มได้เฉพาะ key ของบทตัวเอง ต่อท้ายกลุ่มของบทนั้น

## ของร่วมที่เรียกใช้ได้ (ห้ามแก้)
- `displayValue(fmt, bits)` ใน `src/lib/lesson/fp-frames.ts`: ค่าที่แสดงบนหน้า (∞ / −∞ / NaN แทน "Infinity") ใช้แทน `shortestDecimal` ทุกที่ที่ผู้ใช้เห็น
- `BitTrack` มี class `bit-track` ขยายเองในโหมดนำเสนอ · scene ใหม่ที่อยากให้ใหญ่ในโหมดนำเสนอให้ใช้ CSS variable แบบเดียวกัน

- Pisit แก้ `src/lib/lesson/sci-frames.ts` เฉพาะส่วน Dec4 (`decimalCarries`, `Dec4Frame.carries`) และ `fp-frames.ts` (`hexA`/`hexB`, `carries`) · `scripts/shot.mts` รับ `--el <selector>` และ `--steps <n>` แล้ว (เก็บรูปที่ test-results/shots/)

## กติกา git
1. เริ่ม: `git fetch origin && git switch -c <branch> origin/addsub-redesign`
2. ห้าม push เข้า `addsub-redesign` หรือ `main` · ห้าม merge เข้า branch อื่น · ห้าม push --force, rebase, reset --hard
3. commit ทุกงานย่อยที่ผ่าน `npm run lint && npm run typecheck && npm test` · push branch ตัวเองทุกครั้งที่จบ scene
4. ก่อน push: `git fetch origin && git merge origin/addsub-redesign` (รับของร่วมที่ Pisit อัปเดต)
5. จบงาน: e2e ของตัวเอง + `a11y.spec.ts` + `lesson.spec.ts` ผ่านบน pixel7, iphone13, desktop · เปิดดู screenshot 390px และ 1440px ทุก scene · งบข้อความผ่าน · แล้วเขียน "พร้อมรวม" ใน progress ของตัวเอง Pisit เป็นคน merge

## ลำดับการรวม (Pisit)
`addsub-ch34` → `addsub-ch12` → เข้า `addsub-redesign` ทีละ branch รัน test ครบหลังรวมแต่ละ branch แล้วทำ Phase 8
