import Link from 'next/link';
import { Glass } from '@/components/glass/glass';
import { NOT_FOUND } from '@/content/lesson/copy';

export default function NotFound() {
  return (
    <div
      className="mx-auto flex max-w-md flex-col justify-center gap-5 px-4 py-16"
      data-testid="not-found"
    >
      <Glass className="space-y-3 p-6">
        <p className="num font-mono text-sm text-primary">404</p>
        <h1 className="font-display text-2xl font-semibold">{NOT_FOUND.title}</h1>
        <p>{NOT_FOUND.body}</p>
        <Link href="/" className="btn h-11 min-h-11 btn-primary">
          {NOT_FOUND.home}
        </Link>
      </Glass>
    </div>
  );
}
