import type { GlossaryEntry } from './types';

/**
 * Terms shared by integer multiply, divide and the MIPS Simulator (PLAN.md 6.3). Keys start
 * with `md` where the Floating-Point glossary already uses a similar word.
 */
export const ARITH_GLOSSARY = {
  mdMultiplicand: {
    term: 'Multiplicand',
    meaning: 'ตัวตั้งของการคูณ คือค่าที่ถูกบวกเข้าไปใน Product ทุกครั้งที่บิตของ Multiplier เป็น 1',
  },
  mdMultiplier: {
    term: 'Multiplier',
    meaning: 'ตัวคูณ ฮาร์ดแวร์อ่านทีละบิตจากขวาไปซ้ายเพื่อตัดสินว่ารอบนั้นต้องบวกหรือไม่',
  },
  mdProduct: {
    term: 'Product',
    meaning: 'ผลคูณ ถ้าตัวตั้งและตัวคูณยาว n บิต ผลคูณต้องมีที่ 2n บิตจึงจะไม่ล้น',
  },
  mdPartialProduct: {
    term: 'Partial product',
    meaning: 'ผลคูณย่อยของแต่ละบิตของ Multiplier คือ Multiplicand ที่ shift แล้ว หรือ 0',
  },
  mdDividend: { term: 'Dividend', meaning: 'ตัวตั้งของการหาร คือค่าที่ถูกแบ่ง' },
  mdDivisor: { term: 'Divisor', meaning: 'ตัวหาร คือค่าที่ถูกลบออกจาก Remainder ในแต่ละรอบ' },
  mdQuotient: {
    term: 'Quotient',
    meaning: 'ผลหาร ฮาร์ดแวร์สร้างทีละบิต รอบที่ลบได้ใส่ 1 รอบที่ลบไม่ได้ใส่ 0',
  },
  mdRemainder: {
    term: 'Remainder',
    meaning: 'เศษที่เหลือจากการหาร มีค่าน้อยกว่า Divisor เสมอ',
  },
  restoringDivision: {
    term: 'Restoring division',
    meaning: 'การหารที่ลองลบ Divisor ก่อน ถ้าผลติดลบก็บวกกลับคืน (restore) แล้วใส่บิตผลหารเป็น 0',
  },
  alu: {
    term: 'ALU (Arithmetic Logic Unit)',
    meaning: 'วงจรที่บวก ลบ และทำ AND / OR ของสองค่า ในการคูณและหารใช้บวกหรือลบทีละรอบ',
  },
  shift: {
    term: 'Shift left / right',
    meaning:
      'เลื่อนบิตทั้งหมดไปทางซ้ายหรือขวา shift ซ้าย 1 ครั้งเท่ากับคูณ 2 shift ขวาเท่ากับหาร 2',
  },
  logicalShift: {
    term: 'Logical shift',
    meaning: 'shift ที่เติม 0 เข้าทางด้านที่ว่าง ใช้กับเลขไม่มีเครื่องหมาย',
  },
  arithmeticShift: {
    term: 'Arithmetic shift',
    meaning: 'shift ขวาที่เติมบิตเครื่องหมายเดิมเข้าทางซ้าย เพื่อให้เลขลบยังเป็นลบ',
  },
  signExtension: {
    term: 'Sign extension',
    meaning: 'ขยายเลขให้ยาวขึ้นโดยเติมบิตเครื่องหมายทางซ้าย ค่าเดิมไม่เปลี่ยนทั้งเลขบวกและลบ',
  },
  zeroExtension: {
    term: 'Zero extension',
    meaning: 'ขยายเลขให้ยาวขึ้นโดยเติม 0 ทางซ้าย ใช้กับค่าที่ไม่มีเครื่องหมาย',
  },
  twosComplement: {
    term: "Two's complement",
    meaning:
      'วิธีเก็บเลขมีเครื่องหมายที่ใช้กันทั่วไป บิตซ้ายสุดมีน้ำหนักติดลบ และหาค่าลบได้ด้วยการกลับบิตแล้วบวก 1',
  },
  intOverflow: {
    term: 'Overflow (จำนวนเต็ม)',
    meaning: 'ผลลัพธ์ใหญ่หรือเล็กเกินกว่าที่ register เก็บได้ บิตที่เกินหายไปทำให้ค่าผิด',
  },
  register: {
    term: 'Register',
    meaning: 'ที่เก็บข้อมูลขนาดเล็กในหน่วยประมวลผล MIPS มี register ทั่วไป 32 ตัว ตัวละ 32 บิต',
  },
  hi: {
    term: 'HI',
    meaning: 'register พิเศษของ MIPS: หลัง mult เก็บผลคูณ 32 บิตบน หลัง div เก็บเศษ',
  },
  lo: {
    term: 'LO',
    meaning: 'register พิเศษของ MIPS: หลัง mult เก็บผลคูณ 32 บิตล่าง หลัง div เก็บผลหาร',
  },
  opcode: {
    term: 'Opcode',
    meaning: '6 บิตซ้ายสุดของคำสั่ง MIPS บอกว่าเป็นคำสั่งอะไรหรืออยู่ในกลุ่มไหน',
  },
  funct: {
    term: 'funct',
    meaning: '6 บิตขวาสุดของคำสั่งแบบ R format ใช้แยกคำสั่งที่มี opcode เดียวกัน',
  },
  immediate: {
    term: 'Immediate',
    meaning: 'ค่าคงที่ 16 บิตที่อยู่ในตัวคำสั่งแบบ I format',
  },
  formatRIJ: {
    term: 'R / I / J format',
    meaning:
      'รูปแบบคำสั่ง MIPS 3 แบบ: R ใช้ register ล้วน, I มีค่าคงที่ 16 บิต, J มี address 26 บิตสำหรับกระโดด',
  },
  pseudoInstruction: {
    term: 'Pseudo-instruction',
    meaning:
      'คำสั่งที่ assembler รับได้แต่เครื่องไม่มีจริง assembler แปลงเป็นคำสั่งจริง 1 คำสั่งขึ้นไป',
  },
} as const satisfies Record<string, GlossaryEntry>;
