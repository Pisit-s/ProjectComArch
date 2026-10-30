'use client';

import { RotateCw } from 'lucide-react';
import Link from 'next/link';
import { Glass } from '@/components/glass/glass';

export default function ErrorPage({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  return (
    <div
      className="mx-auto flex max-w-md flex-col justify-center gap-5 px-4 py-16"
      data-testid="error-page"
    >
      <Glass className="space-y-3 p-6">
        <h1 className="font-display text-2xl font-semibold">หน้านี้มีปัญหา</h1>
        <p>เกิดข้อผิดพลาดระหว่างแสดงหน้า ลองโหลดใหม่อีกครั้ง ถ้ายังไม่หายให้กลับไปหน้าแรก</p>
        {error.digest && <p className="num font-mono text-xs text-muted">ref: {error.digest}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            className="btn h-11 min-h-11 btn-primary"
            onClick={() => (retry ?? reset)?.()}
          >
            <RotateCw className="h-4 w-4" aria-hidden /> ลองอีกครั้ง
          </button>
          <Link href="/" className="btn h-11 min-h-11 bg-white/80 btn-ghost ring-1 ring-line">
            กลับหน้าแรก
          </Link>
        </div>
      </Glass>
    </div>
  );
}
