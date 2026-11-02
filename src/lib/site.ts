/**
 * Everything about the site that may change later lives here (docs/plans/stage1-floating-point.md 2.1).
 * Assumed values are marked with the question number in docs/QUESTIONS.md.
 */
export const site = {
  name: 'comkrub',
  tagline: 'บวก ลบ เลขทศนิยมในคอมพิวเตอร์ แบบเห็นทุกบิต',
  description:
    'สื่อการสอนวิชา Computer Architecture เรื่องการบวกและลบเลข Floating-Point (IEEE 754) เริ่มจากบวกเลขฐานสองไปจนถึงวงจรบวกเลขทศนิยม ดูเป็นภาพเคลื่อนไหวทีละขั้นและลองใส่ตัวเลขเองได้',
  ogSubtitle: 'บวก ลบ Floating-Point · IEEE 754',
  course: 'Computer Architecture',
  /** Q4 answered: deployed on Pisit's own domain. */
  siteUrl: 'https://comkrub.mypisit.com',
  /** Q8: the repo is still private, so no public link. */
  githubUrl: null as string | null,
  references: [
    'สไลด์ Computer Architecture: Arithmetic for Computers (w03c, w03c_mult), Tatpong Katanyukul, CoE KKU',
    'D. A. Patterson and J. L. Hennessy, Computer Organization and Design, 5th ed., หัวข้อ 3.2 และ 3.5',
    'IEEE Std 754-2019, IEEE Standard for Floating-Point Arithmetic',
  ],
  /** Q2 answered: members sorted by student ID; printed exactly as given. */
  authors: [
    { id: '673040127-5', name: 'นายพัชรวัฒน์ วิพัธครตระกูล' },
    { id: '673040128-3', name: 'นายพิสิษฐ์ ศรีชำนาจ' },
    { id: '673040136-4', name: 'นายเอกสิทธิ์ สุวรรณวงษ์' },
    { id: '673040386-1', name: 'นายณัฐิวุฒิ แสงสารพันธ์' },
  ],
  instructor: 'ผศ. ดร. จิระเดช พลสวัสดิ์',
} as const;
