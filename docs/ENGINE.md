# Floating-point engine (`src/lib/fp/`)

engine เป็น TypeScript ล้วน ไม่แตะ DOM/React · ทุกค่าที่เป็นบิต/significand/จำนวนตรรกยะเป็น `bigint` · ไม่มีการคำนวณผลลัพธ์ด้วย `Number` (`Number` ใช้แค่เป็น exponent, ตัวนับ และเลขจำนวนเต็ม 8 บิตของบทที่ 1)

## API หลัก

| ฟังก์ชัน | ไฟล์ | ใช้ทำอะไร |
|---|---|---|
| `BINARY32`, `BINARY16`, `BINARY64`, `MINI8` | `format.ts` | format แบบ generic `{ name, expBits, fracBits }` + `bias`, `emin`, `precision`, `pack`, `fieldsOf`, `classify` |
| `toBinaryString`, `splitFields`, `groupNibbles`, `toHex`, `parseBitString`, `parseHex` | `bits.ts` | แปลง/ตรวจรูปแบบบิตและ hex (error: `empty`, `invalid-char`, `wrong-length`) |
| `R.*` (`rat`, `add`, `sub`, `mul`, `div`, `cmp`, `floor`, `floorLog2`, `floorLog10`, `scale2`) | `rational.ts` | จำนวนตรรกยะแบบ exact (ลดรูปเสมอ, den > 0) — export เป็น namespace `R` |
| `parseDecimal(text)` | `parse.ts` | ทศนิยม/scientific/`inf`/`∞`/`nan` → `{ kind, negative, magnitude }` แบบ exact · error: `empty`, `comma`, `too-long`, `exponent-range`, `invalid` |
| `decode(fmt, bits)`, `decodeWithSteps(fmt, bits)` | `decode.ts` | แยก field + ประเภท + ค่า exact · steps ของตัวถอดรหัสบทที่ 3 |
| `roundPack(fmt, sign, P, pFrac, e, extraSticky)` | `round.ts` | ปัด `P × 2^−pFrac × 2^e` แบบ round to nearest, ties to even พร้อม G/R/S, denormalize ก่อนปัด, overflow |
| `encodeDecimal(fmt, text)`, `encodeBits`, `roundRational` | `encode.ts` | ทศนิยม → บิต แบบ exact (ไม่ผ่าน `Number`) + steps 7 ขั้น · `equal` บอกว่าค่าที่เก็บเท่ากับที่ป้อนไหม |
| `addSub(fmt, a, b, op)` | `add.ts` | บวก/ลบแบบ textbook (align + G/R/S) |
| `specialAdd` | `special.ts` | กฎค่าพิเศษของบวก/ลบ (NaN, ∞ − ∞, ±0) |
| `operate(fmt, op, a, b)`, `simulate(fmt, op, aText, bText)` | `simulate.ts` | `op` มีแค่ `+` กับ `-` · simulate = encode ทั้งสองตัวก่อนแล้วคำนวณบนบิตที่เก็บจริง |
| `formatRational`, `exactDecimal`, `shortestDecimal`, `rationalToDecimal` | `format-number.ts` | แสดงตัวเลข: ค่าที่เก็บจริงครบทุกหลัก / ทศนิยมสั้นที่สุดที่ encode กลับได้บิตเดิม / ผลที่อาจไม่จบ (ตัดแล้วต่อ `…`) · scientific เมื่อ < 1e−6 หรือ ≥ 1e21 |
| `fractionToBinary(text, n)`, `fractionValue(bits)` | `fraction.ts` | บทที่ 2: คูณ 2 ซ้ำแบบ exact, ค่าประมาณแบบตัดบิต, ผลต่าง, วงซ้ำ `{ start, length }` |
| `uintTerms`, `uintValue`, `uintSteps`, `parseUint` | `integer.ts` | บทที่ 1: unsigned 8 บิต |
| `printfFixed(fmt, bits, decimals)` | `format-c.ts` | ผลของ `printf("%.6f")` แบบ exact (ปัด half-even ตาม glibc) สำหรับบทที่ 2 |

ทุก operation คืน `FpResult = { bits, steps, flags, exact }` · `exact` = ผลทางคณิตศาสตร์ของ operand ที่เก็บจริง (null เมื่อมีค่าพิเศษ)

## Step model (`steps.ts`)
- `Step = { id, flow, kind, ... }` เป็นข้อมูลล้วน UI วาดแต่ละขั้นจาก field ของขั้นนั้นได้เลยโดยไม่ต้องคำนวณเพิ่ม (ย้อนกลับได้ทันที)
- **exponent ทุกตัวใน steps เป็นค่า biased** (อาจ < 1 หรือ > 254 เมื่อ underflow/overflow) ยกเว้น `exponent.mode = 'encode-bias'` (ea = e จริง) และ `'decode-bias'` (result = e จริง)
- ตัวเลขแบบ fixed-point เก็บเป็น bigint + จำนวนบิตหลังจุด (`fracBits`, `beforeFracBits`, …)

| kind | ใช้ใน | ข้อมูลสำคัญ |
|---|---|---|
| `decode` | + − × ÷ | `operand`, `fields`, `cls`, `significand`, `exponent` (biased, ใช้จริง), `normalizeShift` (subnormal ใน ×/÷) |
| `negate` | − | B ก่อน/หลังกลับ sign |
| `special` | ทุกอัน | `rule`, `resultBits`, `flags` |
| `sign` | ×/÷ (`xor`), encode/decode (`input`) | `a`, `b`, `result` |
| `exponent` | `compare` (+−), `add-bias` (×), `sub-bias` (÷), `encode-bias`, `decode-bias` | `ea`, `eb`, `bias`, `result`, `diff`, `swapped` |
| `align` | +− | `shift`, `before`, `after`, `sticky`, `larger`, `fracBits` (= F + 3) |
| `sig-add` | +− | `a`, `b`, `op`, `result`, `sign` |
| `normalize` | + − × ÷ | `direction`, `amount`, `before/after` + fracBits, `expBefore/expAfter` |
| `range` | ×/÷ เสมอ, +−/encode เมื่อไม่ ok | `outcome`: `ok`/`overflow`/`underflow-subnormal`/`underflow-zero`, `exponent`, `denormShift` |
| `round` | ทุกอันที่ไม่ใช่ค่าพิเศษ | `kept`, `guard`, `round`, `sticky`, `decision` (`exact`/`down`/`up`/`tie-even-down`/`tie-even-up`), `result`, `carryOut`, `subnormal`, `overflowAfterRound` |
| `encode` | ขั้นสุดท้ายเสมอ | `bits`, `fields`, `hex`, `cls` |
| `int-binary`, `frac-binary`, `point` | encode | แปลงส่วนเต็ม (หาร 2) / ส่วนเศษ (คูณ 2) / เลื่อนจุด |
| `fields`, `classify`, `significand`, `value` | decode | ขั้นของตัวถอดรหัส |

ลำดับขั้น: บวก/ลบ `decode-a, decode-b, [negate], compare, align, sig-add, normalize, [range], round, encode` · ค่าพิเศษ `decode-a, decode-b, [negate], special, encode` · encode `int-binary, frac-binary, point, sign, exponent, [range], round, encode`


## Frame adapters (`src/lib/lesson/`)

UI ไม่คำนวณเอง: adapter แปลงผลของ engine/โมเดลเป็น "เฟรม" ที่วาดได้ตรง ๆ (ข้อมูลล้วน ไม่มี React) และส่ง caption key + params ไปให้ `src/content/lesson/captions`

| ไฟล์ | ให้อะไร | ใช้ที่ |
|---|---|---|
| `fp-frames.ts` | `buildFpFrames(fmt, sim)` → `FpScene` (unpack, negate, swap, compare, align-1..4/align-fast, add, normalize, range, round, round-carry, pack, special) · แถว `TrackRow` เป็น fixed point มี G R S และ `shifted` ให้บิตแต่ละตัวมี key เดิมตอนเลื่อน | ฉาก 5.2, 5.3, 6.1, บทที่ 7 |
| `bit-window.ts` | คอลัมน์ที่ BitTrack แสดง (compact / tail / full) | BitTrack |
| `round-line.ts`, `rounding-frames.ts` | เส้นจำนวนของการปัด (ค่าลง/ขึ้น, ตำแหน่ง exact) และ 5 เฟรมของฉากปัดเศษ | ฉาก 5.4 |
| `circuit-map.ts` | กล่อง/สายที่สว่างและป้ายบนสายของแต่ละเฟรม · caption ฝั่งวงจร | ฉาก 6.1, บทที่ 7 |
| `int-frames.ts`, `sci-frames.ts`, `encode-frames.ts`, `window.ts`, `fun-fact.ts` | บทที่ 1, 2, 3–4, ฉาก 5.1 และ 5.5 | ฉากของบทนั้น |
| `keys.ts` | รายการ caption key ทั้งหมด (test ตรวจว่ามีข้อความครบ) | content |

## Test
| ชุด | ไฟล์ | จำนวน |
|---|---|---|
| Golden vectors ภาคผนวก C ทุกแถว + รายละเอียดใน steps | `tests/unit/fp/golden.test.ts` | 91 test |
| Oracle `Math.fround` 6 แบบ × 4 operation | `oracle.test.ts` | 20,000 ครั้งต่อแบบต่อ operation (480,000) |
| Exhaustive MINI8 (brute force แยกจาก roundPack) | `mini8.test.ts` | 262,144 กรณี |
| encode สุ่มเทียบ `Math.fround(Number(s))` + round-trip + E13 | `encode.test.ts` | 20,000 + 5,000 + ทุกค่าของ MINI8/binary16 |
| invariant ของ steps + กฎค่าพิเศษ | `invariants.test.ts` | 5,000 ต่อ operation |
| parse/bits/rational/format/fraction/integer | `basics.test.ts` | |
| `npm run test:long` | `scripts/test-long.mts` | 1,008,000 กรณี (~7 วินาที) |

coverage `src/lib/fp/**` (30 ต.ค. 2569): statements 98.9% · branches 97.8% · functions 98.0% · lines 99.5% (threshold ใน `vitest.config.mts`)
