import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LAB } from '@/content/chapters';
import { Lab } from '@/components/tools/lab';

export const metadata: Metadata = {
  title: 'Lab',
  description:
    'เครื่องมือแปลงค่า IEEE 754 และคำนวณ + − × ÷ แบบ Single Precision ทีละขั้น พร้อมลิงก์แชร์ตัวอย่าง',
};

export default function LabPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-4 sm:pt-10">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Lab</h1>
      <p className="mt-2 max-w-[72ch] text-muted">
        {LAB.blurb} · ลิงก์ในแถบที่อยู่จะเปลี่ยนตามค่าที่พิมพ์และขั้นที่ดูอยู่ กด “คัดลอกลิงก์”
        แล้วส่งให้นักศึกษาเปิดได้เลย
      </p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-96 w-full skeleton rounded-2xl" />}>
          <Lab />
        </Suspense>
      </div>
    </div>
  );
}
