/* Binary Lab: calculation logic uses standard browser APIs, separate from rendering. */
"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const finiteInput = (raw) => {
  if (typeof raw !== "string" || raw.trim() === "") throw new Error("กรุณาป้อนตัวเลขก่อนคำนวณ");
  const value = Number(raw.trim());
  if (!Number.isFinite(value)) throw new Error("กรุณาป้อนตัวเลขที่มีค่าจำกัด เช่น 5.75 หรือ -0.1");
  return value;
};
const formatNumber = (n, digits = 17) => {
  if (Object.is(n, -0)) return "-0";
  if (!Number.isFinite(n)) return String(n);
  return Number(n.toPrecision(digits)).toString();
};
const f32Bits = (value) => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value, false);
  const bits = view.getUint32(0, false).toString(2).padStart(32, "0");
  return { bits, hex: "0x" + view.getUint32(0, false).toString(16).toUpperCase().padStart(8, "0"), value: view.getFloat32(0, false) };
};
const decodeBits = (bits) => {
  const clean = bits.replace(/\s+/g, "");
  if (!/^[01]{32}$/.test(clean)) throw new Error("ต้องป้อนข้อมูลที่มี 32 บิตพอดี โดยใช้เฉพาะ 0 และ 1 (เว้นวรรคแบ่งกลุ่มได้)");
  const view = new DataView(new ArrayBuffer(4));
  view.setUint32(0, parseInt(clean, 2), false);
  const value = view.getFloat32(0, false);
  return { bits: clean, hex: "0x" + parseInt(clean, 2).toString(16).toUpperCase().padStart(8, "0"), value,
    sign: clean[0], exponent: clean.slice(1, 9), fraction: clean.slice(9), expInt: parseInt(clean.slice(1, 9), 2), fracInt: parseInt(clean.slice(9), 2) };
};
const fieldsFromValue = (value) => {
  const encoded = f32Bits(value);
  const d = decodeBits(encoded.bits);
  return {...encoded, ...d};
};
function setError(el, message) { el.textContent = message || ""; el.hidden = !message; }
function bitFieldHTML(bits, start, label, weightFn, activeClass = "") {
  return bits.split("").map((bit, idx) => {
    const pos = start - idx, weight = weightFn(pos);
    return `<div class="bit-cell"><button type="button" class="bit-button ${bit === "1" ? "on" : ""}" data-pos="${pos}" aria-pressed="${bit === "1"}" aria-label="${label} ${pos}: ${bit}, น้ำหนัก ${weight}"><span class="bit-value">${bit}</span><span class="bit-label">${label}${pos}</span><span class="bit-weight">${weight}</span></button></div>`;
  }).join("");
}
function renderInteger(bits) {
  $("#integerBits").innerHTML = bitFieldHTML(bits, 7, "b", p => 2 ** p);
  const value = [...bits].reduce((sum, bit, idx) => sum + (bit === "1" ? 2 ** (7 - idx) : 0), 0);
  $("#integerBinary").textContent = bits;
  $("#integerDecimal").textContent = String(value);
  $("#integerContributions").innerHTML = [...bits].map((bit, idx) => {
    const p = 7 - idx, weight = 2 ** p, c = (bit === "1" ? weight : 0);
    return `<tr><td class="mono">b${p}</td><td class="${bit === "1" ? "one" : "zero"}">${bit}</td><td class="mono">${weight}</td><td class="mono">${bit} × ${weight} = <strong>${c}</strong></td></tr>`;
  }).join("");
}
function bitsForInteger(value) { return value.toString(2).padStart(8, "0"); }
function initInteger() {
  renderInteger("00000000");
  $("#integerBits").addEventListener("click", e => {
    const button = e.target.closest("button[data-pos]");
    if (!button) return;
    const pos = Number(button.dataset.pos), bits = $("#integerBinary").textContent.split("");
    bits[7 - pos] = bits[7 - pos] === "1" ? "0" : "1";
    renderInteger(bits.join(""));
  });
  $$("[data-int]").forEach(b => b.addEventListener("click", () => renderInteger(bitsForInteger(Number(b.dataset.int)))));
  $("#resetInteger").addEventListener("click", () => renderInteger("00000000"));
}
function renderFractionBits(bits) {
  $("#fractionBits").innerHTML = bits.split("").map((bit, idx) => {
    const p = idx + 1, weight = 2 ** (-p);
    return `<div class="bit-cell"><button type="button" class="bit-button ${bit === "1" ? "on" : ""}" data-frac-pos="${idx}" aria-pressed="${bit === "1"}" aria-label="บิตเศษส่วน b${p}: ${bit}, น้ำหนัก 2 ยกกำลังลบ ${p}"><span class="bit-value">${bit}</span><span class="bit-label">b${p}</span><span class="bit-weight">${weight.toFixed( Math.min(8,p) )}</span></button></div>`;
  }).join("");
  const value = [...bits].reduce((sum, bit, idx) => sum + (bit === "1" ? 2 ** (-(idx + 1)) : 0), 0);
  $("#fractionBinary").textContent = `0.${bits}₂`;
  $("#fractionDecimal").textContent = formatNumber(value, 17);
  $("#fractionContributions").innerHTML = [...bits].map((bit, idx) => {
    const p = idx + 1, weight = 2 ** (-p), c = bit === "1" ? weight : 0;
    return `<tr><td class="mono">b${p}</td><td class="${bit === "1" ? "one" : "zero"}">${bit}</td><td class="mono">2⁻${p} = ${formatNumber(weight, 9)}</td><td class="mono">${bit} × ${formatNumber(weight, 9)} = <strong>${formatNumber(c, 9)}</strong></td></tr>`;
  }).join("");
}
function fractionBitsFromDecimal(value, count = 16) {
  let remainder = value, bits = "";
  for (let i = 0; i < count; i++) {
    remainder *= 2;
    if (remainder >= 1) { bits += "1"; remainder -= 1; } else bits += "0";
  }
  return bits;
}
function initFractionExplorer() {
  renderFractionBits("0".repeat(16));
  $("#fractionBits").addEventListener("click", e => {
    const button = e.target.closest("button[data-frac-pos]");
    if (!button) return;
    const bits = $("#fractionBinary").textContent.slice(2, -1).split("");
    const pos = Number(button.dataset.fracPos); bits[pos] = bits[pos] === "1" ? "0" : "1";
    renderFractionBits(bits.join(""));
  });
  $$("[data-frac]").forEach(b => b.addEventListener("click", () => {
    const value = Number(b.dataset.frac);
    renderFractionBits(fractionBitsFromDecimal(value, 16));
  }));
  $("#resetFraction").addEventListener("click", () => renderFractionBits("0".repeat(16)));
}
function convertFraction(value, count) {
  let remainder = value, bits = "", rows = [];
  for (let i = 1; i <= count; i++) {
    const before = remainder, product = before * 2, bit = Math.floor(product);
    remainder = product - bit; bits += String(bit);
    rows.push({i, before, product, bit, remainder});
    if (remainder === 0) break;
  }
  const approximate = [...bits].reduce((s, bit, i) => s + (bit === "1" ? 2 ** (-(i + 1)) : 0), 0);
  return {bits, rows, approximate, error: Math.abs(value - approximate), exact: remainder === 0};
}
function initFractionConverter() {
  $("#fractionForm").addEventListener("submit", e => {
    e.preventDefault(); setError($("#fractionConvertError"), ""); $("#fractionConvertResult").innerHTML = "";
    try {
      const value = finiteInput($("#fractionInput").value), count = Number($("#fractionLength").value);
      if (value < 0 || value >= 1) throw new Error("ค่าที่รองรับต้องอยู่ในช่วง 0 ≤ x < 1");
      const result = convertFraction(value, count);
      const rows = result.rows.map(r => `<tr><td>${r.i}</td><td class="mono">${formatNumber(r.before, 17)}</td><td class="mono">${formatNumber(r.product, 17)}</td><td class="mono ${r.bit ? "one" : "zero"}">${r.bit}</td><td class="mono">${formatNumber(r.remainder, 17)}</td></tr>`).join("");
      $("#fractionConvertResult").innerHTML = `<div class="conversion-result"><div class="result-heading"><h3>ผลการแปลง</h3><span class="tool-badge">${result.exact ? "EXACT REPRESENTATION" : "APPROXIMATION"}</span></div><div class="result-grid"><div class="result-tile"><span>BINARY FRACTION</span><strong class="mono small-mono">0.${result.bits}${result.exact ? "" : "…"}₂</strong><small>${result.bits.length} บิตที่สร้างได้</small></div><div class="result-tile result-primary"><span>APPROXIMATED DECIMAL</span><strong>${formatNumber(result.approximate, 17)}</strong><small>Absolute Error = ${formatNumber(result.error, 17)}</small></div></div><p class="muted">${result.exact ? "เศษส่วนเหลือเป็น 0 จึงแทนค่าได้พอดีภายในจำนวนบิตที่ใช้" : `เศษส่วนยังเหลือหลัง ${count} บิต จึงแสดงค่าประมาณ ไม่ใช่ค่าที่แทนได้อย่างแม่นยำทั้งหมด`}</p><div class="contribution-wrap"><h3>ตารางการคูณด้วย 2</h3><div class="table-scroll"><table><thead><tr><th>ขั้น</th><th>เศษส่วนก่อนคูณ</th><th>ผลคูณ × 2</th><th>บิตที่ได้</th><th>เศษส่วนที่เหลือ</th></tr></thead><tbody>${rows}</tbody></table></div></div></div>`;
    } catch (err) { setError($("#fractionConvertError"), err.message); }
  });
  $("#fractionForm").requestSubmit();
}
function groupedBits(bits) { return `${bits.slice(0,1)} ${bits.slice(1,9)} ${bits.slice(9)}`; }
function coloredBits(bits) { return `<div class="binary-display"><span class="sign-field-text">${bits.slice(0,1)}</span><span class="exp-field-text">${bits.slice(1,9)}</span><span class="frac-field-text">${bits.slice(9)}</span></div><div class="field-legend"><span><i class="legend-dot legend-sign"></i>Sign · 1 บิต</span><span><i class="legend-dot legend-exp"></i>Exponent · 8 บิต</span><span><i class="legend-dot legend-frac"></i>Fraction · 23 บิต</span></div>`;}
function bitGroupsHTML(d) {
 return `<div class="bit-groups"><div class="bit-group sign-group"><span>SIGN · 1 BIT</span><code>${d.sign}</code></div><div class="bit-group exp-group"><span>EXPONENT · 8 BITS</span><code>${d.exponent}</code></div><div class="bit-group frac-group"><span>FRACTION · 23 BITS</span><code>${d.fraction}</code></div></div>`;
}
function explainEncoding(value, d) {
  const abs = Math.abs(value);
  const signText = value < 0 || Object.is(value, -0) ? "1 (ค่าติดลบ)" : "0 (ค่าไม่ติดลบ)";
  let steps = [
    `ตรวจเครื่องหมาย: ${signText}; ค่า absolute คือ ${formatNumber(abs)}.`,
  ];
  if (value === 0) {
    steps.push("ค่าเป็นศูนย์ จึงเข้ารหัสด้วย Exponent และ Fraction เป็นศูนย์ (เครื่องหมายอาจเป็นบวกหรือลบ).");
  } else if (d.expInt === 0) {
    steps.push(`Exponent field = 00000000₂; ค่านี้อยู่ในกลุ่ม Subnormal หรือศูนย์ จึงไม่มี Hidden Leading 1.`);
    steps.push(`Fraction field = ${d.fraction}; การถอดค่าต้องใช้ significand = 0.F และ exponent = 1 − 127 = −126.`);
  } else if (d.expInt === 255) {
    steps.push("Exponent field เป็น 255 ซึ่งสงวนไว้สำหรับ Infinity หรือ NaN; ค่านี้อยู่นอกช่วง finite Float32 ที่เครื่องมือนี้เน้นอธิบาย.");
  } else {
    const exponent = d.expInt - 127;
    const significand = 1 + d.fracInt / (2 ** 23);
    steps.push(`ค่าที่เก็บจริงเป็น Float32 คือ ${formatNumber(d.value)}; เมื่อ Normalize จะอยู่ในรูป 1.F × 2ᵉ โดย e = ${exponent}.`);
    steps.push(`Biased Exponent = e + 127 = ${exponent} + 127 = ${d.expInt} = ${d.exponent}₂.`);
    steps.push(`Fraction field เก็บ 23 บิต ${d.fraction}; significand = 1 + ${d.fracInt}/2²³ = ${formatNumber(significand, 12)}.`);
    steps.push("เมื่อรวม Sign, Exponent และ Fraction จะได้บิต 32 บิตตามที่แสดงด้านบน โดย DataView เป็นผู้สร้าง bit pattern จริงและจัดการ rounding.");
  }
  if (d.value !== value) steps.push(`มีความต่างจากค่าที่ป้อน: ${formatNumber(d.value - value)} เนื่องจากการปัดเศษ/ข้อจำกัด Float32.`);
  return steps;
}
function initIEEE() {
  const encodeMode = $("#encodeMode"), decodeMode = $("#decodeMode");
  function setMode(mode) {
    const encode = mode === "encode";
    $("#encoderPane").hidden = !encode; $("#decoderPane").hidden = encode;
    encodeMode.classList.toggle("active", encode); decodeMode.classList.toggle("active", !encode);
    encodeMode.setAttribute("aria-selected", String(encode)); decodeMode.setAttribute("aria-selected", String(!encode));
  }
  encodeMode.addEventListener("click", () => setMode("encode")); decodeMode.addEventListener("click", () => setMode("decode"));
  $("#encoderForm").addEventListener("submit", e => {
    e.preventDefault(); setError($("#encodeError"), ""); $("#encodeResult").innerHTML = "";
    try {
      const value = finiteInput($("#encodeInput").value);
      if (Math.abs(value) > 3.4028234663852886e38) throw new Error("ค่านี้เกินช่วง finite Float32 และจะกลายเป็น Infinity");
      const d = fieldsFromValue(value);
      const steps = explainEncoding(value, d);
      $("#encodeResult").innerHTML = `<div class="encode-output"><div class="result-heading"><h3>ผลการ Encode</h3><button class="copy-btn" type="button" data-copy="${d.bits}">คัดลอก Bit String</button></div>${coloredBits(d.bits)}${bitGroupsHTML(d)}<div class="metric-grid"><div class="metric"><span>HEX REPRESENTATION</span><strong>${d.hex}</strong><button class="copy-btn" type="button" data-copy="${d.hex}">คัดลอก Hex</button></div><div class="metric"><span>UNBIASED EXPONENT</span><strong>${d.expInt === 0 ? "ไม่ใช่ Normalized" : d.expInt === 255 ? "Special" : d.expInt - 127}</strong></div><div class="metric"><span>STORED FLOAT32 VALUE</span><strong>${formatNumber(d.value)}</strong></div></div><div class="callout"><b>ค่าที่จัดเก็บจริง</b><p>ค่าที่ป้อน: <code>${formatNumber(value)}</code><br>ค่า Float32: <code>${formatNumber(d.value)}</code><br>${d.value === value ? "ค่าที่แสดงตรงกันใน JavaScript" : `ความต่าง (stored − input): ${formatNumber(d.value - value)}`}</p></div><h3>ขั้นตอนการเข้ารหัส</h3><ol class="steps-list">${steps.map(s=>`<li>${s}</li>`).join("")}</ol></div>`;
    } catch (err) { setError($("#encodeError"), err.message); }
  });
  $("#decoderForm").addEventListener("submit", e => {
    e.preventDefault(); setError($("#decodeError"), ""); $("#decodeResult").innerHTML = "";
    try {
      const d = decodeBits($("#decodeInput").value);
      let interpretation = "";
      if (d.expInt === 255) interpretation = d.fracInt === 0 ? (d.sign === "1" ? "−Infinity" : "+Infinity") : "NaN";
      else if (d.expInt === 0) interpretation = d.fracInt === 0 ? (d.sign === "1" ? "−0 (Signed Zero)" : "+0") : "Subnormal";
      else interpretation = "Normalized";
      let formula = "";
      if (d.expInt === 255) formula = d.fracInt === 0 ? "Exponent = 255 และ Fraction = 0 จึงเป็น Infinity" : "Exponent = 255 และ Fraction ≠ 0 จึงเป็น NaN";
      else if (d.expInt === 0 && d.fracInt === 0) formula = `Sign = ${d.sign}; ค่าที่ถอดได้เป็น ${d.sign === "1" ? "−0" : "+0"}.`;
      else if (d.expInt === 0) formula = `Subnormal: (−1)^${d.sign} × (0.F) × 2^(1−127) = ${formatNumber(d.value)}.`;
      else formula = `(−1)^${d.sign} × (1 + ${d.fracInt}/2²³) × 2^(${d.expInt}−127) = ${formatNumber(d.value)}.`;
      $("#decodeResult").innerHTML = `<div class="decode-output"><div class="result-heading"><h3>ผลการ Decode</h3><button class="copy-btn" type="button" data-copy="${d.hex}">คัดลอก Hex</button></div>${coloredBits(d.bits)}${bitGroupsHTML(d)}<div class="result-grid"><div class="result-tile result-primary"><span>DECODED VALUE</span><strong>${formatNumber(d.value)}</strong><small>${interpretation}</small></div><div class="result-tile"><span>HEX REPRESENTATION</span><strong>${d.hex}</strong><small>ข้อมูล 32 บิตเดียวกันในฐานสิบหก</small></div></div><div class="step-card"><h4>ตีความแต่ละ Field</h4><p><strong>Sign:</strong> ${d.sign} → ${d.sign === "1" ? "เครื่องหมายลบ" : "เครื่องหมายบวก"}</p><p><strong>Exponent:</strong> ${d.exponent}₂ = ${d.expInt}₁₀${d.expInt > 0 && d.expInt < 255 ? `; e = ${d.expInt} − 127 = ${d.expInt-127}` : ""}</p><p><strong>Fraction:</strong> ${d.fraction}; ค่า integer ของ Fraction field = ${d.fracInt}</p><p><strong>สมการ:</strong> ${formula}</p></div></div>`;
    } catch (err) { setError($("#decodeError"), err.message); }
  });
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    try { await navigator.clipboard.writeText(b.dataset.copy); const old=b.textContent; b.textContent="คัดลอกแล้ว ✓"; setTimeout(()=>b.textContent=old,1300); }
    catch { b.textContent = b.dataset.copy; }
  });
  $("#encoderForm").requestSubmit();
  $("#decoderForm").requestSubmit();
}
function decomposeFloat(d) {
  if (!Number.isFinite(d.value) || d.expInt === 255) throw new Error("ยังไม่รองรับการจำลองขั้นตอนสำหรับ Infinity หรือ NaN");
  if (d.expInt === 0) throw new Error("การจำลองขั้นตอนแบบ Significand นี้ยังไม่รองรับ Subnormal หรือ Signed Zero เป็น Operand กรุณาใช้ค่าปกติที่ไม่เป็นศูนย์");
  const sign = d.sign === "1" ? -1 : 1;
  const sig = 1 + d.fracInt / (2 ** 23);
  return { sign, signBit:d.sign, exponent:d.expInt-127, expField:d.exponent, fraction:d.fraction, significand:sig, signedSignificand:sign*sig, value:d.value, bits:d.bits, hex:d.hex };
}
function initArithmetic() {
  $("#arithmeticForm").addEventListener("submit", e => {
    e.preventDefault(); setError($("#arithmeticError"), ""); $("#arithmeticResult").innerHTML = "";
    try {
      const inputA = finiteInput($("#operandA").value), inputB = finiteInput($("#operandB").value);
      const aEncoded = f32Bits(inputA), bEncoded = f32Bits(inputB);
      if (!Number.isFinite(aEncoded.value) || !Number.isFinite(bEncoded.value)) throw new Error("Operand เกินช่วง Float32 ที่รองรับ (finite number)");
      const a = decomposeFloat(fieldsFromValue(inputA)), b = decomposeFloat(fieldsFromValue(inputB));
      const op = $("#operation").value;
      const mathematical = op === "+" ? a.value + b.value : a.value - b.value;
      const result = Math.fround(mathematical), rd = fieldsFromValue(result);
      if (!Number.isFinite(result)) throw new Error("ผลลัพธ์ Overflow หรือไม่ใช่ finite Float32 จึงไม่แสดงการจำลองแบบปกติ");
      const alignedExp = Math.max(a.exponent,b.exponent), shiftA = alignedExp-a.exponent, shiftB = alignedExp-b.exponent;
      const alignedA = a.signedSignificand / (2 ** shiftA), alignedB = (op === "+" ? b.signedSignificand : -b.signedSignificand) / (2 ** shiftB);
      const raw = alignedA + alignedB;
      const rawAbs = Math.abs(raw);
      let normalized = rawAbs === 0 ? "0" : `${formatNumber(rawAbs / (2 ** Math.floor(Math.log2(rawAbs))), 12)} × 2^${Math.floor(Math.log2(rawAbs))}`;
      const operandCard = (name, d, input, val) => `<div class="operand-card"><h3>${name} · ค่าที่ป้อน ${formatNumber(input)}</h3><code>${d.bits}</code><p>Float32 ที่จัดเก็บ: <strong>${formatNumber(val)}</strong></p><p>Hex: ${d.hex}</p></div>`;
      $("#arithmeticResult").innerHTML = `<div class="arithmetic-output"><div class="result-heading"><h3>ค่าตัวถูกดำเนินการหลังแปลงเป็น Float32</h3><span class="tool-badge">OPERANDS ROUNDED FIRST</span></div><div class="operand-grid">${operandCard("Operand A",fieldsFromValue(inputA),inputA,a.value)}${operandCard("Operand B",fieldsFromValue(inputB),inputB,b.value)}</div><div class="step-card"><h4>ขั้นที่ 1 · แยก Sign, Exponent และ Significand</h4><p>A: sign = ${a.signBit}, exponent = ${a.exponent} (field ${a.expField}), significand = ${formatNumber(a.significand,12)}; ค่ามีเครื่องหมาย = ${formatNumber(a.signedSignificand,12)} × 2^${a.exponent}.</p><p>B: sign = ${b.signBit}, exponent = ${b.exponent} (field ${b.expField}), significand = ${formatNumber(b.significand,12)}; ค่ามีเครื่องหมาย = ${formatNumber(b.signedSignificand,12)} × 2^${b.exponent}.</p></div><div class="step-card"><h4>ขั้นที่ 2 · เปรียบเทียบ Exponent</h4><p>Exponent A = ${a.exponent}; Exponent B = ${b.exponent}; เลือก exponent ร่วมเป็น ${alignedExp}.</p></div><div class="step-card"><h4>ขั้นที่ 3 · ปรับ Exponent ให้เท่ากัน</h4><p>A เลื่อน significand ไปทางขวา ${shiftA} บิต: ${formatNumber(a.signedSignificand,12)} ÷ 2^${shiftA} = ${formatNumber(alignedA,12)}.</p><p>B เลื่อน significand ไปทางขวา ${shiftB} บิต: ${formatNumber(b.signedSignificand,12)} ÷ 2^${shiftB} = ${formatNumber(b.signedSignificand/(2**shiftB),12)}.</p></div><div class="step-card"><h4>ขั้นที่ 4 · ${op === "+" ? "บวก" : "ลบ"} Significand และจัดการเครื่องหมาย</h4><p>หลังใช้เครื่องหมายของ operation (${op}), significand ที่จัดแนวแล้ว: ${formatNumber(alignedA,14)} ${op} ${formatNumber(b.signedSignificand/(2**shiftB),14)} = ${formatNumber(raw,14)} (เทียบในหน่วย 2^${alignedExp}).</p><p>เครื่องหมายของค่าก่อน Normalize: ${raw < 0 ? "ลบ" : raw > 0 ? "บวก" : "ศูนย์"}.</p></div><div class="step-card"><h4>ขั้นที่ 5 · Normalize ผลลัพธ์ (แบบจำลอง)</h4><p>รูปแบบ normalized โดยประมาณของ significand ที่รวมกัน: <code>${normalized}</code> ก่อนปัดเป็น Float32; exponent จริงอาจถูกปรับตามขนาดและ rounding.</p></div><div class="step-card"><h4>ขั้นที่ 6 · Rounding</h4><p>ปัดผลรวมให้เป็น Float32 ด้วย Math.fround(): <code>${formatNumber(result)}</code>. Operand A/B ที่ใช้คำนวณเป็น Float32 อยู่ก่อนแล้ว.</p></div><div class="step-card"><h4>ขั้นที่ 7 · Encode ผลลัพธ์สุดท้าย</h4>${coloredBits(rd.bits)}<p>Hex: <code>${rd.hex}</code>; Decimal Float32: <code>${formatNumber(result)}</code>.</p></div><div class="result-grid"><div class="result-tile result-primary"><span>FLOAT32 RESULT</span><strong>${formatNumber(result)}</strong><small>ผลลัพธ์หลังปัดเป็น Float32</small></div><div class="result-tile"><span>HEX / BINARY32</span><strong>${rd.hex}</strong><small class="mono">${rd.bits}</small></div></div><div class="callout"><b>เปรียบเทียบผลลัพธ์</b><p>ผลคำนวณจากค่า Float32 ของ Operand: ${formatNumber(mathematical)} ก่อนปัดผลลัพธ์<br>ผลหลังปัดเป็น Float32: ${formatNumber(result)}<br>ผลจากค่าอินพุตดั้งเดิมใน JavaScript Number: ${formatNumber(op === "+" ? inputA+inputB : inputA-inputB)}<br>ความต่างเกิดจากการปัด Operand และผลลัพธ์ตามความละเอียด Float32</p></div><p class="muted">หมายเหตุ: ขั้นตอน Significand ด้านบนเป็นแบบจำลองเชิงการสอนโดยใช้ค่าที่ถอดจาก Float32 จริง ส่วนผลลัพธ์สุดท้ายสร้างจากการดำเนินการกับ Operand ที่ปัดเป็น Float32 ก่อนแล้ว และตรวจสอบด้วย Math.fround().</p></div>`;
    } catch (err) { setError($("#arithmeticError"), err.message); }
  });
  $("#resetArithmetic").addEventListener("click", () => { $("#operandA").value="0.1"; $("#operandB").value="0.2"; $("#operation").value="+"; $("#arithmeticResult").innerHTML=""; setError($("#arithmeticError"),""); });
  $("#arithmeticForm").requestSubmit();
}
function route() {
  const key = location.hash.replace("#", "") || "home";
  const page = ["home","chapter1","chapter2","chapter3","chapter4","lab"].includes(key) ? key : "home";
  $$(".page").forEach(p => p.classList.toggle("active", p.id === `page-${page}`));
  $$(".nav-link").forEach(a => a.classList.toggle("active", a.dataset.page === page));
  $("#currentCrumb").textContent = $(`#page-${page}`).dataset.title;
  $("#sidebar").classList.remove("open"); $("#menuToggle").setAttribute("aria-expanded","false");
  window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
}
function initNavigation() {
  window.addEventListener("hashchange", route);
  $("#menuToggle").addEventListener("click", () => {
    const opened = $("#sidebar").classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(opened));
  });
  document.addEventListener("keydown", e => { if(e.key==="Escape") $("#sidebar").classList.remove("open"); });
  route();
}
document.addEventListener("DOMContentLoaded", () => {
  initNavigation(); initInteger(); initFractionExplorer(); initFractionConverter(); initIEEE(); initArithmetic();
});
