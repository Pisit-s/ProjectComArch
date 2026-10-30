/* =========================================================
   float32.js — Chapter 4: Float32 add/sub simulator
   Detailed step-by-step with full significand alignment.

   RESULT CORRECTNESS:
   - Operands are converted to Float32 first.
   - Result uses Math.fround(a32 ± b32) which is a single-rounding
     IEEE 754 Float32 operation on the already-Float32 operands.
   - Intermediate displays (alignment, integer sum) are derived
     from the actual bits and labelled as an educational model.
   ========================================================= */
(function () {
  "use strict";

  const {
    float32ToBits, bitsToFloat32, splitBits,
    bitsToBitString, bitsToHex, classifyFloat32,
  } = window.BinaryLab;

  const form = document.getElementById("sim-form");
  const inputA = document.getElementById("operand-a");
  const inputB = document.getElementById("operand-b");
  const opSelect = document.getElementById("operation");
  const errorEl = document.getElementById("sim-error");
  const outputEl = document.getElementById("sim-output");

  if (!form || !outputEl) return;

  form.addEventListener("submit", (e) => { e.preventDefault(); runSimulation(); });
  form.addEventListener("reset", () => {
    clearError();
    outputEl.innerHTML = "";
  });

  document.querySelectorAll("[data-sim-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [a, b] = btn.dataset.simPreset.split(",");
      if (inputA) inputA.value = a;
      if (inputB) inputB.value = b;
      if (opSelect) opSelect.value = "+";
      runSimulation();
    });
  });

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
    outputEl.innerHTML = "";
    if (inputA) inputA.setAttribute("aria-invalid", "true");
    if (inputB) inputB.setAttribute("aria-invalid", "true");
  }
  function clearError() {
    if (errorEl) { errorEl.hidden = true; errorEl.textContent = ""; }
    if (inputA) inputA.removeAttribute("aria-invalid");
    if (inputB) inputB.removeAttribute("aria-invalid");
  }
  function fmtFull(n) {
    if (n === 0) return "0";
    if (!Number.isFinite(n)) return String(n);
    return Number(n.toPrecision(17)).toString();
  }

  function runSimulation() {
    clearError();
    const aRaw = inputA.value.trim();
    const bRaw = inputB.value.trim();
    if (aRaw === "" || bRaw === "") { showError("กรุณาป้อน Operand A และ B"); return; }
    const aNum = Number(aRaw);
    const bNum = Number(bRaw);
    if (!Number.isFinite(aNum) || !Number.isFinite(bNum)) {
      showError("Operand ต้องเป็นตัวเลขที่ถูกต้อง");
      return;
    }

    const bitsA = float32ToBits(aNum);
    const bitsB = float32ToBits(bNum);

    const kindA = classifyFloat32(bitsA);
    const kindB = classifyFloat32(bitsB);
    const bad = ["infinity", "nan", "subnormal"];
    if (bad.includes(kindA) || bad.includes(kindB)) {
      showError("มี Operand ที่เป็น Infinity, NaN หรือ Subnormal ซึ่งยังไม่รองรับ");
      return;
    }

    const a32 = bitsToFloat32(bitsA);
    const b32 = bitsToFloat32(bitsB);
    const op = opSelect.value === "-" ? "-" : "+";

    const exactMath = op === "+" ? (a32 + b32) : (a32 - b32);
    const result32 = Math.fround(exactMath);
    const bitsR = float32ToBits(result32);
    const kindR = classifyFloat32(bitsR);

    if (kindR === "infinity" || kindR === "nan") {
      showError("ผลลัพธ์ Overflow (Infinity/NaN) — ยังไม่รองรับ");
      return;
    }
    if (kindR === "subnormal") {
      showError("ผลลัพธ์เป็น Subnormal — ยังไม่รองรับ");
      return;
    }

    const steps = buildDetailedSteps(a32, b32, op, bitsA, bitsB, bitsR, result32);

    outputEl.innerHTML = buildSimHTML({
      aInput: aNum, bInput: bNum, a32, b32, op,
      bitsA, bitsB, bitsR, result32, exactMath, steps,
    });
  }

  /**
   * Build a fully-detailed educational breakdown with:
   * - actual exponent/significand extraction
   * - exponent alignment with explicit shifts
   * - signed significand addition
   * - note about lost bits
   */
  function buildDetailedSteps(a32, b32, op, bitsA, bitsB, bitsR, result32) {
    const infoA = splitBits(bitsA);
    const infoB = splitBits(bitsB);

    const eA = infoA.expField - 127;
    const eB = infoB.expField - 127;

    // 24-bit significands (hidden 1)
    const sigA = (1 << 23) | infoA.fracField;
    const sigB = (1 << 23) | infoB.fracField;

    const commonExp = Math.max(eA, eB);
    const shiftA = commonExp - eA;
    const shiftB = commonExp - eB;

    // Aligned significands (right shift by shiftX). Bits shifted out are "lost".
    const alignedA = shiftA >= 24 ? 0 : (sigA >>> shiftA);
    const alignedB = shiftB >= 24 ? 0 : (sigB >>> shiftB);

    // Sign convention: effective sign of A and B after applying operation
    const signA = infoA.sign;       // 0=+, 1=-
    const signB = infoB.sign;
    // For subtraction, flip sign of B
    const effectiveSignB = op === "+" ? signB : (signB === 0 ? 1 : 0);

    const signedA = signA === 0 ? alignedA : -alignedA;
    const signedB = effectiveSignB === 0 ? alignedB : -alignedB;
    const sumSigned = signedA + signedB;
    const sumAbs = Math.abs(sumSigned);

    return {
      eA, eB, commonExp, shiftA, shiftB,
      sigA, sigB, alignedA, alignedB,
      signA, signB, effectiveSignB,
      signedA, signedB, sumSigned, sumAbs,
      sameExponent: eA === eB,
    };
  }

  function toBinary24(n) {
    // Display 24-bit binary of an integer (0..2^24-1)
    return (n >>> 0).toString(2).padStart(24, "0");
  }

  function bitStringHTML(bitStr) {
    let html = "";
    for (let i = 0; i < 32; i++) {
      let cls = "bit-frac";
      if (i === 0) cls = "bit-sign";
      else if (i < 9) cls = "bit-exp";
      html += `<span class="bit-char ${cls}">${bitStr[i]}</span>`;
    }
    return `<div class="bitstring-display">${html}</div>`;
  }

  function buildSimHTML({ aInput, bInput, a32, b32, op, bitsA, bitsB, bitsR, result32, exactMath, steps }) {
    const opSym = op === "+" ? "+" : "−";
    const diffFromExact = result32 - exactMath;

    return `
      <div class="output-block">
        <h3>ข้อมูลนำเข้าและค่าที่แปลงเป็น Float32</h3>
        <div class="compare-grid">
          <div class="compare-col">
            <h4>Operand A</h4>
            <dl class="kv-list">
              <dt>ที่ป้อน</dt><dd>${fmtFull(aInput)}</dd>
              <dt>Float32</dt><dd>${fmtFull(a32)}</dd>
              <dt>Hex</dt><dd>${bitsToHex(bitsA)}</dd>
            </dl>
          </div>
          <div class="compare-col">
            <h4>Operand B</h4>
            <dl class="kv-list">
              <dt>ที่ป้อน</dt><dd>${fmtFull(bInput)}</dd>
              <dt>Float32</dt><dd>${fmtFull(b32)}</dd>
              <dt>Hex</dt><dd>${bitsToHex(bitsB)}</dd>
            </dl>
          </div>
        </div>
        <p class="help" style="margin-top:.75rem">Operation: <strong>${opSym}</strong></p>
      </div>

      <div class="output-block">
        <h3>บิต IEEE 754 ของ Operand</h3>
        <h4>A — ${bitsToHex(bitsA)}</h4>
        ${bitStringHTML(bitsToBitString(bitsA))}
        <h4>B — ${bitsToHex(bitsB)}</h4>
        ${bitStringHTML(bitsToBitString(bitsB))}
      </div>

      <div class="output-block">
        <h3>ขั้นตอนที่ 1: แยก Sign, Exponent, Significand</h3>
        <div class="compare-grid">
          <div class="compare-col">
            <h4>Operand A</h4>
            <dl class="kv-list">
              <dt>Sign</dt><dd>${steps.signA} (${steps.signA === 0 ? "บวก" : "ลบ"})</dd>
              <dt>Exponent (biased)</dt><dd>${bitsA >>> 23 & 0xFF}</dd>
              <dt>Unbiased e</dt><dd>${steps.eA}</dd>
              <dt>Significand (24-bit)</dt><dd class="small-mono">${toBinary24(steps.sigA)}</dd>
            </dl>
          </div>
          <div class="compare-col">
            <h4>Operand B</h4>
            <dl class="kv-list">
              <dt>Sign</dt><dd>${steps.signB} (${steps.signB === 0 ? "บวก" : "ลบ"})</dd>
              <dt>Exponent (biased)</dt><dd>${bitsB >>> 23 & 0xFF}</dd>
              <dt>Unbiased e</dt><dd>${steps.eB}</dd>
              <dt>Significand (24-bit)</dt><dd class="small-mono">${toBinary24(steps.sigB)}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="output-block">
        <h3>ขั้นตอนที่ 2: ปรับ Exponent ให้เท่ากัน</h3>
        <p class="help">
          เราใช้ common exponent = max(eA, eB) = max(${steps.eA}, ${steps.eB}) = <strong>${steps.commonExp}</strong>
          แล้วเลื่อน significand ของค่าที่ exponent น้อยกว่าไปทางขวา
        </p>
        ${steps.sameExponent
          ? `<p class="status-ok">✓ Exponent เท่ากันอยู่แล้ว ไม่ต้องเลื่อน</p>`
          : `<p class="status-warn">⚠ ต้องเลื่อน: A เลื่อน ${steps.shiftA} บิต, B เลื่อน ${steps.shiftB} บิต</p>`}
        <div class="compare-grid">
          <div class="compare-col">
            <h4>Aligned Significand A</h4>
            <dl class="kv-list">
              <dt>ก่อนเลื่อน</dt><dd class="small-mono">${toBinary24(steps.sigA)}</dd>
              <dt>Shift right</dt><dd>${steps.shiftA} บิต</dd>
              <dt>หลังเลื่อน</dt><dd class="small-mono">${toBinary24(steps.alignedA)}</dd>
            </dl>
          </div>
          <div class="compare-col">
            <h4>Aligned Significand B</h4>
            <dl class="kv-list">
              <dt>ก่อนเลื่อน</dt><dd class="small-mono">${toBinary24(steps.sigB)}</dd>
              <dt>Shift right</dt><dd>${steps.shiftB} บิต</dd>
              <dt>หลังเลื่อน</dt><dd class="small-mono">${toBinary24(steps.alignedB)}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="output-block">
        <h3>ขั้นตอนที่ 3: บวก/ลบ Significand (พร้อมเครื่องหมาย)</h3>
        <dl class="kv-list">
          <dt>A signed</dt><dd>${steps.signA === 0 ? "+" : "−"} ${toBinary24(steps.alignedA)} = ${steps.signedA}</dd>
          <dt>B signed (หลังปรับ op)</dt><dd>${steps.effectiveSignB === 0 ? "+" : "−"} ${toBinary24(steps.alignedB)} = ${steps.signedB}</dd>
          <dt>ผลรวม (signed)</dt><dd><strong>${steps.sumSigned}</strong></dd>
          <dt>|ผลรวม|</dt><dd>${steps.sumAbs}</dd>
        </dl>
      </div>

      <div class="output-block">
        <h3>ขั้นตอนที่ 4: Normalize + Rounding + Encode</h3>
        <p class="help">
          ขั้นตอนนี้จะจัดผลรวมให้กลับมาอยู่ในรูป 1.xxxxx × 2^e แล้วปัดเศษให้พอดี 23 บิต
          และเข้ารหัสเป็น 32 บิต บิตสุดท้ายคำนวณด้วย IEEE 754 Float32 จริง (single rounding step)
          จาก operand ที่เป็น Float32 อยู่แล้ว
        </p>
        <dl class="kv-list">
          <dt>ผลลัพธ์บิต</dt><dd class="small-mono">${bitsToBitString(bitsR)}</dd>
          <dt>Hexadecimal</dt><dd>${bitsToHex(bitsR)}</dd>
        </dl>
        ${bitStringHTML(bitsToBitString(bitsR))}
      </div>

      <div class="output-block">
        <h3>ผลลัพธ์สุดท้าย</h3>
        <dl class="kv-list">
          <dt>ผลลัพธ์ Float32</dt><dd><strong>${fmtFull(result32)}</strong></dd>
          <dt>ค่าทางคณิตศาสตร์ (ก่อนปัด)</dt><dd>${fmtFull(exactMath)}</dd>
          <dt>ผลต่างจากการปัดเศษ</dt><dd>${diffFromExact === 0 ? "0 (แม่นยำ)" : fmtFull(diffFromExact)}</dd>
        </dl>
        <p class="note">
          ${opSym} ของ Float32 operands ผ่านการปัดเศษเพียงครั้งเดียว (round-to-nearest-even)
          จึงอาจต่างจากการคำนวณทางคณิตศาสตร์แบบไม่จำกัดความแม่นยำ — โดยเฉพาะเมื่อ operands เป็นค่าที่ไม่สามารถแทนได้ตรงๆ ใน Float32
        </p>
      </div>
    `;
  }
})();