# Requirements Addendum: Floating-Point Multiplication and Division, and Interactive Animations

> This addendum extends `floating_point_website_requirements.md` (Chapters 1–4: number systems to addition/subtraction).
> The instructor asked for multiplication and division as well, and the team wants every multi-step process to be a clickable animation.
> Everything in the original document still applies. This file only adds or updates the items listed below.
> Thai version: `requirements_เว็บไซต์_floating_point_คูณหาร_ภาษาไทย.md`

---

## A. Changes to the General Requirements

### FR-01 (updated): Chapter Navigation
The website shall provide navigation to the following five chapters:
1. Number Systems and Binary Arithmetic
2. Decimal Fractions and Binary Fractions
3. IEEE 754 Floating-Point Representation
4. Floating-Point Addition and Subtraction
5. Floating-Point Multiplication and Division (new)

### FR-07 (new): Clickable Animated Visualizations
Every multi-step process (binary-to-decimal conversion, fraction conversion, IEEE 754 encoding and decoding, addition/subtraction, multiplication/division) shall be shown as an animation that the learner controls.
- Step controls: Previous, Next, Play/Pause, Restart, and a playback speed setting.
- A step indicator shows the current step and lets the learner jump to any step by clicking it.
- Each step animates what changes, for example bits sliding during exponent alignment, the binary point moving during normalization, partial products appearing one row at a time, and long-division rows appearing one at a time. The bits involved in the current step are highlighted.
- Bits and fields in the animation can be clicked or tapped to show their meaning (field name, weight, value).
- The controls work with mouse, touch, and keyboard (Left/Right arrow keys for steps, Space for play/pause).
- When the operating system requests reduced motion, the same steps are shown without movement.

### FR-08 (new): Consistent Bit-Field Presentation
The sign, exponent, and fraction fields, the hidden bit, and the guard/round/sticky bits shall use the same colors, labels, and order in every chapter. Color shall not be the only cue: each field also has a text label.

---

## B. Chapter 5: Floating-Point Multiplication and Division

### 7.1 Learning Objectives
By the end of this chapter, learners should be able to:
- Explain why multiplication and division need no exponent alignment but do need a bias correction of the exponent.
- Determine the sign of a product or quotient with XOR.
- Compute the biased exponent of a product (`Ea + Eb − 127`) and of a quotient (`Ea − Eb + 127`) and explain why the bias is subtracted or added once.
- Multiply two significands (including the hidden bit) using shift-and-add, and divide two significands using binary long division.
- Normalize the result and round it to 24 significant bits using the guard, round, and sticky bits.
- Recognize overflow, underflow, division by zero, and invalid operations (such as `0 ÷ 0`) and state their IEEE 754 results.

### 7.2 Required Content

**Multiplication**
1. Decode both operands into sign, biased exponent, and significand (`1.fraction`).
2. Sign: `S = Sa XOR Sb`.
3. Exponent: add the biased exponents and subtract the bias once: `E = Ea + Eb − 127`. Explain that each biased exponent already contains `+127`, so adding them counts the bias twice.
4. Significand: multiply the two 24-bit significands. The exact product has up to 48 bits and lies in `[1, 4)`. Show the multiplication as shift-and-add of partial products.
5. Normalize: if the product is 2 or more, shift it right by one bit and add 1 to the exponent.
6. Round the significand to 24 bits (round to nearest, ties to even) using the guard, round, and sticky bits. If rounding carries out, normalize again.
7. Check the exponent range: overflow gives ±∞, underflow gives a subnormal value or ±0.
8. Encode and display the 32-bit result.

**Division**
1. Decode both operands.
2. Sign: `S = Sa XOR Sb`.
3. Exponent: `E = Ea − Eb + 127`. Explain that subtracting two biased exponents removes the bias, so it is added back once.
4. Significand: divide the dividend significand by the divisor significand with binary long division. The quotient lies in `(0.5, 2)`. Compute enough quotient bits to obtain the guard and round bits; the sticky bit is 1 when the final remainder is not zero.
5. Normalize: if the quotient is below 1, shift it left by one bit and subtract 1 from the exponent.
6. Round (round to nearest, ties to even) and normalize again if rounding carries out.
7. Check the exponent range (overflow or underflow).
8. Encode and display the 32-bit result.

**Comparison with addition and subtraction**

| | Addition/Subtraction (Chapter 4) | Multiplication/Division (Chapter 5) |
|---|---|---|
| Exponent alignment | Required (shift the smaller operand) | Not required |
| Exponent | Larger exponent is kept | `Ea + Eb − 127` or `Ea − Eb + 127` |
| Sign | Depends on the magnitudes and the operation | `Sa XOR Sb` |
| Significand operation | Add or subtract | Multiply or divide |
| Normalization | Right by 1 (carry) or left by many bits (cancellation) | × : right by at most 1 · ÷ : left by at most 1 |
| Rounding | Guard, round, sticky | Guard, round, sticky (division: sticky also from the remainder) |

**Special cases** (each explained with a short rule instead of the full step sequence)

| Case | Result | IEEE 754 exception |
|---|---|---|
| `x ÷ 0` (x finite and not zero) | ±∞ (sign = XOR of the signs) | Division by zero |
| `0 ÷ 0`, `∞ ÷ ∞`, `0 × ∞` | NaN | Invalid operation |
| `0 × x`, `0 ÷ x` (x finite and not zero) | ±0 (sign = XOR) | — |
| `x ÷ ∞` (x finite) | ±0 | — |
| `∞ × x` (x not zero), `∞ ÷ x` (x finite) | ±∞ | — |
| Any operand is NaN | NaN | — |
| Result larger than the largest finite value | ±∞ | Overflow (and inexact) |
| Result smaller than the smallest normalized value | Subnormal value or ±0 | Underflow (when inexact) |

As in Chapter 4, the explanation shall state that this is a learning-oriented model of the main steps, not a description of a specific hardware multiplier or divider circuit.

### 7.3 Worked Examples
All results below were verified bit for bit against IEEE 754 single precision (round to nearest, ties to even).

| # | Operation | Result (hex) | Result value | What it shows |
|---|---|---|---|---|
| M1 | `1.5 × 2.5` | `0x40700000` | 3.75 | Basic flow, no normalization needed |
| M2 | `0.5 × (−0.4375)` | `0xBE600000` | −0.21875 | Sign XOR; bias correction `126 + 125 − 127 = 124` |
| M3 | `6.5 × 2.75` | `0x418F0000` | 17.875 | Three partial products; product ≥ 2, shift right, exponent + 1 |
| M4 | `0.1 × 3` | `0x3E99999A` | stored 0.300000011920928955078125 | Rounding up (G = 1, R = 1, S = 0); exact product of the stored operands is 0.300000004470348358154296875 |
| M5 | `3e38 × 10` | `0x7F800000` | +∞ | Overflow (biased exponent 254 + 130 − 127 = 257 > 254) |
| M6 | `1e-30 × 1e-30` | `0x00000000` | +0 | Underflow to zero |
| D1 | `7.5 ÷ 2.5` | `0x40400000` | 3 | Basic flow, quotient ≥ 1 |
| D2 | `9 ÷ 12` | `0x3F400000` | 0.75 | Quotient 0.11₂ < 1, shift left, exponent − 1 |
| D3 | `1 ÷ 3` | `0x3EAAAAAB` | stored 0.3333333432674407958984375 | Non-terminating quotient; sticky from the non-zero remainder; rounding up (G = 1, R = 0, S = 1) |
| D4 | `1 ÷ 0` | `0x7F800000` | +∞ | Division by zero |
| D5 | `0 ÷ 0` | `0x7FC00000` | NaN | Invalid operation |

**Example M3 in detail: `6.5 × 2.75`**
- `6.5 = 0 10000001 10100000000000000000000` → significand `1.101`, biased exponent 129
- `2.75 = 0 10000000 01100000000000000000000` → significand `1.011`, biased exponent 128
- Sign: `0 XOR 0 = 0`
- Exponent: `129 + 128 − 127 = 130`
- Significand (multiplier `1.011` has three 1-bits):
  ```
      1.101          (1.101 × 1)
  +   0.01101        (1.101 × 0.01)
  +   0.001101       (1.101 × 0.001)
  = 10.001111
  ```
- Normalize: `10.001111 ≥ 2` → `1.0001111`, exponent `130 + 1 = 131`
- Round: all discarded bits are 0 (G = R = S = 0), no change
- Result: `0 10000011 00011110000000000000000` = `0x418F0000` = 17.875

**Example D3 in detail: `1 ÷ 3`**
- `1 = 0 01111111 00000000000000000000000` → significand `1.0`, biased exponent 127
- `3 = 0 10000000 10000000000000000000000` → significand `1.1`, biased exponent 128
- Sign: `0 XOR 0 = 0`
- Exponent: `127 − 128 + 127 = 126`
- Significand: `1.0 ÷ 1.1 = 0.101010…₂` (the remainder never becomes 0)
- Normalize: `0.1010… < 1` → `1.0101…`, exponent `126 − 1 = 125`
- Round: kept `1.01010101010101010101010`, G = 1, R = 0, S = 1 (remainder ≠ 0) → round up → `1.01010101010101010101011`
- Result: `0 01111101 01010101010101010101011` = `0x3EAAAAAB` ≈ 0.33333334

### 7.4 Interactive Requirements

**Floating-Point Multiplication/Division Simulator**
- Allow users to enter two decimal operands and select multiplication (`×`) or division (`÷`).
- Convert both operands to IEEE 754 single precision before the simulated operation and display their bit fields.
- Show each stage as a clickable, animated step (FR-07): sign (XOR), exponent (bias correction shown in decimal and in binary), significand multiplication or division, normalization, rounding (guard/round/sticky bits and the rounding decision), range check, and final encoding.
- Multiplication: show the partial products row by row and their sum.
- Division: show the long-division rows (compare, subtract or not, quotient bit) one at a time, and show that the final remainder becomes the sticky bit.
- Show a flowchart of the algorithm that highlights the current step; clicking a box jumps to that step.
- Display the final result (bits, hex, decimal) and, where useful, the exact mathematical result next to it to show the effect of rounding.
- Provide quick-example buttons for the worked examples in 7.3 and for the special values `0`, `−0`, `∞`, `−∞`, and `NaN`.
- The simulation shall follow floating-point precision rules. It shall not compute the exact decimal answer first and encode only the final result, and it shall produce the same bits as IEEE 754 single precision with round to nearest, ties to even, for every input.
- The special cases in 7.2 shall produce the correct result with a clear explanation, not an error message.

### 7.5 Scope Notes
- Single precision (32-bit) with round to nearest, ties to even only.
- The special cases in 7.2 are in scope for this chapter because they are part of multiplication and division. A detailed step-by-step treatment of subnormal operands is optional, but the result itself must always be correct.
- Hardware circuit details (array multipliers, Booth encoding, SRT division) are out of scope.

### 7.6 Chapter Summary
Summarize the sign rule (XOR), exponent addition/subtraction with bias correction, significand multiplication/division including the hidden bit, the normalization direction (right for multiplication, left for division), rounding with guard/round/sticky bits, and the special cases.

---

## C. Additional Acceptance Criteria
These are added to section 6 of the original document.

- [ ] Users can navigate to all five chapters.
- [ ] Chapter 5 simulates single-precision multiplication and division with visible intermediate steps.
- [ ] Multiplication shows the partial products; division shows the long-division rows and the remainder used as the sticky bit.
- [ ] Results of all four operations match IEEE 754 single precision (round to nearest, ties to even) bit for bit, including every worked example in 7.3.
- [ ] Division by zero, `0 ÷ 0`, `0 × ∞`, overflow, and underflow give the correct result together with an explanation.
- [ ] Every multi-step process can be stepped forward and backward, played automatically, and jumped to by clicking (FR-07), using mouse, touch, or keyboard, and respects the reduced-motion setting.
- [ ] Bit fields use the same colors and labels in every chapter (FR-08).
- [ ] Chapter 5 includes a Summary at the end.
