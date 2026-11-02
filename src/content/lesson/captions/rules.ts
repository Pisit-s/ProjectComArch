import type { SpecialRule } from '@/lib/fp';

/** One short line per special case the engine can report (add / sub and encode only). */
export const SPECIAL_RULES: Partial<Record<SpecialRule, string>> = {
  'zero-input': 'ศูนย์มีรูปแบบพิเศษ: Exponent และ Significand เป็น 0 ทั้งหมด',
  'inf-input': '∞ คือ Exponent = 255 และ Significand = 0',
  'nan-input': 'NaN คือ Exponent = 255 และ Significand ไม่เป็น 0',
  'nan-operand': 'มี NaN อยู่ ผลเป็น NaN เสมอ',
  'inf-minus-inf': '∞ − ∞ ไม่มีความหมาย ผลเป็น NaN',
  'inf-operand': 'บวก/ลบกับ ∞ ได้ ∞ ตัวเดิม',
  'zero-plus-zero': '0 + 0: ได้ −0 เฉพาะเมื่อทั้งคู่เป็น −0',
  'add-zero': 'บวกกับ 0 ได้ค่าเดิมทันที',
};
