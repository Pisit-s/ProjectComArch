import { ChapterLayout, Summary } from '@/components/layout/chapter-layout';

export default function Page() {
  return (
    <ChapterLayout slug="add-sub" toc={[]}>
      <Summary points={['TODO']} />
    </ChapterLayout>
  );
}
