import type { BlockId, WireId } from '@/lib/lesson/circuit-map';

/**
 * "อยากรู้ลึก" panel of each block in Chapter 5 (opens when a block is tapped). Bit-level
 * behaviour from the team's notes (วงจร/FP-Adder-bit-level-signals-per-block.pdf, @phatwat),
 * rewritten short. Not part of the chapter text budget: it is for readers who want to go further.
 */
export interface SignalRow {
  name: string;
  bits: number;
  /** Where it comes from (inputs) or goes to (outputs). */
  peer: string;
  /** Wire that carries it, to show this step's value. */
  wire?: WireId;
}

export interface BlockDetail {
  what: string;
  how: string[];
  inputs: SignalRow[];
  outputs: SignalRow[];
  note?: string;
}

const register = (x: 'A' | 'B'): BlockDetail => ({
  what: `ตัวเลข ${x} แบบ IEEE 754 แบ่งเป็น 3 ช่อง ส่งแต่ละช่องไปคนละกล่อง`,
  how: [`m${x} = {1, f${x}}  เติม 1 ที่ซ่อนไว้กลับหน้า 23 บิต`],
  inputs: [],
  outputs: [
    { name: `s${x}`, bits: 1, peer: 'Control', wire: x === 'A' ? 'a-sign' : 'b-sign' },
    {
      name: `e${x}[7:0]`,
      bits: 8,
      peer: 'Small ALU, MUX exp',
      wire: x === 'A' ? 'a-exp' : 'b-exp',
    },
    { name: `m${x}`, bits: 24, peer: 'MUX small, MUX large', wire: x === 'A' ? 'a-sig' : 'b-sig' },
  ],
});

export const BLOCK_DETAILS: Record<BlockId, BlockDetail> = {
  regA: register('A'),
  regB: register('B'),
  smallAlu: {
    what: 'ลบ exponent สองตัว แล้วบอกว่าตัวไหนใหญ่ ต้องเลื่อนกี่ตำแหน่ง และไกลเกินกว่าจะเลื่อนไหวไหม',
    how: [
      'D[8:0] = {0,eA} + ~{0,eB} + 1   (ลบด้วย ALU: Binv = 1, CarryIn = 1)',
      'neg = D[8]   (1 เมื่อ eA < eB)',
      'absD = neg ? (~D + 1) : D',
      'far = absD ≥ 32',
    ],
    inputs: [
      { name: 'eA[7:0]', bits: 8, peer: 'A', wire: 'a-exp' },
      { name: 'eB[7:0]', bits: 8, peer: 'B', wire: 'b-exp' },
    ],
    outputs: [
      { name: 'neg', bits: 1, peer: 'Control', wire: 'alu-ctl' },
      { name: 'absD[4:0]', bits: 5, peer: 'Shift right', wire: 'alu-shift' },
      { name: 'far', bits: 1, peer: 'Shift right', wire: 'alu-far' },
    ],
    note: 'ใช้ 9 บิต เพราะ eA − eB อยู่ในช่วง −255 ถึง 255 บิตที่ 8 จึงเป็นเครื่องหมายพอดี',
  },
  control: {
    what: 'วงจรตรรกะล้วน (ไม่มีหน่วยความจำ) ตัดสินว่าต้องบวกหรือลบจริง ใครใหญ่กว่า และ sign ของผล แล้วสั่งกล่องอื่น',
    how: [
      'sBp = sB XOR sub   (ลบ = บวกกับ B ที่กลับ sign)',
      'effSub = sA XOR sBp   (1 = ต้องลบ significand จริง)',
      'sel = neg',
      'Binv = CarryIn = effSub',
      'signR = (neg ? sBp : sA) XOR (effSub AND bigNeg)',
    ],
    inputs: [
      { name: 'sA, sB', bits: 1, peer: 'A, B', wire: 'a-sign' },
      { name: 'sub', bits: 1, peer: 'คำสั่ง 0 = บวก, 1 = ลบ', wire: 'sub-in' },
      { name: 'neg', bits: 1, peer: 'Small ALU', wire: 'alu-ctl' },
      { name: 'bigNeg', bits: 1, peer: 'Big ALU', wire: 'big-neg' },
    ],
    outputs: [
      { name: 'sel', bits: 1, peer: 'MUX ทั้ง 3 ตัว (สายเดียวแตก 3)', wire: 'ctl-mux-exp' },
      { name: 'Binv, CarryIn', bits: 2, peer: 'Big ALU', wire: 'ctl-alu' },
      { name: 'signR', bits: 1, peer: 'sign ของผลลัพธ์', wire: 'ctl-sign' },
    ],
    note: 'sel ตัวเดียวคุม MUX ทั้ง 3 เพราะตัดสินเรื่องเดียวกัน คือใครใหญ่กว่า',
  },
  muxExp: {
    what: 'เลือก exponent ของตัวที่ใหญ่กว่า ใช้เป็นฐานของผล',
    how: [
      'out[i] = (NOT sel AND in0[i]) OR (sel AND in1[i])  ทุกบิต',
      'sel = 0 → eA,  sel = 1 → eB',
    ],
    inputs: [
      { name: 'in0 = eA', bits: 8, peer: 'A', wire: 'a-exp-mux' },
      { name: 'in1 = eB', bits: 8, peer: 'B', wire: 'b-exp-mux' },
      { name: 'sel', bits: 1, peer: 'Control', wire: 'ctl-mux-exp' },
    ],
    outputs: [{ name: 'E0[7:0]', bits: 8, peer: 'Inc / Dec', wire: 'exp-incdec' }],
    note: 'MUX กว้าง 8 บิต คือ MUX 1 บิต 8 ตัวที่ใช้ sel ร่วมกัน',
  },
  muxSmall: {
    what: 'เลือก significand ของตัวที่เล็กกว่า ส่งไปเลื่อน',
    how: ['sel = 0 → mB,  sel = 1 → mA'],
    inputs: [
      { name: 'in0 = mB', bits: 24, peer: 'B', wire: 'b-sig-small' },
      { name: 'in1 = mA', bits: 24, peer: 'A', wire: 'a-sig' },
      { name: 'sel', bits: 1, peer: 'Control', wire: 'ctl-mux-small' },
    ],
    outputs: [{ name: 'mSmall', bits: 24, peer: 'Shift right', wire: 'mux-shift' }],
    note: 'MUX small กับ MUX large ใช้ sel เส้นเดียวกันแต่ต่อขาสลับกัน จึงได้ตัวเล็กกับตัวใหญ่พร้อมกัน',
  },
  muxBig: {
    what: 'เลือก significand ของตัวที่ใหญ่กว่า ส่งตรงไป Big ALU',
    how: ['sel = 0 → mA,  sel = 1 → mB'],
    inputs: [
      { name: 'in0 = mA', bits: 24, peer: 'A', wire: 'a-sig-big' },
      { name: 'in1 = mB', bits: 24, peer: 'B', wire: 'b-sig' },
      { name: 'sel', bits: 1, peer: 'Control', wire: 'ctl-mux-big' },
    ],
    outputs: [{ name: 'X', bits: 24, peer: 'Big ALU', wire: 'big-alu' }],
  },
  shift: {
    what: 'barrel shifter 5 ชั้น เลื่อนตัวเล็กไปขวา absD ตำแหน่งในครั้งเดียว และเก็บบิตที่หลุดไว้เป็น G R S',
    how: [
      'ชั้น s0…s4 เลื่อน 1, 2, 4, 8, 16 ตามบิตของ absD',
      '{Y, G, R, S} = {mSmall, 000} >> absD',
      'S = OR ของทุกบิตที่หลุดต่ำกว่า R',
      'far = 1 → Y = 0, G = R = 0, S = 1',
    ],
    inputs: [
      { name: 'mSmall', bits: 24, peer: 'MUX small', wire: 'mux-shift' },
      { name: 'absD[4:0]', bits: 5, peer: 'Small ALU', wire: 'alu-shift' },
      { name: 'far', bits: 1, peer: 'Small ALU', wire: 'alu-far' },
    ],
    outputs: [{ name: 'Q = {Y, G, R, S}', bits: 27, peer: 'Big ALU', wire: 'shift-alu' }],
    note: 'far = 1: ตัวเล็กหายหมดแต่ไม่ใช่ศูนย์ (มี 1 ที่ซ่อน) จึงเหลือแค่ S = 1',
  },
  bigAlu: {
    what: 'บวกหรือลบ significand 27 บิต แบบเดียวกับ ALU ในบทที่ 1 ได้ผล 28 บิต',
    how: [
      'P = {X, 000},  Q = {Y, G, R, S}',
      'T = P + (Q XOR Binv ทุกบิต) + CarryIn',
      'bigNeg = effSub AND T[27]',
    ],
    inputs: [
      { name: 'P', bits: 27, peer: 'MUX large', wire: 'big-alu' },
      { name: 'Q', bits: 27, peer: 'Shift right', wire: 'shift-alu' },
      { name: 'Binv, CarryIn', bits: 2, peer: 'Control', wire: 'ctl-alu' },
    ],
    outputs: [
      { name: 'T[27:0]', bits: 28, peer: 'Negate if bigNeg', wire: 'alu-negate' },
      { name: 'bigNeg', bits: 1, peer: 'Control', wire: 'big-neg' },
    ],
    note: 'บวก: T[27] = 1 แปลว่าได้ 10.xxx (ผล ≥ 2) · ลบ: T[27] = 1 แปลว่าผลติดลบ เกิดได้เฉพาะตอน exponent เท่ากัน',
  },
  negate: {
    what: 'ถ้าลบแล้วติดลบ กลับบิตแล้วบวก 1 ให้ได้ขนาดของผล (Control กลับ sign ให้)',
    how: ["T' = bigNeg ? (~T + 1) : T", "Z[24:0] = T'[27:3],  {G2, R2, S2} = T'[2:0]"],
    inputs: [
      { name: 'T[27:0]', bits: 28, peer: 'Big ALU', wire: 'alu-negate' },
      { name: 'bigNeg', bits: 1, peer: 'Big ALU' },
    ],
    outputs: [{ name: 'Z, G2 R2 S2', bits: 28, peer: 'Normalize', wire: 'negate-norm' }],
  },
  normalize: {
    what: 'หาบิต 1 ตัวแรก แล้วเลื่อนให้อยู่ในรูป 1.xxx พร้อมบอก Inc/Dec ว่าเลื่อนไปทางไหนกี่ตำแหน่ง',
    how: [
      'Z[24] = 1 (ได้ 10.xxx) → เลื่อนขวา 1: dir = 1, cnt = 1',
      'Z[23] = 1 → ไม่เลื่อน: cnt = 0',
      'อื่น ๆ → เลื่อนซ้าย n: dir = 0, cnt = n',
      'n = จำนวน 0 นำหน้า หาด้วย priority encoder',
    ],
    inputs: [{ name: 'Z, G2 R2 S2', bits: 28, peer: 'Negate if bigNeg', wire: 'negate-norm' }],
    outputs: [
      { name: 'M[23:0], G3 R3 S3', bits: 27, peer: 'Round', wire: 'norm-round' },
      { name: 'dir, cnt', bits: 6, peer: 'Inc / Dec', wire: 'norm-incdec' },
    ],
    note: 'เลื่อนซ้ายหลายตำแหน่งเกิดเฉพาะตอนลบเลขที่ใกล้กันมาก',
  },
  incdec: {
    what: 'ปรับ exponent ของตัวใหญ่ตามที่ Normalize เลื่อน และบวก 1 ถ้า Round ปัดแล้วล้น',
    how: ['E = (dir ? E0 + cnt : E0 − cnt) + ovf'],
    inputs: [
      { name: 'E0[7:0]', bits: 8, peer: 'MUX exp', wire: 'exp-incdec' },
      { name: 'dir, cnt', bits: 6, peer: 'Normalize', wire: 'norm-incdec' },
      { name: 'ovf', bits: 1, peer: 'Round', wire: 'round-ovf' },
    ],
    outputs: [{ name: 'E[7:0]', bits: 8, peer: 'exponent ของผลลัพธ์', wire: 'incdec-out' }],
    note: 'เลื่อน significand ไปขวา ค่าใหญ่ขึ้น exponent จึงเพิ่ม · เลื่อนซ้าย exponent ลด',
  },
  round: {
    what: 'ดู G R S ตัดสินว่าจะบวก 1 ที่บิตสุดท้ายไหม (round to nearest even) แล้วตัด 1 ที่ซ่อนทิ้ง',
    how: ['up = G3 AND (R3 OR S3 OR M[0])', '{ovf, M2} = M + up', 'F = M2[22:0]'],
    inputs: [{ name: 'M, G3 R3 S3', bits: 27, peer: 'Normalize', wire: 'norm-round' }],
    outputs: [
      { name: 'F[22:0]', bits: 23, peer: 'fraction ของผลลัพธ์', wire: 'round-out' },
      { name: 'ovf', bits: 1, peer: 'Inc / Dec', wire: 'round-ovf' },
    ],
    note: 'G3 = 1, R3 = S3 = 0 คือพอดีครึ่ง ปัดขึ้นเฉพาะเมื่อ M[0] = 1 ให้บิตสุดท้ายเป็น 0 · ovf = 1 เมื่อ M เป็น 1 ล้วนแล้วได้ 10.000… จึงให้ Inc/Dec เพิ่ม exponent',
  },
  regR: {
    what: 'ผลลัพธ์ 32 บิต ประกอบจาก 3 ส่วนที่มาคนละทาง',
    how: ['ผล = {signR, E[7:0], F[22:0]}'],
    inputs: [
      { name: 'signR', bits: 1, peer: 'Control', wire: 'ctl-sign' },
      { name: 'E[7:0]', bits: 8, peer: 'Inc / Dec', wire: 'incdec-out' },
      { name: 'F[22:0]', bits: 23, peer: 'Round', wire: 'round-out' },
    ],
    outputs: [],
  },
};

/** Shown under every block's details. */
export const CIRCUIT_SCOPE =
  'วงจรนี้รองรับเลขปกติ ส่วน 0, subnormal, ∞, NaN และ exponent ล้นต้องมีวงจรตรวจเพิ่ม';
