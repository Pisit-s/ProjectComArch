/* core.js — ตรรกะคำนวณล้วน ๆ (ไม่แตะ DOM) ใช้ได้ทั้งในเบราว์เซอร์และ Node */
(function (root) {
  'use strict';
  const dv = new DataView(new ArrayBuffer(4));

  // ---------- Float32 <-> bits (ใช้ DataView อ่านบิตจริงของ Float32) ----------
  function toBits(x) { dv.setFloat32(0, x); return dv.getUint32(0).toString(2).padStart(32, '0'); }
  function fromBits(s) { dv.setUint32(0, parseInt(s, 2)); return dv.getFloat32(0); }
  function toHex(bits) { return '0x' + parseInt(bits, 2).toString(16).toUpperCase().padStart(8, '0'); }

  // แสดงค่า 17 หลักนัยสำคัญ เพื่อไม่ให้ความต่างจากการปัดเศษหายไป (Float32 ทุกค่าเก็บใน double ได้พอดี)
  function fmtExact(x) {
    if (x === 0) return Object.is(x, -0) ? '-0' : '0';
    let s = Math.abs(x).toPrecision(17);
    if (!s.includes('e') && s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return (x < 0 ? '-' : '') + s;
  }
  // ทศนิยมแน่นอนของ k / 2^n (n <= 30) — dyadic จึงจบแน่นอน
  function fmtDyadic(k, n) {
    if (n === 0) return String(k);
    let s = (k / 2 ** n).toFixed(Math.min(n, 100));
    return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
  }

  // ---------- Input ----------
  function parseNumber(str) {
    const t = String(str).trim();
    if (!t) return { error: 'กรุณาป้อนตัวเลข' };
    if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t))
      return { error: 'รูปแบบไม่ถูกต้อง ใช้เฉพาะตัวเลข เช่น 5.75, -13.25 หรือ 1e-3' };
    const v = Number(t);
    if (!isFinite(v)) return { error: 'ค่ามากเกินไป' };
    return { value: v };
  }
  const MIN_NORMAL = 2 ** -126;
  // ตรวจว่าค่าอยู่ในช่วง Normalized ของ Float32 (ไม่รองรับ Subnormal / Infinity / NaN)
  function toSupportedFloat32(v) {
    const f = Math.fround(v);
    if (!isFinite(f)) return { error: 'เกินช่วง Float32 (Overflow → Infinity) ซึ่งเครื่องมือนี้ไม่รองรับ' };
    if (f !== 0 && Math.abs(f) < MIN_NORMAL) return { error: 'ค่าเล็กเกินช่วง Normalized (Subnormal/Underflow) ซึ่งเครื่องมือนี้ไม่รองรับ' };
    if (f === 0 && v !== 0) return { error: 'ค่าเล็กเกินไปจนปัดเป็น 0 (Underflow) ซึ่งเครื่องมือนี้ไม่รองรับ' };
    return { value: f };
  }

  // ---------- Encode / Decode ----------
  function encode(inputValue) {
    const f = Math.fround(inputValue), bits = toBits(f);
    const sign = bits[0], expField = bits.slice(1, 9), frac = bits.slice(9);
    const expNum = parseInt(expField, 2);
    return {
      input: inputValue, stored: f, bits, hex: toHex(bits), sign, expField, frac,
      expNum, e: f === 0 ? null : expNum - 127,
      absBinary: Math.abs(f).toString(2), // ฐานสองที่แน่นอนของค่าที่เก็บจริง
      diff: f - inputValue, exact: f === inputValue,
    };
  }
  function decode(raw) {
    const bits = String(raw).replace(/\s+/g, '');
    if (!bits) return { error: 'กรุณาป้อนบิต 32 บิต' };
    if (/[^01]/.test(bits)) return { error: 'พบอักขระที่ไม่ใช่ 0 หรือ 1 (เว้นวรรคได้เท่านั้น)' };
    if (bits.length !== 32) return { error: `ต้องมี 32 บิต แต่ได้รับ ${bits.length} บิต` };
    const sign = bits[0], expField = bits.slice(1, 9), frac = bits.slice(9), expNum = parseInt(expField, 2);
    const r = { bits, hex: toHex(bits), sign, expField, frac, expNum };
    if (expNum === 255) return { ...r, error: 'Exponent = 255 คือ Infinity/NaN ซึ่งเครื่องมือนี้ไม่รองรับ' };
    if (expNum === 0 && /1/.test(frac)) return { ...r, error: 'Exponent = 0 และ Fraction ≠ 0 คือ Subnormal ซึ่งเครื่องมือนี้ไม่รองรับ' };
    if (expNum === 0) return { ...r, zero: true, value: sign === '1' ? -0 : 0 };
    return { ...r, e: expNum - 127, significand: 1 + parseInt(frac, 2) / 2 ** 23, value: fromBits(bits) };
  }

  // ---------- เศษส่วนฐานสิบ -> ฐานสอง ด้วยการคูณ 2 (ใช้ BigInt เพื่อให้เศษส่วนแม่นยำ ไม่ติดค่าคลาดเคลื่อนของ double) ----------
  function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
  const dec = (n, d) => parseFloat((Number(n) / Number(d)).toPrecision(12));
  function fractionToBinary(str, maxBits) {
    const t = String(str).trim();
    if (!t) return { error: 'กรุณาป้อนเศษส่วนฐานสิบ' };
    const m = /^(\d*)\.?(\d*)$/.exec(t);
    if (!m || (!m[1] && !m[2])) return { error: 'รูปแบบไม่ถูกต้อง ป้อนเช่น 0.375, 0.1 หรือ .625' };
    if (m[1].replace(/0/g, '') !== '') return { error: 'ป้อนเฉพาะค่าที่อยู่ในช่วง 0 ≤ x < 1 (ส่วนจำนวนเต็มต้องเป็น 0)' };
    if (m[2].length > 15) return { error: 'ทศนิยมยาวเกินไป (รองรับไม่เกิน 15 หลัก)' };
    let n = BigInt(m[2] || '0'), d = 10n ** BigInt(m[2].length);
    const n0 = n, d0 = d, g = gcd(n, d) || 1n; n /= g; d /= g;
    const rows = []; let bits = '';
    while (n !== 0n && bits.length < maxBits) {
      const before = n; n *= 2n; const after = n, bit = n >= d ? 1 : 0; if (bit) n -= d;
      bits += bit; rows.push({ before: dec(before, d), after: dec(after, d), bit, rest: dec(n, d) });
    }
    const len = bits.length || 1, k = BigInt('0b' + (bits || '0'));
    const errNum = n0 * 2n ** BigInt(len) - k * d0; // ค่าจริง - ค่าประมาณ (คูณ d0*2^len)
    return {
      rows, bits: bits || '0', terminated: n === 0n,
      approx: fmtDyadic(Number(k), len), absError: Number(errNum) / Number(d0 * 2n ** BigInt(len)),
    };
  }

  // ---------- บวก/ลบ Float32 แบบจำลอง Significand 24 บิต + Guard/Round/Sticky ----------
  function decomp(f) {
    const bits = toBits(f);
    return { bits, s: +bits[0], E: parseInt(bits.slice(1, 9), 2), M: BigInt('0b1' + bits.slice(9)) };
  }
  const b24 = (m) => m.toString(2).padStart(24, '0');
  function simulate(a, b, op) { // a, b ต้องเป็นค่า Float32 อยู่แล้ว
    const ref = Math.fround(op === '-' ? a - b : a + b); // ค่าอ้างอิงจาก Float32 จริงของเครื่อง
    if (a === 0 || b === 0) return { trivial: true, result: ref, bits: toBits(ref), hex: toHex(toBits(ref)), ref, match: true };
    const A = decomp(a), B = decomp(b);
    if (op === '-') B.s ^= 1; // a - b = a + (-b) : กลับเครื่องหมายของ b
    const swap = B.E > A.E || (B.E === A.E && B.M > A.M);
    const big = swap ? B : A, small = swap ? A : B, d = big.E - small.E;
    const bigX = big.M << 3n, smX = small.M << 3n; // เติม 3 บิต Guard/Round/Sticky
    let aligned = smX >> BigInt(d);
    const stickyLost = (smX & ((1n << BigInt(d)) - 1n)) !== 0n;
    if (stickyLost) aligned |= 1n; // บิตที่เลื่อนหลุดไปรวมเป็น Sticky
    const subtract = big.s !== small.s;
    const raw = subtract ? bigX - aligned : bigX + aligned;
    const out = { A, B, swap, big, small, d, bigX, aligned, stickyLost, subtract, raw, shiftWidth: 27, notes: [] };
    if (raw === 0n) return { ...out, zero: true, result: 0, bits: toBits(0), hex: toHex(toBits(0)), ref, match: ref === 0 };
    let norm = raw, exp = big.E;
    if (norm >= 1n << 27n) { norm = (norm >> 1n) | (norm & 1n); exp++; out.notes.push('ผลบวกล้น 1 บิต: เลื่อนขวา 1 บิต แล้ว Exponent + 1'); }
    else { let k = 0; while (norm < 1n << 26n) { norm <<= 1n; exp--; k++; } if (k) out.notes.push(`บิตนำหน้าหายไป: เลื่อนซ้าย ${k} บิต แล้ว Exponent − ${k}`); }
    let mant = norm >> 3n; const rem = norm & 7n;
    const up = rem > 4n || (rem === 4n && (mant & 1n) === 1n); // ปัดเข้าใกล้สุด, เสมอ -> ปัดไปทางเลขคู่
    if (up) mant++;
    if (mant === 1n << 24n) { mant >>= 1n; exp++; }
    out.norm = norm; out.rem = rem; out.up = up; out.mant = mant; out.exp = exp;
    if (exp >= 255) return { ...out, error: 'ผลลัพธ์ Overflow (Infinity) ซึ่งเครื่องมือนี้ไม่รองรับ' };
    if (exp <= 0) return { ...out, error: 'ผลลัพธ์ Underflow/Subnormal ซึ่งเครื่องมือนี้ไม่รองรับ' };
    const bits = String(big.s) + exp.toString(2).padStart(8, '0') + (mant - (1n << 23n)).toString(2).padStart(23, '0');
    const result = fromBits(bits);
    return { ...out, bits, hex: toHex(bits), result, ref, match: Object.is(result, ref) || result === ref };
  }

  const Core = { toBits, fromBits, toHex, fmtExact, fmtDyadic, parseNumber, toSupportedFloat32, encode, decode, fractionToBinary, simulate, b24 };
  if (typeof module !== 'undefined') module.exports = Core; else root.Core = Core;
})(this);
