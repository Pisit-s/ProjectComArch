import type { CaptionKey, DetailKey, Params } from '@/lib/lesson/keys';
import { CH1 } from './ch1';
import { CH2 } from './ch2';
import { CH3 } from './ch3';
import { CH4 } from './ch4';
import { CH5 } from './ch5';
import { CH6 } from './ch6';
import type { CaptionFn } from './types';

export const CAPTIONS: Partial<Record<CaptionKey, CaptionFn>> = {
  ...CH1,
  ...CH2,
  ...CH3,
  ...CH4,
  ...CH5,
  ...CH6,
};

/** Caption text of a frame (PLAN.md C.5). */
export function caption(key: CaptionKey, params: Params = {}): string {
  const fn = CAPTIONS[key];
  if (!fn) throw new Error(`missing caption ${key}`);
  return fn(params);
}

/** Text behind the "ทำไม?" button (PLAN.md C.6). */
export const DETAILS: Record<DetailKey, string> = {
  'why.c.overflow':
    'ภาษา C ไม่ตรวจ overflow ของ int ผลที่เกินช่วงจะวนกลับเงียบ ๆ (สไลด์ w03c หน้า 12)',
  'why.align': 'เลื่อนขวา 1 ตำแหน่งคือหาร 2 จึงต้องบวก exponent 1 ชดเชย ค่ารวมเลยเท่าเดิม',
  'why.bigFirst':
    'เลื่อนตัวเล็กไปหาตัวใหญ่ บิตที่หลุดเป็นบิตค่าน้อยที่สุด ถ้าเลื่อนตัวใหญ่จะเสียบิตสำคัญ',
  'why.grs': 'ฮาร์ดแวร์เก็บบิตที่หลุดไว้แค่ 3 บิต G R S ก็พอให้ปัดได้ผลเหมือนคำนวณแบบไม่จำกัดบิต',
  'why.even':
    'ถ้าเจอกึ่งกลางแล้วปัดขึ้นทุกครั้ง ผลรวมจำนวนมากจะเอียงขึ้น เลือกเลขคู่ทำให้ขึ้นลงพอ ๆ กัน',
  'why.cycles':
    'วงจรนี้ซับซ้อนกว่า adder จำนวนเต็มมาก ฮาร์ดแวร์จริงจึงใช้หลาย clock cycle และทำแบบ pipeline ได้',
};

export const detail = (key: DetailKey): string => DETAILS[key];
