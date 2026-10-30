'use client';

import { Register } from '@/components/bits/register';
import { Num, Pow } from '@/components/ui/num';
import { CLASS_TEXT } from '@/content/step-text';
import { fmt as fmtR } from '@/lib/display';
import { type FloatFormat, type Op, type Step, type StepOf, BINARY32, emin } from '@/lib/fp';
import {
  AlignView,
  LongDivisionView,
  NormalizeView,
  PartialProductsView,
  SigAddView,
} from './arith-views';
import {
  BiasView,
  ClassifyView,
  FieldsView,
  FinalEncodeView,
  FracBinaryView,
  IntBinaryView,
  PointView,
  SignInputView,
  SignificandView,
  ValueView,
} from './repr-views';
import {
  Box,
  ExponentCalc,
  Explain,
  RangeGauge,
  RoundGRS,
  SigLine,
  SignXor,
  SpecialCase,
} from './step-parts';

type Ctx = { fmt?: FloatFormat; op?: Op; bits?: bigint };

/** Renders one engine step. Each step draws its own complete state (going back needs no replay). */
export function StepView({ step, fmt = BINARY32, op, bits }: { step: Step } & Ctx) {
  const opKind = op === '*' ? 'mul' : op === '/' ? 'div' : 'add';
  switch (step.kind) {
    case 'decode':
      return <DecodeOperandView step={step} fmt={fmt} op={op} />;
    case 'negate':
      return (
        <div className="space-y-3">
          <Register bits={step.after} fmt={fmt} label="−B" highlight={{ sign: true }} name="negB" />
          <Explain>
            <p>A − B คือ A + (−B) จึงกลับ Sign bit ของ B แล้วทำแบบการบวกทุกขั้น</p>
          </Explain>
        </div>
      );
    case 'special':
      return <SpecialCase step={step} />;
    case 'sign':
      return step.rule === 'xor' ? (
        <div className="space-y-3">
          <SignXor step={step} />
          <Explain>
            <p>คูณและหาร: Sign ของผลหาได้ด้วย XOR เสมอ เครื่องหมายเหมือนกันได้บวก ต่างกันได้ลบ</p>
          </Explain>
        </div>
      ) : (
        <SignInputView step={step} />
      );
    case 'exponent':
      if (step.mode === 'compare') return <CompareView step={step} />;
      if (step.mode === 'add-bias' || step.mode === 'sub-bias') {
        return (
          <div className="space-y-3">
            <ExponentCalc step={step} fmt={fmt} />
            <Explain>
              {step.mode === 'add-bias' ? (
                <p>
                  Biased exponent แต่ละตัวมี +127 อยู่แล้ว ถ้าบวกกันตรง ๆ จะได้ Bias ซ้ำ 2 ครั้ง
                  จึงต้องลบ 127 ออกหนึ่งครั้ง
                </p>
              ) : (
                <p>
                  ลบ Biased exponent สองตัวแล้ว Bias หักล้างกันหายไปหมด จึงต้องบวก 127
                  กลับหนึ่งครั้ง
                </p>
              )}
            </Explain>
          </div>
        );
      }
      return <BiasView step={step} fmt={fmt} />;
    case 'align':
      return <AlignView step={step} fmt={fmt} />;
    case 'sig-add':
      return <SigAddView step={step} fmt={fmt} />;
    case 'sig-mul':
      return <PartialProductsView step={step} />;
    case 'sig-div':
      return <LongDivisionView step={step} />;
    case 'normalize':
      return <NormalizeView step={step} op={opKind} />;
    case 'range':
      return <RangeGauge step={step} />;
    case 'round':
      return <RoundGRS step={step} fmt={fmt} />;
    case 'encode':
      return <FinalEncodeView step={step} fmt={fmt} />;
    case 'int-binary':
      return <IntBinaryView step={step} />;
    case 'frac-binary':
      return <FracBinaryView step={step} />;
    case 'point':
      return <PointView step={step} fmt={fmt} />;
    case 'fields':
      return <FieldsView step={step} fmt={fmt} />;
    case 'classify':
      return <ClassifyView step={step} />;
    case 'significand':
      return <SignificandView step={step} />;
    case 'value':
      return <ValueView step={step} fmt={fmt} bits={bits ?? 0n} />;
  }
}

function DecodeOperandView({
  step,
  fmt,
  op,
}: {
  step: StepOf<'decode'>;
  fmt: FloatFormat;
  op?: Op;
}) {
  const finite = step.cls === 'normal' || step.cls === 'subnormal';
  return (
    <div className="space-y-3">
      <Register
        bits={step.bits}
        fmt={fmt}
        label={`ตัวถูกดำเนินการ ${step.operand}`}
        name={`op-${step.operand}`}
      />
      <Box className="space-y-1 text-sm">
        <p>
          ประเภท: <b>{CLASS_TEXT[step.cls]}</b> · ค่าที่เก็บจริง:{' '}
          {step.value ? <Num value={fmtR(step.value, 30)} /> : <b>{CLASS_TEXT[step.cls]}</b>}
        </p>
        {finite && (
          <>
            <p>
              Sign = <b className="num font-mono">{step.fields.sign}</b> · Biased exponent ={' '}
              <b className="num font-mono">{step.exponent}</b> (Exponent จริง {step.exponent - 127})
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2">
              Significand ={' '}
              <SigLine
                sig={step.significand}
                fracBits={fmt.fracBits}
                hidden={step.cls === 'normal' || step.normalizeShift > 0}
                trim
              />
            </p>
          </>
        )}
      </Box>
      {step.cls === 'subnormal' && (
        <Explain>
          {step.normalizeShift > 0 ? (
            <p>
              เป็น Subnormal (ไม่มี hidden bit) ก่อน{op === '*' ? 'คูณ' : 'หาร'}จึงเลื่อนซ้าย{' '}
              {step.normalizeShift} บิตให้ได้รูป 1.xxx และลด Exponent ตาม (ต่ำกว่า{' '}
              <Pow exp={emin(fmt)} /> ได้ระหว่างคำนวณ)
            </p>
          ) : (
            <p>
              เป็น Subnormal: hidden bit = 0 และใช้ Exponent −126 (Biased exponent 1) ในการคำนวณ
            </p>
          )}
        </Explain>
      )}
    </div>
  );
}

function CompareView({ step }: { step: StepOf<'exponent'> }) {
  const bigger = step.swapped ? 'B' : 'A';
  const smaller = step.swapped ? 'A' : 'B';
  return (
    <div className="space-y-3">
      <Box className="num space-y-1 font-mono text-sm">
        <p>
          EA = {step.ea} · EB = {step.eb}
        </p>
        <p className="font-bold">ต่างกัน d = {step.diff}</p>
      </Box>
      <Explain>
        <p>
          บวกเลขที่ Exponent ไม่เท่ากันตรง ๆ ไม่ได้ (เหมือนบวก 1.5 × 10³ กับ 2.0 × 10¹ ต้องทำให้เป็น
          ×10³ ก่อน) จึงใช้ Exponent ของตัวที่ใหญ่กว่า ({bigger}) แล้วเลื่อน Significand ของ{' '}
          {smaller} ไปทางขวา {step.diff} บิต
        </p>
        {step.swapped && <p>|B| ใหญ่กว่า |A| จึงสลับให้ตัวใหญ่อยู่ข้างบนก่อน</p>}
      </Explain>
    </div>
  );
}
