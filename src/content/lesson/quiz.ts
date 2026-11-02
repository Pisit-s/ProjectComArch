import { BINARY32, decode, encodeBits, splitFields, toHex } from '@/lib/fp';
import { addBits, toBits, toSigned } from '@/lib/int/adder';
import { sigText } from '@/lib/lesson/fp-frames';
import type { SectionId } from './sections';

/**
 * One check question per chapter (PLAN.md C.8). The first option is the answer; `order`
 * shuffles the display order deterministically. Bit / hex options come from the models.
 */
export interface Quiz {
  question: string;
  options: string[];
  order: number[];
  reason: string;
}

const F = BINARY32;

function binaryQuiz(): Quiz {
  const r = addBits(4, 0b0100, 0b0101);
  const bits = toBits(4, r.result);
  return {
    question: "0100 + 0101 แบบ 4 บิต two's complement ได้อะไร",
    options: [
      `${bits} = ${toSigned(4, r.result)} เกิด overflow`,
      `${bits} = ${r.result} ถูกต้อง`,
      '0001 มีตัวทดออก',
    ],
    order: [1, 0, 2],
    reason: 'บวก + บวก แล้วได้ลบ คือ overflow',
  };
}

function ieeeQuiz(): Quiz {
  const E = parseInt('10000010', 2);
  const e = E - 127;
  return {
    question: 'Exponent = 10000010₂ แปลว่าคูณด้วยเท่าไร',
    options: [`2^${e}`, `2^${E}`, `2^${e - 1}`],
    order: [2, 0, 1],
    reason: `${E} − 127 = ${e}`,
  };
}

function convertQuiz(): Quiz {
  const bits = encodeBits(F, '-0.75')!;
  const d = decode(F, bits);
  return {
    question: '−0.75 เก็บเป็น float ได้ hex อะไร',
    options: [
      toHex(bits, 32),
      toHex(encodeBits(F, '0.75')!, 32),
      toHex(encodeBits(F, '-0.5')!, 32),
    ],
    order: [1, 2, 0],
    reason: `s = ${splitFields(F, bits).sign}, Exponent = ${d.expField}, 1.significand = ${sigText(d.significand, F.fracBits)}₂`,
  };
}

export const QUIZ: Partial<Record<SectionId, Quiz>> = {
  binary: binaryQuiz(),
  'float-in-c': {
    question: 'ข้อไหนเป็น normalized',
    options: ['2.34 × 10⁵⁶', '0.002 × 10⁴', '987.02 × 10⁹'],
    order: [1, 2, 0],
    reason: 'หน้าจุดต้องมีเลขที่ไม่ใช่ 0 หลักเดียว',
  },
  ieee754: ieeeQuiz(),
  convert: convertQuiz(),
  'fp-add': {
    question: 'G = 1, R = 0, S = 0 และ LSB = 1 จะปัดยังไง',
    options: ['ปัดขึ้นให้ LSB เป็น 0', 'ปัดลง', 'ไม่ต้องปัด'],
    order: [2, 0, 1],
    reason: 'อยู่กึ่งกลางพอดี เลือกเลขคู่',
  },
  circuit: {
    question: 'กล่องไหนบอกว่าต้องเลื่อน significand กี่ตำแหน่ง',
    options: ['Small ALU', 'Big ALU', 'Rounding hardware'],
    order: [1, 0, 2],
    reason: 'Small ALU ลบ exponent สองตัว ได้จำนวนที่ต้องเลื่อน',
  },
};
