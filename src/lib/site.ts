/**
 * Everything about the site that may change later lives here (docs/plans/stage1-floating-point.md 2.1).
 * Assumed values are marked with the question number in docs/QUESTIONS.md (stage 1)
 * or docs/progress/wp0-hub.md (stage 2).
 */
export const site = {
  name: 'comkrub',
  tagline: 'เรียน Computer Architecture แบบเห็นทุกขั้นตอน',
  description:
    'เว็บไซต์เพื่อการเรียนรู้และ Simulation วิชา Computer Architecture: การคูณและการหารแบบ MIPS, Floating-Point (IEEE 754) และ MIPS Simulator ทุกกระบวนการกดดูทีละขั้นได้เอง',
  ogSubtitle: 'Computer Architecture · เรียนรู้และ Simulation',
  course: 'Computer Architecture',
  /** Q4 answered: deployed on Pisit's own domain. */
  siteUrl: 'https://comkrub.mypisit.com',
  /** WP0-Q1: the repo is still private · put the URL back once it is public. */
  githubUrl: null as string | null,
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
