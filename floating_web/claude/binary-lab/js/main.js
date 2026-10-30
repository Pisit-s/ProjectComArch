/* main.js — Router + UI ของเครื่องมือ Interactive (ตรรกะคำนวณอยู่ใน core.js) */
(function () {
  'use strict';
  const C = window.Core;
  let uid = 0;
  const nid = (p) => `${p}-${++uid}`;

  // สร้าง DOM element แบบสั้น ๆ (ใช้ textContent เสมอ ไม่ใช้ innerHTML กับข้อมูลผู้ใช้)
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
    }
    for (const x of kids.flat()) if (x != null) e.append(x.nodeType ? x : document.createTextNode(x));
    return e;
  }
  const span = (cls, t) => h('span', { class: cls }, t);
  const mono = (t) => h('code', null, t);

  // แสดงบิต 32 ตัวแยกสี + มีป้ายกำกับ (ไม่พึ่งสีอย่างเดียว)
  function fieldBits(sign, exp, frac) {
    return h('div', { class: 'bitstr big' }, span('s', sign), ' ', span('e', exp), ' ', span('f', frac));
  }
  function legend() {
    return h('div', { class: 'legend' }, h('span', { class: 's' }, '■ ', h('b', null, 'Sign'), ' (1 บิต)'),
      h('span', { class: 'e' }, '■ ', h('b', null, 'Exponent'), ' (8 บิต)'), h('span', { class: 'f' }, '■ ', h('b', null, 'Fraction'), ' (23 บิต)'));
  }
  function step(n, title, ...body) { return h('div', { class: 'step' }, h('b', null, `ขั้นที่ ${n}: ${title}`), ...body.map((b) => (typeof b === 'string' ? h('p', null, b) : b))); }
  function copyBtn(text, label) {
    const b = h('button', { type: 'button', class: 'btn', onclick: async () => {
      try { await navigator.clipboard.writeText(text); b.textContent = 'คัดลอกแล้ว ✓'; } catch { b.textContent = 'คัดลอกไม่ได้'; }
      setTimeout(() => (b.textContent = label), 1500);
    } }, label);
    return b;
  }
  // ช่อง input พร้อม label และข้อความ error ใกล้ช่อง
  function field(label, value, extra = {}) {
    const id = nid('in'), eid = nid('er');
    const input = h('input', { id, type: 'text', value, autocomplete: 'off', spellcheck: 'false', 'aria-describedby': eid, ...extra });
    const err = h('div', { class: 'err', id: eid, role: 'alert' });
    return { input, err, wrap: h('label', { for: id }, label, input), setErr(m) { err.textContent = m || ''; input.classList.toggle('invalid', !!m); input.setAttribute('aria-invalid', !!m); } };
  }
  const row = (...k) => h('div', { class: 'row' }, ...k);
  const btn = (t, fn, cls = '') => h('button', { type: 'button', class: 'btn ' + cls, onclick: fn }, t);
  const table = (head, rows) => h('div', { class: 'tbl' }, h('table', null, h('thead', null, h('tr', null, head.map((x) => h('th', null, x)))), h('tbody', null, rows.map((r) => h('tr', null, r.map((c) => h('td', null, c)))))));

  /* ---------------- บทที่ 1: 8-bit ---------------- */
  function mountBits8(root) {
    const bits = Array(8).fill(0), btns = [], cells = [], conts = [];
    const grid = h('div', { class: 'bitgrid b8' }), out = h('div', { class: 'result', 'aria-live': 'polite' });
    for (let i = 0; i < 8; i++) {
      const p = 7 - i, w = 2 ** p;
      const b = h('button', { type: 'button', class: 'bit', 'aria-label': `บิต b${p} น้ำหนัก ${w}`, onclick: () => { bits[i] ^= 1; render(); } }, '0');
      const c = h('div', { class: 'contrib' }), cell = h('div', { class: 'cell' }, h('div', { class: 'lbl' }, 'b' + p), b, h('div', { class: 'w' }, `2^${p}=${w}`), c);
      btns.push(b); conts.push(c); cells.push(cell); grid.append(cell);
    }
    function render() {
      let total = 0; const terms = [];
      bits.forEach((v, i) => {
        const w = 2 ** (7 - i);
        btns[i].textContent = v; btns[i].setAttribute('aria-pressed', !!v); btns[i].classList.toggle('on', !!v);
        cells[i].classList.toggle('on', !!v); conts[i].textContent = `${v}×${w}=${v * w}`;
        total += v * w; if (v) terms.push(w);
      });
      out.replaceChildren(h('div', null, 'Binary: ', h('span', { class: 'big' }, bits.join('') + '₂')), h('div', null, 'Decimal: ', h('span', { class: 'big' }, String(total))),
        h('div', { class: 'mono' }, terms.length ? `${terms.join(' + ')} = ${total}` : '(ไม่มีบิตที่เป็น 1) = 0'));
    }
    const set = (n) => { for (let i = 0; i < 8; i++) bits[i] = (n >> (7 - i)) & 1; render(); };
    root.append(grid, out, row(h('span', { class: 'empty' }, 'ตัวอย่าง:'), ...[0, 10, 128, 255].map((n) => btn(String(n), () => set(n))), btn('Reset', () => set(0))));
    render();
  }

  /* ---------------- บทที่ 2A: 16-bit fraction ---------------- */
  function mountFrac16(root) {
    const N = 16, bits = Array(N).fill(0), btns = [], cells = [], conts = [];
    const grid = h('div', { class: 'bitgrid b16' }), out = h('div', { class: 'result', 'aria-live': 'polite' });
    for (let i = 1; i <= N; i++) {
      const b = h('button', { type: 'button', class: 'bit', 'aria-label': `บิต b${i} น้ำหนัก 2 ยกกำลังลบ ${i}`, onclick: () => { bits[i - 1] ^= 1; render(); } }, '0');
      const c = h('div', { class: 'contrib' }), cell = h('div', { class: 'cell' }, h('div', { class: 'lbl' }, 'b' + i), b, h('div', { class: 'w' }, `2^-${i}`), h('div', null, C.fmtDyadic(1, i)), c);
      btns.push(b); conts.push(c); cells.push(cell); grid.append(cell);
    }
    function render() {
      let k = 0;
      bits.forEach((v, i) => {
        btns[i].textContent = v; btns[i].setAttribute('aria-pressed', !!v); btns[i].classList.toggle('on', !!v); cells[i].classList.toggle('on', !!v);
        conts[i].textContent = v ? '+' + C.fmtDyadic(1, i + 1) : '+0'; k += v * 2 ** (N - 1 - i);
      });
      out.replaceChildren(h('div', null, 'Binary: ', h('span', { class: 'big' }, '0.' + bits.join('') + '₂')), h('div', null, 'Decimal: ', h('span', { class: 'big' }, C.fmtDyadic(k, N))),
        h('div', { class: 'empty' }, 'ค่าฐานสิบนี้เป็นค่าที่แน่นอน เพราะผลรวมของ 2⁻ⁿ เป็นทศนิยมจำกัดเสมอ'));
    }
    const setStr = (s) => { for (let i = 0; i < N; i++) bits[i] = +(s[i] || 0); render(); };
    root.append(grid, out, row(h('span', { class: 'empty' }, 'ตัวอย่าง:'), btn('0.5', () => setStr('1')), btn('0.375', () => setStr('011')), btn('0.625', () => setStr('101')), btn('1 − 2⁻¹⁶ (ทุกบิตเป็น 1)', () => setStr('1'.repeat(16))), btn('Reset', () => setStr(''))));
    render();
  }

  /* ---------------- บทที่ 2B: converter ---------------- */
  function mountConv(root) {
    const f = field('เศษส่วนฐานสิบ (0 ≤ x < 1)', '0.1', { inputmode: 'decimal' });
    const sel = h('select', null, ...[8, 16, 23, 32].map((n) => h('option', { value: n, selected: n === 16 }, n + ' บิต')));
    const out = h('div', { 'aria-live': 'polite' }, h('p', { class: 'empty' }, 'ป้อนค่าแล้วกด “แปลง” เพื่อดูขั้นตอน'));
    function run() {
      const r = C.fractionToBinary(f.input.value, +sel.value);
      f.setErr(r.error); if (r.error) { out.replaceChildren(h('p', { class: 'empty' }, 'ยังไม่มีผลลัพธ์')); return; }
      const rows = r.rows.map((x, i) => [i + 1, x.before, x.after, x.bit, x.rest]);
      const verdict = r.terminated ? h('p', { class: 'ok' }, `✓ แปลงได้แม่นยำ: เศษส่วนเหลือ 0 ที่ ${r.rows.length} บิต`)
        : h('p', { class: 'err', style: 'color:var(--exp)' }, `⚠ ไม่สิ้นสุดภายใน ${sel.value} บิต — ผลลัพธ์เป็นค่าประมาณ (ตัดบิตที่เหลือทิ้ง)`);
      out.replaceChildren(table(['ขั้น', 'เศษส่วนก่อนคูณ', 'หลังคูณ 2', 'บิตที่ได้', 'เศษส่วนเหลือ'], rows),
        h('div', { class: 'result' }, verdict, h('div', null, 'Binary Fraction: ', h('span', { class: 'big' }, '0.' + r.bits + '₂')),
          h('div', null, 'ค่า Decimal ที่ประมาณได้: ', h('span', { class: 'big' }, r.approx)), h('div', null, 'Absolute Error: ', h('span', { class: 'big' }, r.absError === 0 ? '0' : r.absError.toExponential(6)))));
    }
    root.append(h('form', { onsubmit: (e) => { e.preventDefault(); run(); } }, row(f.wrap, h('label', null, 'จำนวนบิตสูงสุด', sel), h('button', { class: 'btn primary', type: 'submit' }, 'แปลง'), btn('0.375', () => { f.input.value = '0.375'; run(); }), btn('0.625', () => { f.input.value = '0.625'; run(); }), btn('0.1', () => { f.input.value = '0.1'; run(); })), f.err), out);
    run();
  }

  /* ---------------- บทที่ 3: IEEE 754 ---------------- */
  function renderEncode(v) {
    const r = C.encode(v), e = r.e;
    const box = h('div', null);
    box.append(h('div', { class: 'result' }, legend(), fieldBits(r.sign, r.expField, r.frac),
      h('div', null, 'Hex: ', h('span', { class: 'big' }, r.hex), ' ', copyBtn(r.hex, 'คัดลอก Hex'), ' ', copyBtn(r.bits, 'คัดลอก Bits')),
      h('div', null, 'ค่าที่ผู้ใช้ป้อน: ', mono(C.fmtExact(r.input))), h('div', null, 'ค่าที่จัดเก็บจริง (Float32): ', mono(C.fmtExact(r.stored))),
      r.exact ? h('p', { class: 'ok' }, '✓ ค่าที่เก็บเท่ากับค่าที่ป้อนพอดี')
        : h('p', { style: 'color:var(--exp)' }, `⚠ ไม่เท่ากัน: Float32 เก็บได้เพียงค่าประมาณ (ปัดเศษ) ผลต่าง = ${r.diff.toExponential(6)} (เทียบกับ double ของค่าที่ป้อน)`)));
    if (r.stored === 0) { box.append(step(1, 'กรณีศูนย์', 'ค่า 0 เก็บเป็น Exponent = 0 และ Fraction = 0 (ไม่ใช้รูป Normalized)')); return box; }
    const fracShow = r.frac.replace(/0+$/, '') || '0';
    box.append(
      step(1, 'ตรวจเครื่องหมายและหาค่า |x|', `เครื่องหมาย ${r.sign === '1' ? 'ลบ' : 'บวก'}, |ค่าที่จัดเก็บ| = ${C.fmtExact(Math.abs(r.stored))}`),
      step(2, 'แปลงเป็นเลขฐานสอง', h('div', { class: 'formula' }, r.absBinary.length > 120 ? r.absBinary.slice(0, 120) + '…' : r.absBinary + '₂'), 'นี่คือฐานสองของค่าที่จัดเก็บจริง (ค่าที่ป้อนอาจยาวกว่านี้แล้วถูกปัดเหลือ 24 บิตนัยสำคัญ)'),
      step(3, 'Normalize', h('div', { class: 'formula' }, `1.${fracShow}₂ × 2^${e}`)),
      step(4, 'Sign bit', `Sign = ${r.sign}`),
      step(5, 'Biased Exponent', h('div', { class: 'formula' }, `${e} + 127 = ${r.expNum} = ${r.expField}₂`)),
      step(6, 'Fraction 23 บิต', h('div', { class: 'formula' }, r.frac), r.exact ? 'ไม่ต้องปัดเศษ' : 'ปัดเศษแบบ Round to Nearest, Ties to Even เมื่อเกิน 23 บิต'),
      step(7, 'รวมเป็น 32 บิต', fieldBits(r.sign, r.expField, r.frac)));
    return box;
  }
  function renderDecode(raw) {
    const r = C.decode(raw);
    if (r.error) return { error: r.error };
    const box = h('div', null, h('div', { class: 'result' }, legend(), fieldBits(r.sign, r.expField, r.frac), h('div', null, 'Hex: ', h('span', { class: 'big' }, r.hex), ' ', copyBtn(r.hex, 'คัดลอก Hex')),
      h('div', null, 'ค่าที่ถอดรหัส: ', h('span', { class: 'big' }, C.fmtExact(r.value)))));
    box.append(step(1, 'แยกฟิลด์', h('div', { class: 'formula' }, `Sign = ${r.sign}\nExponent = ${r.expField}₂ = ${r.expNum}\nFraction = ${r.frac}`)));
    if (r.zero) { box.append(step(2, 'ตีความ', 'Exponent = 0 และ Fraction = 0 คือค่าศูนย์')); return { node: box }; }
    box.append(step(2, 'Sign', `Sign = ${r.sign} → ${r.sign === '1' ? 'ค่าลบ (−1)' : 'ค่าบวก (+1)'}`),
      step(3, 'Unbiased Exponent', h('div', { class: 'formula' }, `e = ${r.expNum} − 127 = ${r.e}`)),
      step(4, 'Significand (Hidden 1)', h('div', { class: 'formula' }, `1.${r.frac.replace(/0+$/, '') || '0'}₂ = 1 + ${parseInt(r.frac, 2)}/2²³ = ${C.fmtExact(r.significand)}`)),
      step(5, 'คำนวณค่า', h('div', { class: 'formula' }, `${r.sign === '1' ? '−' : '+'}${C.fmtExact(r.significand)} × 2^${r.e} = ${C.fmtExact(r.value)}`)));
    return { node: box };
  }
  function mountIEEE(root) {
    let mode = 'enc';
    const tabE = h('button', { type: 'button', class: 'btn', role: 'tab', onclick: () => setMode('enc') }, 'Encoder: ฐานสิบ → IEEE 754');
    const tabD = h('button', { type: 'button', class: 'btn', role: 'tab', onclick: () => setMode('dec') }, 'Decoder: IEEE 754 → ฐานสิบ');
    const fe = field('ตัวเลขฐานสิบ', '5.75', { inputmode: 'decimal' }), fd = field('บิต 32 ตัว (เว้นวรรคได้)', '0 10000001 01110000000000000000000', { size: 40 });
    const outE = h('div', { 'aria-live': 'polite' }), outD = h('div', { 'aria-live': 'polite' });
    function enc() {
      const p = C.parseNumber(fe.input.value); let m = p.error;
      if (!m) { const s = C.toSupportedFloat32(p.value); m = s.error; if (!m) { fe.setErr(''); outE.replaceChildren(renderEncode(p.value)); return; } }
      fe.setErr(m); outE.replaceChildren(h('p', { class: 'empty' }, 'ยังไม่มีผลลัพธ์ — แก้ไขค่าที่ป้อนแล้วลองใหม่'));
    }
    function dec() {
      const r = renderDecode(fd.input.value);
      fd.setErr(r.error); outD.replaceChildren(r.node || h('p', { class: 'empty' }, 'ยังไม่มีผลลัพธ์ — แก้ไขบิตแล้วลองใหม่'));
    }
    const ex = (fld, v, fn) => btn(v, () => { fld.input.value = v; fn(); });
    const encPane = h('div', null, h('form', { onsubmit: (e) => { e.preventDefault(); enc(); } }, row(fe.wrap, h('button', { class: 'btn primary', type: 'submit' }, 'แปลง'), ex(fe, '5.75', enc), ex(fe, '-13.25', enc), ex(fe, '0.1', enc)), fe.err), outE);
    const decPane = h('div', null, h('form', { onsubmit: (e) => { e.preventDefault(); dec(); } }, row(fd.wrap, h('button', { class: 'btn primary', type: 'submit' }, 'ถอดรหัส'), ex(fd, '01000000101110000000000000000000', dec), ex(fd, '11000001010101000000000000000000', dec)), fd.err), outD);
    function setMode(m) {
      mode = m; tabE.setAttribute('aria-selected', m === 'enc'); tabD.setAttribute('aria-selected', m === 'dec');
      encPane.hidden = m !== 'enc'; decPane.hidden = m !== 'dec';
    }
    root.append(h('div', { class: 'tabs', role: 'tablist' }, tabE, tabD), encPane, decPane);
    setMode('enc'); enc(); dec();
  }

  /* ---------------- บทที่ 4: Arithmetic ---------------- */
  const sf = (v) => C.fmtExact(v);
  function renderArith(a0, b0, op) {
    const a = Math.fround(a0), b = Math.fround(b0), A = C.encode(a), B = C.encode(b), r = C.simulate(a, b, op);
    const box = h('div', null);
    box.append(h('div', { class: 'result' }, legend(),
      h('div', null, 'A ที่ป้อน: ', mono(sf(a0)), ' → Float32: ', mono(sf(a))), fieldBits(A.sign, A.expField, A.frac),
      h('div', null, 'B ที่ป้อน: ', mono(sf(b0)), ' → Float32: ', mono(sf(b))), fieldBits(B.sign, B.expField, B.frac)));
    if (r.trivial) { box.append(step(1, 'Operand เป็นศูนย์', 'ผลลัพธ์เท่ากับอีกค่าหนึ่ง (กลับเครื่องหมายถ้าเป็นการลบ) ไม่ต้องปรับ Exponent')); }
    else {
      const O = op === '-' ? 'ลบ' : 'บวก';
      box.append(
        step(1, 'แยก Sign, Exponent, Significand', h('div', { class: 'formula' },
          `A: S=${r.A.s} E=${r.A.E} (e=${r.A.E - 127}) Sig=${C.b24(r.A.M).replace(/^1/, '1.')}\nB: S=${C.encode(b).sign} E=${r.B.E + 0} (e=${r.B.E - 127}) Sig=${C.b24(r.B.M).replace(/^1/, '1.')}` + (op === '-' ? '\nการลบ: ใช้ A + (−B) จึงกลับ Sign ของ B ก่อน' : ''))),
        step(2, 'เปรียบเทียบ Exponent', `ค่าที่มี Exponent ใหญ่กว่า (หรือขนาดใหญ่กว่า) คือ ${r.swap ? 'B' : 'A'}; ผลต่าง Exponent d = ${r.d}`),
        step(3, 'ปรับ Exponent ให้เท่ากัน', h('div', { class: 'formula' }, `ตัวใหญ่ : ${r.bigX.toString(2).padStart(27, '0')}  (Sig 24 บิต + GRS 3 บิต)\nตัวเล็ก : ${r.aligned.toString(2).padStart(27, '0')}  (เลื่อนขวา ${r.d} บิต${r.stickyLost ? ', มีบิตหลุดจึงตั้ง Sticky=1' : ''})`)),
        step(4, `${r.subtract ? 'ลบ' : 'บวก'} Significand`, h('div', { class: 'formula' }, `${r.bigX.toString(2).padStart(27, '0')}\n${r.subtract ? '−' : '+'}${r.aligned.toString(2).padStart(27, '0')}\n=${r.raw.toString(2).padStart(28, '0')}`)),
        step(5, 'เครื่องหมายของผลลัพธ์', `เครื่องหมายตามตัวที่ใหญ่กว่า = ${r.big.s === 1 ? 'ลบ' : 'บวก'}` + (r.subtract ? ' (เครื่องหมายต่างกัน จึงนำมาลบกัน)' : '')));
      if (r.zero) box.append(step(6, 'ผลลัพธ์เป็นศูนย์', 'ค่าทั้งสองหักล้างกันพอดี ผลลัพธ์ = +0'));
      else {
        box.append(step(6, 'Normalize', r.notes.length ? r.notes.map((n) => h('p', null, n)) : 'อยู่ในรูป 1.xxx แล้ว ไม่ต้องเลื่อน', h('div', { class: 'formula' }, `${r.norm.toString(2).padStart(27, '0')}  → Exponent = ${r.exp}`)),
          step(7, 'Rounding (Round to Nearest, Ties to Even)', h('div', { class: 'formula' }, `บิต GRS = ${r.rem.toString(2).padStart(3, '0')} → ${r.up ? 'ปัดขึ้น (+1 ที่บิตสุดท้ายของ Fraction)' : 'ปัดลง (ตัดทิ้ง)'}`)));
      }
    }
    if (r.error) { box.append(h('p', { class: 'err', role: 'alert' }, '⚠ ' + r.error)); return box; }
    const ba = C.toBits(r.result);
    box.append(step(8, 'Encode เป็น Float32', fieldBits(ba[0], ba.slice(1, 9), ba.slice(9))),
      h('div', { class: 'result' }, h('div', null, 'ผลลัพธ์ Float32 (ทศนิยม): ', h('span', { class: 'big' }, sf(r.result))), h('div', null, 'Hex: ', h('span', { class: 'big' }, r.hex), ' ', copyBtn(r.hex, 'คัดลอก Hex')),
        h('div', null, `ตรวจเทียบ Math.fround(Float32 A ${op} Float32 B): `, mono(sf(r.ref)), r.match ? h('span', { class: 'ok' }, ' ✓ ตรงกับแบบจำลอง') : h('span', { class: 'err' }, ' ✗ ไม่ตรง')),
        h('div', null, 'JavaScript Number (double) ของค่าที่ป้อน: ', mono(sf(op === '-' ? a0 - b0 : a0 + b0)), h('span', { class: 'empty' }, ' ← ชนิด double 64 บิต ไม่ใช่ Float32')),
        h('p', { class: 'empty' }, 'ผลต่างจากค่าทางคณิตศาสตร์เกิดจากการปัด Operand เป็น Float32 ก่อน และการปัดเศษผลลัพธ์ให้พอดี 23 บิต Fraction')));
    return box;
  }
  function mountArith(root) {
    const fa = field('Operand A', '0.1', { inputmode: 'decimal' }), fb = field('Operand B', '0.2', { inputmode: 'decimal' });
    const sel = h('select', { 'aria-label': 'Operation' }, h('option', { value: '+' }, '+'), h('option', { value: '-' }, '−'));
    const out = h('div', { 'aria-live': 'polite' }, h('p', { class: 'empty' }, 'ป้อนค่าแล้วกด Calculate'));
    function run() {
      const pa = C.parseNumber(fa.input.value), pb = C.parseNumber(fb.input.value);
      const ea = pa.error || C.toSupportedFloat32(pa.value).error, eb = pb.error || C.toSupportedFloat32(pb.value).error;
      fa.setErr(ea); fb.setErr(eb);
      if (ea || eb) { out.replaceChildren(h('p', { class: 'empty' }, 'ยังไม่มีผลลัพธ์ — แก้ไขค่าที่ป้อนแล้วลองใหม่')); return; }
      try { out.replaceChildren(renderArith(pa.value, pb.value, sel.value)); } catch (e) { out.replaceChildren(h('p', { class: 'err', role: 'alert' }, 'เกิดข้อผิดพลาดในการคำนวณ: ' + e.message)); }
    }
    const reset = () => { fa.input.value = '0.1'; fb.input.value = '0.2'; sel.value = '+'; fa.setErr(''); fb.setErr(''); out.replaceChildren(h('p', { class: 'empty' }, 'ป้อนค่าแล้วกด Calculate')); };
    root.append(h('form', { onsubmit: (e) => { e.preventDefault(); run(); } }, row(fa.wrap, h('label', null, 'Operation', sel), fb.wrap, h('button', { class: 'btn primary', type: 'submit' }, 'Calculate'), btn('Reset', reset)), fa.err, fb.err), out);
    run();
  }

  /* ---------------- Router ---------------- */
  const mounts = { bits8: mountBits8, frac16: mountFrac16, conv: mountConv, ieee: mountIEEE, arith: mountArith };
  document.querySelectorAll('[data-tool]').forEach((el) => mounts[el.dataset.tool](el));
  function route() {
    const id = (location.hash || '#home').slice(1);
    const page = document.getElementById(id) && document.getElementById(id).classList.contains('page') ? id : 'home';
    document.querySelectorAll('.page').forEach((p) => p.classList.toggle('active', p.id === page));
    document.querySelectorAll('nav.side a').forEach((a) => (a.getAttribute('href') === '#' + page ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route); route();
})();
