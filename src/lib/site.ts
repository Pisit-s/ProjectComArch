/**
 * Everything about the site that may change later lives here (docs/plans/stage1-floating-point.md 2.1).
 * Assumed values are marked with the question number in docs/QUESTIONS.md.
 */
export const site = {
  name: 'Binary Lab',
  tagline: 'เข้าใจ Floating-Point ทีละบิต',
  description:
    'สื่อการสอนแบบ interactive เรื่องเลขฐานสองและ Floating-Point (IEEE 754 Single Precision) วิชา Computer Architecture: เลขฐานสอง เศษส่วนฐานสอง encode/decode บวก ลบ คูณ หาร ดูได้ทีละขั้น',
  ogSubtitle: 'สื่อการสอน Floating-Point · IEEE 754',
  course: 'Computer Architecture',
  /** Q4 answered: deployed on Pisit's own domain. */
  siteUrl: 'https://comkrub.mypisit.com',
  githubUrl: 'https://github.com/Pisit-s/ProjectComArch',
  references: [
    'IEEE Std 754-2019, IEEE Standard for Floating-Point Arithmetic',
    'D. A. Patterson and J. L. Hennessy, Computer Organization and Design',
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
