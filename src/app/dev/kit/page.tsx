import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { formatBitValue } from '@/components/bits/bit-format';
import { BitRow } from '@/components/bits/bit-row';
import { FIELD_STYLE, type FieldKind } from '@/components/bits/field-style';
import { SelfCheck } from '@/components/content/self-check';
import { TalkingPoints } from '@/components/content/talking-points';
import { HwAlu, HwControl, HwDiagram, HwRegister, HwWire } from '@/components/hw';
import { OpenInSim } from '@/components/topic/open-in-sim';
import { StatusBadge } from '@/components/topic/status-badge';
import { TopicCard } from '@/components/topic/topic-card';
import { TopicIcon } from '@/components/topic/topic-icon';
import { TOPICS_IN_ORDER } from '@/content/topics';

export const metadata: Metadata = { title: 'Component kit', robots: { index: false } };

// Sample values for the demos below. They are computed here, never typed as bits.
const A = 13n;
const B = 11n;
const PRODUCT = A * B;
/** add $t0, $t1, $t2 assembled from its fields (R format). */
const ADD = (0n << 26n) | (9n << 21n) | (10n << 16n) | (8n << 11n) | (0n << 6n) | 0x20n;
const mipsField = (bit: number): FieldKind =>
  bit >= 26
    ? 'mips-op'
    : bit >= 21
      ? 'mips-rs'
      : bit >= 16
        ? 'mips-rt'
        : bit >= 11
          ? 'mips-rd'
          : bit >= 6
            ? 'mips-const'
            : 'mips-funct';

const NEW_KINDS: FieldKind[] = [
  'mips-op',
  'mips-rs',
  'mips-rt',
  'mips-rd',
  'mips-const',
  'mips-funct',
  'md-operand',
  'md-step',
  'md-acc',
  'md-alu',
  'md-test',
];

/**
 * Dev-only showcase of the shared building blocks (PLAN.md 6.2). Claude Code of every WP opens
 * it to see and screenshot the parts. Not built for production.
 */
export default function KitPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const [first, , , sim] = TOPICS_IN_ORDER;
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pt-6 pb-4 sm:pt-10">
      <header>
        <h1 className="font-display text-3xl font-semibold">Component kit</h1>
        <p className="mt-1 text-muted">
          ชิ้นส่วนร่วมของทุกหัวข้อ (PLAN.md 6.2) · หน้านี้มีเฉพาะตอน dev
        </p>
      </header>

      <Block title="TopicIcon · StatusBadge" file="src/components/topic/">
        <div className="flex flex-wrap items-center gap-4">
          {TOPICS_IN_ORDER.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-2 text-sm">
              <TopicIcon name={t.icon} className="h-6 w-6 text-primary" />
              {t.short}
            </span>
          ))}
          <StatusBadge status="ready" />
          <StatusBadge status="coming-soon" />
        </div>
      </Block>

      <Block title="TopicCard (ปกติ / กว้าง)" file="src/components/topic/topic-card.tsx">
        <div className="grid gap-4 lg:grid-cols-3">
          <TopicCard topic={first} />
          <div className="lg:col-span-2">
            <TopicCard topic={sim} wide />
          </div>
        </div>
      </Block>

      <Block title="สี FieldKind ใหม่ (PLAN.md 6.1)" file="src/components/bits/field-style.ts">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {NEW_KINDS.map((k) => (
            <li key={k} className="flex items-center gap-2 text-sm">
              <span className={`h-4 w-4 rounded ${FIELD_STYLE[k].chip}`} aria-hidden />
              <code className="text-xs">{k}</code>
              <span className={FIELD_STYLE[k].text}>{FIELD_STYLE[k].label}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="BitRow" file="src/components/bits/bit-row.tsx">
        <div className="space-y-5">
          <BitRow
            label="Multiplicand (4 บิต)"
            value={A}
            width={4}
            kind="md-operand"
            showValue="unsigned"
          />
          <BitRow
            label="Product (8 บิต: ครึ่งซ้าย | ครึ่งขวา)"
            value={PRODUCT}
            width={8}
            kind={Array.from({ length: 8 }, (_, i) => (i >= 4 ? 'md-acc' : 'md-step'))}
            split
            changed={[7, 6]}
            extraBit={{ value: 1, label: 'carry' }}
            showValue="unsigned"
          />
          <BitRow
            label="ค่าเดียวกันอ่านแบบมีเครื่องหมาย"
            value={PRODUCT}
            width={8}
            group={4}
            showValue="signed"
          />
          <BitRow
            label="add $t0, $t1, $t2 (R format)"
            value={ADD}
            width={32}
            kind={Array.from({ length: 32 }, (_, i) => mipsField(i))}
            group={4}
            size="xs"
            showValue="hex"
          />
        </div>
      </Block>

      <Block title="ชุด SVG ฮาร์ดแวร์" file="src/components/hw/">
        <HwDiagram
          width={640}
          height={300}
          label="ตัวอย่างการวางชิ้นส่วนฮาร์ดแวร์การคูณ"
          minWidth={520}
        >
          <HwRegister
            x={40}
            y={30}
            w={220}
            name="Multiplicand"
            bits={8}
            value={formatBitValue(A, 8, 'hex')}
            shift="left"
            role="md-operand"
            active
          />
          <HwAlu x={90} y={130} w={130} label="8-bit ALU" op="+" active />
          <HwRegister
            x={40}
            y={230}
            w={220}
            name="Product"
            bits={8}
            value={formatBitValue(PRODUCT, 8, 'hex')}
            shift="right"
            role="md-acc"
          />
          <HwRegister
            x={400}
            y={30}
            w={200}
            name="Multiplier"
            bits={4}
            value={formatBitValue(B, 4, 'hex')}
            shift="right"
            role="md-step"
          />
          <HwControl x={430} y={150} w={140} detail="Multiplier0 = 1" active />
          <HwWire
            points={[
              [150, 86],
              [150, 128],
            ]}
            active
            width={8}
          />
          <HwWire
            points={[
              [155, 200],
              [155, 228],
            ]}
            active
          />
          <HwWire
            points={[
              [500, 86],
              [500, 148],
            ]}
            label="บิตขวาสุด"
          />
          <HwWire
            points={[
              [430, 175],
              [300, 175],
              [300, 242],
              [262, 242],
            ]}
            label="write"
          />
        </HwDiagram>
      </Block>

      <TalkingPoints
        points={[
          'ประเด็นที่ 1 ที่คนนำเสนอพูดได้ทันที',
          'ประเด็นที่ 2',
          'ประเด็นที่ 3',
          'ประเด็นที่ 4',
        ]}
      />
      <SelfCheck
        items={[
          { q: 'คำถามข้อที่ 1', a: 'เฉลยข้อที่ 1' },
          { q: 'คำถามข้อที่ 2', a: 'เฉลยข้อที่ 2' },
          { q: 'คำถามข้อที่ 3', a: 'เฉลยข้อที่ 3' },
        ]}
      />

      <Block title="OpenInSim" file="src/components/topic/open-in-sim.tsx">
        <OpenInSim example="shift-add-multiply" />
      </Block>

      <Block
        title="LessonLayout · Section · Summary"
        file="src/components/layout/lesson-layout.tsx"
      >
        <p className="text-sm text-ink/80">
          ดูของจริงได้ที่บทของ Floating-Point (`ChapterLayout` เรียก `LessonLayout`)
          หน้าหัวข้อใหม่ใช้ `LessonLayout` ตรง ๆ แล้วใส่ `Section`, `Summary`, `TalkingPoints`,
          `SelfCheck` ข้างใน
        </p>
      </Block>
    </div>
  );
}

function Block({ title, file, children }: { title: string; file: string; children: ReactNode }) {
  return (
    <section className="glass rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mb-4 font-mono text-xs text-muted">{file}</p>
      {children}
    </section>
  );
}
