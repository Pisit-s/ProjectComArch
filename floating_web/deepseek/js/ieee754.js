/* =========================================================
   ieee754.js — Chapter 3: IEEE 754 Single Precision
   Detailed step-by-step encoding & decoding.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Low-level helpers ---------- */
  const f32Buffer = new ArrayBuffer(4);
  const f32View = new DataView(f32Buffer);

  function float32ToBits(value) {
    f32View.setFloat32(0, value, false);
    return f32View.getUint32(0, false);
  }
  function bitsToFloat32(bits) {
    f32View.setUint32(0, bits >>> 0, false);
    return f32View.getFloat32(0, false);
  }
  function splitBits(bits) {
    const sign = (bits >>> 31) & 1;
    const expField = (bits >>> 23) & 0xFF;
    const fracField = bits & 0x7FFFFF;
    return { sign, expField, fracField };
  }
  function bitsToBitString(bits) {
    return (bits >>> 0).toString(2).padStart(32, "0");
  }
  function bitsToHex(bits) {
    return "0x" + (bits >>> 0).toString(16).toUpperCase().padStart(8, "0");
  }
  function classifyFloat32(bits) {
    const { expField, fracField } = splitBits(bits);
    if (expField === 0xFF) return fracField === 0 ? "infinity" : "nan";
    if (expField === 0) return fracField === 0 ? "zero" : "subnormal";
    return "normal";
  }
  function describeNormal(bits) {
    const { sign, expField, fracField } = splitBits(bits);
    const unbiased = expField - 127;
    const fracBitsStr = fracField.toString(2).padStart(23, "0");
    return { sign, expField, fracField, unbiased, fracBitsStr };
  }

  window.BinaryLab = window.BinaryLab || {};
  Object.assign(window.BinaryLab, {
    float32ToBits, bitsToFloat32, splitBits,
    bitsToBitString, bitsToHex, classifyFloat32, describeNormal,
  });

  /* ---------- UI ---------- */
  const encForm = document.getElementById("enc-form");
  const encInput = document.getElementById("enc-input");
  const encError = document.getElementById("enc-error");
  const encOutput = document.getElementById("enc-output");

  const decForm = document.getElementById("dec-form");
  const decInput = document.getElementById("dec-input");
  const decError = document.getElementById("dec-error");
  const decOutput = document.getElementById("dec-output");

  function fmtFull(n) {
    if (n === 0) return "0";
    if (!Number.isFinite(n)) return String(n);
    return Number(n.toPrecision(17)).toString();
  }

  /**
   * Convert |x| to binary string with integer and fractional parts split.
   * Used to show the "convert to binary" step explicitly.
   * NOTE: we use the actual float32 value, so the binary we display
   * corresponds exactly to the stored bits (which is the truth).
   */
  function toBinaryParts(absValue) {
    // Extract the bit pattern of |value| as float32
    const bits = float32ToBits(absValue);
    const { expField, fracField } = splitBits(bits);
    if (expField === 0) return { integerPart: "0", fractionPart: "" };

    const unbiased = expField - 127;
    // Full significand as 24-bit integer (1 . 23 frac bits)
    const sigInt = (1 << 23) | fracField;

    // Binary of the significand (24 bits)
    const sigBin = sigInt.toString(2); // 24 chars
    // The leading "1" of the significand sits at weight 2^unbiased.
    // Integer part length = unbiased + 1 if unbiased >= 0, else 0.
    let integerPart = "0";
    let fractionPart = "";

    if (unbiased >= 0) {
      // Shift decimal point right by `unbiased` positions
      // sigBin is 24 chars: "1" + 23 frac bits
      const intLen = unbiased + 1;
      if (intLen >= sigBin.length) {
        integerPart = sigBin + "0".repeat(intLen - sigBin.length);
        fractionPart = "";
      } else {
        integerPart = sigBin.slice(0, intLen);
        fractionPart = sigBin.slice(intLen);
      }
    } else {
      // unbiased < 0: leading "1" is after the point
      integerPart = "0";
      fractionPart = "0".repeat(-unbiased - 1) + sigBin;
    }

    return { integerPart, fractionPart };
  }

  function bitStringHTML(bitStr) {
    let html = "";
    for (let i = 0; i < 32; i++) {
      let cls = "bit-frac";
      if (i === 0) cls = "bit-sign";
      else if (i < 9) cls = "bit-exp";
      html += `<span class="bit-char ${cls}">${bitStr[i]}</span>`;
    }
    return `<div class="bitstring-display" aria-label="32-bit pattern">${html}</div>`;
  }

  /* ---------- Encoder ---------- */
  if (encForm) {
    encForm.addEventListener("submit", (e) => { e.preventDefault(); runEncoder(); });
  }
  document.querySelectorAll("[data-enc-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (encInput) encInput.value = btn.dataset.encPreset;
      runEncoder();
    });
  });

  function showEncError(msg) {
    if (!encError) return;
    encError.textContent = msg;
    encError.hidden = false;
    if (encInput) encInput.setAttribute("aria-invalid", "true");
    if (encOutput) encOutput.innerHTML = "";
  }
  function clearEncError() {
    if (!encError) return;
    encError.hidden = true;
    encError.textContent = "";
    if (encInput) encInput.removeAttribute("aria-invalid");
  }

  function runEncoder() {
    clearEncError();
    if (!encInput || !encOutput) return;
    const raw = encInput.value.trim();
    if (raw === "") { showEncError("กรุณาป้อนค่าฐานสิบ"); return; }
    const value = Number(raw);
    if (!Number.isFinite(value)) { showEncError("ค่าที่ป้อนไม่ใช่ตัวเลขที่ถูกต้อง"); return; }

    const bits = float32ToBits(value);
    const kind = classifyFloat32(bits);

    if (kind === "infinity" || kind === "nan") {
      showEncError("ค่านี้ไม่สามารถแทนได้ด้วย Float32 ปกติ (Overflow) — ยังไม่รองรับ Infinity/NaN");
      return;
    }
    if (kind === "subnormal") {
      showEncError("ค่านี้เล็กมากจนเป็น Subnormal ซึ่งยังไม่รองรับในเวอร์ชันนี้");
      return;
    }

    const info = describeNormal(bits);
    const stored = bitsToFloat32(bits);
    const bitStr = bitsToBitString(bits);
    const hex = bitsToHex(bits);
    const diff = stored - value;

    encOutput.innerHTML = buildEncoderHTML({
      inputValue: value, stored, bitStr, hex, info, kind, diff,
    });
    attachCopyButtons(encOutput, bitStr, hex);
  }

  function buildEncoderHTML({ inputValue, stored, bitStr, hex, info, kind, diff }) {
    const absStored = Math.abs(stored);
    const { integerPart, fractionPart } = toBinaryParts(absStored);
    const binaryStr = fractionPart ? `${integerPart}.${fractionPart}` : integerPart;

    const expFieldBin = info.expField.toString(2).padStart(8, "0");
    const fracBin = info.fracBitsStr;

    const roundingNote = diff === 0
      ? `<p class="status-ok">✓ ค่าที่จัดเก็บเท่ากับค่าที่ป้อน (แม่นยำ)</p>`
      : `<p class="status-warn">⚠ ค่าที่จัดเก็บต่างจากค่าที่ป้อน เนื่องจาก Rounding / ข้อจำกัด 32 บิต</p>
         <dl class="kv-list">
           <dt>ค่าที่ป้อน</dt><dd>${fmtFull(inputValue)}</dd>
           <dt>ค่าที่จัดเก็บ</dt><dd>${fmtFull(stored)}</dd>
           <dt>ผลต่าง (stored − input)</dt><dd>${fmtFull(diff)}</dd>
         </dl>`;

    const zeroNote = kind === "zero" ? `<p class="note">ค่านี้เป็น Zero</p>` : "";

    return `
      <div class="output-block">
        <h3>ผลการ Encode</h3>
        ${zeroNote}
        ${bitStringHTML(bitStr)}
        <dl class="kv-list">
          <dt>Hexadecimal</dt><dd>${hex}</dd>
          <dt>ค่าที่ป้อน</dt><dd>${fmtFull(inputValue)}</dd>
          <dt>ค่าที่จัดเก็บ (Float32)</dt><dd>${fmtFull(stored)}</dd>
        </dl>
        <div class="field-actions" style="margin-top:.75rem">
          <button type="button" class="btn btn-ghost" data-copy="bits">Copy Bit String</button>
          <button type="button" class="btn btn-ghost" data-copy="hex">Copy Hex</button>
        </div>
        ${roundingNote}
      </div>

      <div class="output-block">
        <h3>การแยกส่วน (Fields)</h3>
        <dl class="kv-list">
          <dt><span class="pill pill-sign">Sign</span></dt>
          <dd>${info.sign} → ${info.sign === 0 ? "บวก" : "ลบ"}</dd>
          <dt><span class="pill pill-exp">Exponent field (8 บิต)</span></dt>
          <dd>${expFieldBin}₂ = ${info.expField}</dd>
          <dt>Unbiased exponent (e)</dt>
          <dd>${info.expField} − 127 = ${info.unbiased}</dd>
          <dt><span class="pill pill-frac">Fraction field (23 บิต)</span></dt>
          <dd class="small-mono">${fracBin}</dd>
          <dt>Significand</dt>
          <dd class="small-mono">1.${fracBin}</dd>
        </dl>
      </div>

      <div class="output-block">
        <h3>ขั้นตอนการแปลงอย่างละเอียด</h3>
        <ol class="steps-list">
          <li>
            <strong>ตรวจเครื่องหมาย</strong>
            <p class="help">ค่าที่ป้อน ${inputValue < 0 ? "ติดลบ" : "ไม่ติดลบ"} → Sign = <strong>${info.sign}</strong> (${info.sign === 0 ? "บวก" : "ลบ"})</p>
          </li>
          <li>
            <strong>หาค่า Absolute Value</strong>
            <p class="help">|${fmtFull(inputValue)}| = ${fmtFull(absStored)}</p>
          </li>
          <li>
            <strong>แปลงเป็นเลขฐานสอง</strong>
            <p class="help">${fmtFull(absStored)}₁₀ ≈ ${binaryStr}₂</p>
            <p class="help"><em>หมายเหตุ:</em> เลขฐานสองที่แสดงเป็นค่าที่จัดเก็บจริงใน Float32 (หลังปัดเศษ 32 บิต) — ไม่ใช่การแปลงทศนิยมแบบไม่จำกัด</p>
          </li>
          <li>
            <strong>Normalize ให้อยู่ในรูป 1.xxxxx × 2^e</strong>
            <p class="help">${binaryStr}₂ → 1.${fracBin.slice(0, 12)}… × 2^${info.unbiased}</p>
          </li>
          <li>
            <strong>คำนวณ Biased Exponent</strong>
            <p class="help">e = ${info.unbiased} → e + 127 = ${info.unbiased} + 127 = <strong>${info.expField}</strong> = ${expFieldBin}₂</p>
          </li>
          <li>
            <strong>สร้าง Fraction field 23 บิต (Rounding ถ้าจำเป็น)</strong>
            <p class="help">Fraction = <code class="small-mono">${fracBin}</code></p>
          </li>
          <li>
            <strong>รวมทุกส่วนเป็น 32 บิต</strong>
            <p class="help"><code>${info.sign}</code> + <code>${expFieldBin}</code> + <code>${fracBin}</code> = <code>${hex}</code></p>
          </li>
        </ol>
      </div>
    `;
  }

  function attachCopyButtons(root, bitStr, hex) {
    root.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.dataset.copy === "bits" ? bitStr : hex;
        window.BinaryLab.copyToClipboard(text, btn);
      });
    });
  }

  /* ---------- Decoder ---------- */
  if (decForm) {
    decForm.addEventListener("submit", (e) => { e.preventDefault(); runDecoder(); });
  }
  function showDecError(msg) {
    if (!decError) return;
    decError.textContent = msg;
    decError.hidden = false;
    if (decInput) decInput.setAttribute("aria-invalid", "true");
    if (decOutput) decOutput.innerHTML = "";
  }
  function clearDecError() {
    if (!decError) return;
    decError.hidden = true;
    decError.textContent = "";
    if (decInput) decInput.removeAttribute("aria-invalid");
  }

  function runDecoder() {
    clearDecError();
    if (!decInput || !decOutput) return;
    const raw = decInput.value.replace(/\s+/g, "");
    if (raw === "") { showDecError("กรุณาป้อน Bit String 32 บิต"); return; }
    if (!/^[01]+$/.test(raw)) { showDecError("ต้องมีเฉพาะอักขระ 0 และ 1"); return; }
    if (raw.length !== 32) {
      showDecError(`ต้องมี 32 บิต (พบ ${raw.length} บิต)`);
      return;
    }
    const bits = parseInt(raw, 2) >>> 0;
    const kind = classifyFloat32(bits);

    if (kind === "infinity" || kind === "nan") {
      showDecError("Bit pattern นี้แทน Infinity/NaN ซึ่งยังไม่รองรับ");
      return;
    }
    if (kind === "subnormal") {
      showDecError("Bit pattern นี้แทน Subnormal ซึ่งยังไม่รองรับ");
      return;
    }

    const info = describeNormal(bits);
    const value = bitsToFloat32(bits);
    const hex = bitsToHex(bits);

    decOutput.innerHTML = buildDecoderHTML({ raw, bits, hex, info, kind, value });
    attachDecodeCopy(decOutput, hex);
  }

  function buildDecoderHTML({ raw, bits, hex, info, kind, value }) {
    const signTxt = info.sign === 0 ? "0 → บวก (+)" : "1 → ลบ (−)";
    const expBin = info.expField.toString(2).padStart(8, "0");
    const fracBin = info.fracBitsStr;

    // Compute |value| = 1.fracBin × 2^unbiased for display
    const significandAsDecimal =
      1 + info.fracField / Math.pow(2, 23);

    const zeroNote = kind === "zero"
      ? `<p class="note">ค่านี้เป็น Zero (${info.sign === 0 ? "+0" : "−0"})</p>`
      : "";

    return `
      <div class="output-block">
        <h3>ผลการ Decode</h3>
        ${zeroNote}
        ${bitStringHTML(raw)}
        <dl class="kv-list">
          <dt>Hexadecimal</dt><dd>${hex}</dd>
          <dt>ค่าที่ได้ (Decimal)</dt><dd>${fmtFull(value)}</dd>
        </dl>
        <div class="field-actions" style="margin-top:.75rem">
          <button type="button" class="btn btn-ghost" data-copy="hex">Copy Hex</button>
        </div>
      </div>

      <div class="output-block">
        <h3>การแยกส่วน</h3>
        <dl class="kv-list">
          <dt><span class="pill pill-sign">Sign (1 บิต)</span></dt><dd>${signTxt}</dd>
          <dt><span class="pill pill-exp">Exponent field (8 บิต)</span></dt>
          <dd>${expBin}₂ = ${info.expField}</dd>
          <dt><span class="pill pill-frac">Fraction field (23 บิต)</span></dt>
          <dd class="small-mono">${fracBin}</dd>
        </dl>
      </div>

      <div class="output-block">
        <h3>ขั้นตอนการคำนวณอย่างละเอียด</h3>
        <ol class="steps-list">
          <li>
            <strong>แยก Sign bit</strong>
            <p class="help">บิตแรก = ${info.sign} → ค่าเป็น${info.sign === 0 ? "บวก" : "ลบ"}</p>
          </li>
          <li>
            <strong>แยก Exponent field (8 บิต)</strong>
            <p class="help">${expBin}₂ = ${info.expField}</p>
          </li>
          <li>
            <strong>หัก Bias (127) เพื่อหา unbiased exponent</strong>
            <p class="help">e = ${info.expField} − 127 = <strong>${info.unbiased}</strong></p>
          </li>
          <li>
            <strong>แยก Fraction field (23 บิต) และเติม Hidden Leading 1</strong>
            <p class="help">Significand = 1.<code class="small-mono">${fracBin}</code></p>
          </li>
          <li>
            <strong>คำนวณค่า Significand ในรูปทศนิยม</strong>
            <p class="help">1.<code class="small-mono">${fracBin}</code>₂ = 1 + ${info.fracField}/2²³ = <strong>${fmtFull(significandAsDecimal)}</strong>₁₀</p>
          </li>
          <li>
            <strong>คำนวณค่าสุดท้าย</strong>
            <p class="help">(−1)^${info.sign} × ${fmtFull(significandAsDecimal)} × 2^${info.unbiased} = <strong>${fmtFull(value)}</strong></p>
          </li>
        </ol>
      </div>
    `;
  }

  function attachDecodeCopy(root, hex) {
    root.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.BinaryLab.copyToClipboard(hex, btn);
      });
    });
  }
})();