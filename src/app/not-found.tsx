import Link from 'next/link';
import { Glass } from '@/components/glass/glass';
import { CHAPTERS } from '@/content/chapters';

export default function NotFound() {
  return (
    <div
      className="mx-auto flex max-w-md flex-col justify-center gap-5 px-4 py-16"
      data-testid="not-found"
    >
      <Glass className="space-y-3 p-6">
        <p className="num font-mono text-sm text-primary">404</p>
        <h1 className="font-display text-2xl font-semibold">ไม่พบหน้านี้</h1>
        <p>ลิงก์อาจพิมพ์ผิดหรือหน้าถูกย้ายไปแล้ว ลองเริ่มจากหน้าแรกหรือเลือกบทเรียนด้านล่าง</p>
        <Link href="/" className="btn h-11 min-h-11 btn-primary">
          กลับหน้าแรก
        </Link>
        <ul className="space-y-1 text-sm">
          {CHAPTERS.map((c) => (
            <li key={c.slug}>
              <Link href={c.href} className="link link-hover">
                บทที่ {c.number}: {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </Glass>
    </div>
  );
}
