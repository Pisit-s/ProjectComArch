/* =========================================================
   fraction.js — Chapter 2
   A) 16-bit binary fraction explorer (with per-bit steps)
   B) Decimal → binary fraction converter (with full table)
   ========================================================= */
(function () {
  "use strict";

  /* ============ A) 16-bit fraction explorer ============ */
  const BIT_COUNT = 16;
  const WEIGHTS = Array.from({ length: BIT_COUNT }, (_, i) => Math.pow(2, -(i + 1)));
  let bits = new Array(BIT_COUNT).fill(0);

  const bitRow = document.getElementById("frac-bit-row");
  const fracStringEl = document.getElementById("frac-string");
  const fracDecimalEl = document.getElementById("frac-decimal");
  const contribBody = document.getElementById("frac-contribution-body");
  const fracFormulaEl = document.getElementById("frac-formula");
  const fracStepsEl = document.getElementById("frac-steps");

  function buildCells() {
    if (!bitRow) return;
    bitRow.innerHTML = "";
    for (let i = 0; i < BIT_COUNT; i++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "bit-cell";
      cell.setAttribute("aria-pressed", "false");
      cell.setAttribute("aria-label", `บิต b${i + 1} น้ำหนัก 2^-${i + 1}`);
      cell.innerHTML =
        `<span class="bit-label">b${i + 1}</span>` +
        `<span class="bit-value">0</span>` +
        `<span class="bit-weight">2^-${i + 1}</span>`;
      cell.addEventListener("click", () => {
        bits[i] = bits[i] ? 0 : 1;
        renderFrac();
      });
      bitRow.appendChild(cell);
    }
  }

  function computeValue() {
    return bits.reduce((sum, b, i) => sum + b * WEIGHTS[i], 0);
  }

  function fmt(n) {
    if (n === 0) return "0";
    return Number(n.toPrecision(17)).toString();
  }

  function renderFrac() {
    if (!bitRow) return;
    const cells = bitRow.querySelectorAll(".bit-cell");
    cells.forEach((cell, i) => {
      cell.setAttribute("aria-pressed", bits[i] ? "true" : "false");
      cell.querySelector(".bit-value").textContent = String(bits[i]);
    });
    if (fracStringEl) fracStringEl.textContent = "0." + bits.join("");
    const value = computeValue();
    if (fracDecimalEl) fracDecimalEl.textContent = fmt(value);

    // Formula
    if (fracFormulaEl) {
      const parts = [];
      for (let i = 0; i < BIT_COUNT; i++) {
        if (bits[i] === 1) parts.push(`2^-${i + 1}`);
      }
      fracFormulaEl.innerHTML = parts.length
        ? `ค่า = ${parts.join(" + ")} = ${fmt(value)}`
        : `ค่า = 0 (ยังไม่มีบิตใดเปิดอยู่)`;
    }

    if (contribBody) {
      contribBody.innerHTML = "";
      for (let i = 0; i < BIT_COUNT; i++) {
        const b = bits[i];
        const contrib = b * WEIGHTS[i];
        const tr = document.createElement("tr");
        if (b === 1) tr.classList.add("is-active");
        tr.innerHTML =
          `<td class="mono">b${i + 1}</td>` +
          `<td class="mono">${b}</td>` +
          `<td class="mono">2^-${i + 1}</td>` +
          `<td class="mono">${b} × 2^-${i + 1} = ${fmt(contrib)}</td>`;
        contribBody.appendChild(tr);
      }
    }

    renderFracSteps(value);
  }

  function renderFracSteps(total) {
    if (!fracStepsEl) return;
    const onBits = [];
    for (let i = 0; i < BIT_COUNT; i++) {
      if (bits[i] === 1) onBits.push({ idx: i + 1, weight: WEIGHTS[i] });
    }

    let html = "";
    html += `<li>อ่านบิตจาก b1 ถึง b16: <code>${bits.join("")}</code>
      <p class="help" style="margin-top:.3rem">น้ำหนัก: b1=0.5, b2=0.25, b3=0.125, … , b16=1/65536</p></li>`;

    if (onBits.length === 0) {
      html += `<li>ไม่มีบิตใดเป็น 1 → ผลรวม = <strong>0</strong></li>`;
    } else {
      html += `<li>บิตที่เป็น 1 มี ${onBits.length} บิต แต่ละบิตเพิ่มค่าดังนี้:
        <dl class="kv-list">`;
      let running = 0;
      for (const { idx, weight } of onBits) {
        running += weight;
        html += `<dt>b${idx}</dt><dd>1 × 2^-${idx} (${fmt(weight)}) → สะสม = ${fmt(running)}</dd>`;
      }
      html += `</dl></li>`;
    }

    html += `<li>ผลรวมฐานสิบ = <strong>${fmt(total)}</strong></li>`;
    fracStepsEl.innerHTML = html;
  }

  function wirePresets() {
    const resetBtn = document.getElementById("frac-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        bits = new Array(BIT_COUNT).fill(0);
        renderFrac();
      });
    }
    document.querySelectorAll("[data-frac-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = parseFloat(btn.dataset.fracPreset);
        const { bits: newBits } = decimalToBinaryFraction(v, BIT_COUNT);
        bits = new Array(BIT_COUNT).fill(0);
        for (let i = 0; i < newBits.length && i < BIT_COUNT; i++) bits[i] = newBits[i];
        renderFrac();
      });
    });
  }

  /* ============ Conversion math ============ */
  function decimalToBinaryFraction(x, bitCount) {
    const outBits = [];
    let remainder = x;
    let exact = false;
    const steps = [];
    for (let i = 0; i < bitCount; i++) {
      if (remainder === 0) { exact = true; break; }
      const before = remainder;
      const doubled = remainder * 2;
      const bit = Math.floor(doubled);
      remainder = doubled - bit;
      outBits.push(bit);
      steps.push({ before, doubled, bit, remainder });
      if (remainder === 0) { exact = true; break; }
    }
    return { bits: outBits, steps, exact: exact || remainder === 0 };
  }

  buildCells();
  wirePresets();
  renderFrac();

  /* ============ B) Decimal fraction converter UI ============ */
  const form = document.getElementById("frac-form");
  const input = document.getElementById("frac-input");
  const bitsSelect = document.getElementById("frac-bits");
  const errorEl = document.getElementById("frac-error");
  const outputEl = document.getElementById("frac-output");

  if (form) {
    form.addEventListener("submit", (e) => { e.preventDefault(); runConverter(); });
    form.addEventListener("reset", () => {
      if (errorEl) { errorEl.hidden = true; errorEl.textContent = ""; }
      if (input) input.removeAttribute("aria-invalid");
      if (outputEl) outputEl.innerHTML = "";
    });
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
    if (input) input.setAttribute("aria-invalid", "true");
  }
  function clearError() {
    if (!errorEl) return;
    errorEl.hidden = true;
    errorEl.textContent = "";
    if (input) input.removeAttribute("aria-invalid");
  }

  function runConverter() {
    clearError();
    if (!outputEl || !input || !bitsSelect) return;
    const raw = input.value.trim();
    if (raw === "") {
      showError("กรุณาป้อนเศษส่วนฐานสิบ (เช่น 0.375)");
      outputEl.innerHTML = "";
      return;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      showError("ค่าที่ป้อนไม่ใช่ตัวเลขที่ถูกต้อง");
      outputEl.innerHTML = "";
      return;
    }
    if (value < 0 || value >= 1) {
      showError("กรุณาป้อนค่าในช่วง 0 ≤ x < 1");
      outputEl.innerHTML = "";
      return;
    }

    const bitCount = parseInt(bitsSelect.value, 10) || 16;
    const { bits: outBits, steps, exact } = decimalToBinaryFraction(value, bitCount);

    let approx = 0;
    for (let i = 0; i < outBits.length; i++) {
      approx += outBits[i] * Math.pow(2, -(i + 1));
    }
    const absError = Math.abs(value - approx);

    outputEl.innerHTML = buildConverterHTML({
      input: value, bitCount, outBits, steps, exact, approx, absError,
    });
  }

  function buildConverterHTML({ input, bitCount, outBits, steps, exact, approx, absError }) {
    const bin = "0." + outBits.join("");

    // Detailed step table with running remainder
    const stepRows = steps.map((s, i) => {
      const isInt = s.bit === 1;
      return `
        <tr${isInt ? ' class="is-active"' : ''}>
          <td class="mono">${i + 1}</td>
          <td class="mono">${fmt(s.before)}</td>
          <td class="mono">${fmt(s.doubled)}</td>
          <td class="mono">${s.bit}</td>
          <td class="mono">${fmt(s.remainder)}</td>
        </tr>`;
    }).join("");

    // Per-bit contribution after conversion
    const contribRows = outBits.map((b, i) => {
      const w = Math.pow(2, -(i + 1));
      return `
        <tr${b === 1 ? ' class="is-active"' : ''}>
          <td class="mono">b${i + 1}</td>
          <td class="mono">${b}</td>
          <td class="mono">2^-${i + 1}</td>
          <td class="mono">${b} × 2^-${i + 1} = ${b === 1 ? fmt(w) : "0"}</td>
        </tr>`;
    }).join("");

    const status = exact
      ? `<p class="status-ok">✓ แปลงได้แม่นยำ: เศษส่วนเหลือ 0 ภายใน ${outBits.length} บิต</p>`
      : `<p class="status-warn">⚠ รูปแบบฐานสองไม่สิ้นสุดภายใน ${bitCount} บิต — ผลลัพธ์เป็นการประมาณ</p>`;

    return `
      <div class="output-block">
        <h3>ผลลัพธ์</h3>
        <dl class="kv-list">
          <dt>ค่าเดิม (ฐานสิบ)</dt><dd>${fmt(input)}</dd>
          <dt>Binary Fraction</dt><dd>${bin}₂</dd>
          <dt>ค่าประมาณ (ฐานสิบ)</dt><dd>${fmt(approx)}</dd>
          <dt>Absolute Error</dt><dd>${absError === 0 ? "0 (แม่นยำ)" : fmt(absError)}</dd>
        </dl>
        ${status}
      </div>

      <div class="output-block">
        <h3>ขั้นตอนที่ 1: การคูณด้วย 2 ซ้ำ ๆ</h3>
        <p class="help">
          หลักการ: นำเศษส่วนคูณ 2 → ส่วนจำนวนเต็มของผลคูณคือ "บิต" ที่ได้
          เศษส่วนที่เหลือคือ "เศษ" สำหรับขั้นต่อไป ทำซ้ำจนเศษ = 0 หรือครบ ${bitCount} บิต
        </p>
        <div class="scroll-x">
          <table class="contribution-table">
            <thead>
              <tr>
                <th scope="col">Step</th>
                <th scope="col">เศษก่อนคูณ</th>
                <th scope="col">× 2</th>
                <th scope="col">บิต</th>
                <th scope="col">เศษคงเหลือ</th>
              </tr>
            </thead>
            <tbody>${stepRows}</tbody>
          </table>
        </div>
      </div>

      <div class="output-block">
        <h3>ขั้นตอนที่ 2: ตรวจสอบย้อนกลับ</h3>
        <p class="help">
          เมื่อได้บิตแล้ว เราแปลงกลับเป็นฐานสิบด้วยผลรวมของ <code>bit × 2^-i</code>
          เพื่อยืนยันว่าตรงกับค่าต้นทาง (หรือใกล้เคียง)
        </p>
        <div class="scroll-x">
          <table class="contribution-table">
            <thead>
              <tr>
                <th scope="col">บิต</th>
                <th scope="col">ค่า</th>
                <th scope="col">น้ำหนัก</th>
                <th scope="col">Contribution</th>
              </tr>
            </thead>
            <tbody>${contribRows}</tbody>
          </table>
        </div>
        <p class="help" style="margin-top:.6rem">ผลรวม = <strong>${fmt(approx)}</strong></p>
      </div>
    `;
  }
})();