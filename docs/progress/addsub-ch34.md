# ความคืบหน้า addsub-ch34

> อ่าน docs/PARALLEL.md ก่อน · งานของ branch นี้อยู่ในตาราง "ใครทำอะไร"

## งาน
- [x] ฉาก 3.1 แบ่ง 32 บิต + สูตร (Must) · `LayoutScene` · input ทศนิยมหรือ `0x…` · e2e `chapter3.spec.ts`
- [x] ฉาก 4.1 แปลงทีละขั้น (Must) · `EncodeScene` + `TimesTwo` · warning ค่าที่เก็บจริงขึ้นทันทีที่ใส่ค่า · e2e `chapter4.spec.ts`
- [x] ฉาก 4.2 ถอดกลับ (Should) · `DecodeScene` · input hex 8 หลัก (มีหรือไม่มี 0x) · ∞ แสดงเป็น +∞
- [x] ฉาก 3.2 กดบิตเล่น (Should) · `BitPlayScene` + `ExponentWindow` (เส้น log 5 ช่วง เลื่อนทีละช่วงเมื่อ exponent เปลี่ยน) · ค่า 0, subnormal, ∞, NaN ไม่มีช่วง: ขึ้น caption ของโซน exponent แทน
- [x] ฉาก 3.3 ค่าพิเศษ (Should) · `SpecialScene` · ปุ่ม 3 โซน + chip ตัวอย่างจากสไลด์หน้า 16–17 · ค่าแสดงแบบ exact ตัดที่ 9 หลัก + "…" (ไม่ใช้ shortest เพราะ 0x00000001 จะกลายเป็น 1e-45 ซึ่งไม่ใช่ค่าที่เก็บจริง)
- [x] แถบเทียบ double (Could) · ใต้ฉาก 3.3 · ความยาวแท่งตามจำนวนบิต (32 : 64)

## ไฟล์ใหม่
- `src/components/stage/ch34-word.tsx` (แถว 32 บิตแบบเติมทีละส่วน ใช้ทั้งบท 3 และ 4), `ch34-chips.tsx` (chip ตัวอย่าง), `times-two.tsx`, `ch34-formula.tsx` (ชิ้นของสูตร ใช้ทั้ง 3.1 และ 4.2)
- `src/lib/lesson/ch3-special.ts` (โซน exponent, ช่วงค่า, เทียบ double, แยก input ทศนิยม/hex) · เป็นไฟล์ใหม่ใน `src/lib/lesson/` นอกรายการใน PARALLEL.md แต่ไม่ชนใคร
- `tests/unit/lesson/ch34.test.ts`

## แก้ไฟล์ร่วม
- `src/components/lesson/lesson-section.tsx`: แก้เฉพาะ 5 แถวของบท 3–4 ใน `SCENE_HEIGHT` (layout 26→36, bit-play 24→36, special 22→34, encode 28→37, decode 22→34 rem) · เหตุผล: ฉากจริงสูงกว่าที่จอง 8–17rem (วัดที่ iPhone 13 และ desktop) หน้าเลื่อนตอนโหลด (PLAN 4.9) · ค่าใหม่ใกล้ความสูงจริงบน desktop บนมือถือยังสูงกว่า 2–4rem
- เพิ่มแถวของบท 3–4 ใน `examples.ts` (`LAYOUT_EXAMPLES`, `SPECIAL_EXAMPLES`) แบบต่อท้าย ไม่แตะของเดิม

## คำถาม + ค่าที่สมมติ
- session นี้ไม่มี Context7 ให้ query → ใช้ motion/react แบบเดียวกับ `dec4-scene.tsx` และ `fp-op-scene.tsx` (motion.span, layoutId, AnimatePresence) ไม่ใช้ API ใหม่
- `EncodeScene.stored` เดิมเป็น shortest decimal (0.1 ได้ "0.1") ใช้ทำ warning ไม่ได้ → เพิ่ม `storedExact` (exactDecimal) ใช้กับ `enc.inexact` · ไม่แก้ `stored` เดิม
- `exponentWindow` lo/hi เดิมใช้ formatRational เต็ม (2^127 ยาว 39 หลัก ทำ caption `bitplay.live` เกินงบ 70) → เปลี่ยนเป็น `powLabel`: ทศนิยมถ้ายาว ≤ 8 ตัว ไม่งั้นเขียน `2^k` · 6.5 ยังได้ [4, 8) เหมือนเดิม
- ฉาก 3.1 รับ hex เฉพาะที่ขึ้นต้นด้วย `0x` (เพราะ `10000000` เป็นได้ทั้งทศนิยมและ hex) · ค่าที่ไม่ใช่ตัวเลขปกติ (0, ∞, NaN, subnormal) ขึ้นข้อความ "ฉากนี้ใช้ได้กับเลขปกติ" แล้วคงภาพเดิมไว้
- chip ของฉาก 3.1 (PLAN ไม่ได้กำหนด): 6.5, 3.75, −0.75, 0xC0A00000

## ผล test (2 พ.ย. 2569, production build)
- `npm run lint`, `npm run typecheck`, `npm test` (200 tests) ผ่าน · `npm run build` ผ่าน ทุก route static
- e2e `chapter3.spec.ts` + `chapter4.spec.ts` + `a11y.spec.ts` + `lesson.spec.ts` บน pixel7, iphone13, desktop: 55 passed, 2 skipped
- หมายเหตุ: `lesson.spec.ts` "quick check answers right and wrong" (quiz บท 5) fail บางรอบเมื่อรันกับ `next dev` บน iphone13 · ลองกับ placeholder ของ base ก็ fail เหมือนกัน (3/4 รอบ) จึงไม่ใช่จากงานนี้ · กับ production build ผ่าน
- screenshot 390px และ 1440px เปิดดูแล้วทุกฉาก

## สถานะ
- พร้อมรวม
