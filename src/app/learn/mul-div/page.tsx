import { ChapterLayout, Summary } from '@/components/layout/chapter-layout';

export default function Page() {
  return (
    <ChapterLayout slug="mul-div" toc={[]}>
      <Summary points={['TODO']} />
    </ChapterLayout>
  );
}
