/* =========================================================
   binary.js — Chapter 1: 8-bit unsigned integer explorer
   Renders a detailed per-bit breakdown with expanded formula.
   ========================================================= */
(function () {
  "use strict";

  const BIT_COUNT = 8;
  const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1]; // b7..b0
  let bits = new Array(BIT_COUNT).fill(0);

  const bitRow = document.getElementById("bit-row");
  const binaryStringEl = document.getElementById("binary-string");
  const decimalResultEl = document.getElementById("decimal-result");
  const contributionBody = document.getElementById("contribution-body");
  const formulaEl = document.getElementById("binary-formula");
  const stepListEl = document.getElementById("binary-steps");

  function buildCells() {
    if (!bitRow) return;
    bitRow.innerHTML = "";
    for (let i = 0; i < BIT_COUNT; i++) {
      const weight = WEIGHTS[i];
      const bitPos = BIT_COUNT - 1 - i;
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "bit-cell";
      cell.setAttribute("aria-pressed", "false");
      cell.setAttribute("aria-label", `บิต b${bitPos} น้ำหนัก ${weight} กดเพื่อสลับ`);
      cell.dataset.index = String(i);
      cell.innerHTML =
        `<span class="bit-label">b${bitPos}</span>` +
        `<span class="bit-value">0</span>` +
        `<span class="bit-weight">${weight}</span>`;
      cell.addEventListener("click", () => toggleBit(i));
      bitRow.appendChild(cell);
    }
  }

  function toggleBit(index) {
    bits[index] = bits[index] === 0 ? 1 : 0;
    render();
  }

  function computeDecimal() {
    return bits.reduce((sum, b, i) => sum + b * WEIGHTS[i], 0);
  }

  function render() {
    if (!bitRow) return;
    const cells = bitRow.querySelectorAll(".bit-cell");
    cells.forEach((cell, i) => {
      const on = bits[i] === 1;
      cell.setAttribute("aria-pressed", on ? "true" : "false");
      cell.querySelector(".bit-value").textContent = String(bits[i]);
    });

    const binStr = bits.join("");
    if (binaryStringEl) binaryStringEl.textContent = binStr;
    const dec = computeDecimal();
    if (decimalResultEl) decimalResultEl.textContent = String(dec);

    // Formula line
    if (formulaEl) {
      const parts = [];
      for (let i = 0; i < BIT_COUNT; i++) {
        if (bits[i] === 1) parts.push(`2^${BIT_COUNT - 1 - i}`);
      }
      formulaEl.innerHTML = parts.length
        ? `ค่า = ${parts.join(" + ")} = ${dec}`
        : `ค่า = 0 (ยังไม่มีบิตใดเปิดอยู่)`;
    }

    // Contribution table
    if (contributionBody) {
      contributionBody.innerHTML = "";
      for (let i = 0; i < BIT_COUNT; i++) {
        const bitPos = BIT_COUNT - 1 - i;
        const b = bits[i];
        const contrib = b * WEIGHTS[i];
        const tr = document.createElement("tr");
        if (b === 1) tr.classList.add("is-active");
        tr.innerHTML =
          `<td class="mono">b${bitPos}</td>` +
          `<td class="mono">${b}</td>` +
          `<td class="mono">2^${bitPos} = ${WEIGHTS[i]}</td>` +
          `<td class="mono">${b} × ${WEIGHTS[i]} = ${contrib}</td>`;
        contributionBody.appendChild(tr);
      }
    }

    // Step-by-step breakdown
    renderSteps(dec);
  }

  /**
   * Render detailed per-bit calculation. Only "on" bits contribute,
   * so we show them explicitly with weight and running total.
   */
  function renderSteps(total) {
    if (!stepListEl) return;
    const onBits = [];
    for (let i = 0; i < BIT_COUNT; i++) {
      if (bits[i] === 1) {
        const bitPos = BIT_COUNT - 1 - i;
        onBits.push({ bitPos, weight: WEIGHTS[i] });
      }
    }

    let running = 0;
    let html = "";

    // Step 1: identify bit string
    html += `
      <li>
        อ่านบิตจากซ้าย (b7) ไปขวา (b0): <code>${bits.join("")}</code>
        <p class="help" style="margin-top:.3rem">น้ำหนักประจำหลัก: b7=128, b6=64, b5=32, b4=16, b3=8, b2=4, b1=2, b0=1</p>
      </li>`;

    // Step 2: list contributing bits
    if (onBits.length === 0) {
      html += `<li>ไม่มีบิตใดเป็น 1 → ผลรวม = <strong>0</strong></li>`;
    } else {
      html += `<li>บิตที่เป็น 1 มี ${onBits.length} บิต แต่ละบิตเพิ่มค่าดังนี้:
        <dl class="kv-list">`;
      for (const { bitPos, weight } of onBits) {
        running += weight;
        html += `<dt>b${bitPos}</dt><dd>1 × ${weight} = ${weight} (ผลรวมสะสม = ${running})</dd>`;
      }
      html += `</dl></li>`;
    }

    // Step 3: sum
    html += `<li>ผลรวมฐานสิบ = <strong>${total}</strong></li>`;

    stepListEl.innerHTML = html;
  }

  function setFromDecimal(value) {
    const v = Math.max(0, Math.min(255, value | 0));
    bits = WEIGHTS.map((w) => ((v & w) === w ? 1 : 0));
    render();
  }

  function wireControls() {
    const resetBtn = document.getElementById("reset-bits");
    if (resetBtn) resetBtn.addEventListener("click", () => setFromDecimal(0));

    document.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = parseInt(btn.dataset.preset, 10);
        if (!Number.isNaN(v)) setFromDecimal(v);
      });
    });
  }

  buildCells();
  wireControls();
  render();
})();