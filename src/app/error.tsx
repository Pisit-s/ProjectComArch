'use client';

import { RotateCw } from 'lucide-react';
import Link from 'next/link';
import { Glass } from '@/components/glass/glass';
import { ERROR_PAGE } from '@/content/lesson/copy';

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
        <h1 className="font-display text-2xl font-semibold">{ERROR_PAGE.title}</h1>
        <p>{ERROR_PAGE.body}</p>
        {error.digest && <p className="num font-mono text-xs text-muted">ref: {error.digest}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            className="btn h-11 min-h-11 btn-primary"
            onClick={() => (retry ?? reset)?.()}
          >
            <RotateCw className="h-4 w-4" aria-hidden /> {ERROR_PAGE.retry}
          </button>
          <Link href="/" className="btn h-11 min-h-11 bg-white/80 btn-ghost ring-1 ring-line">
            {ERROR_PAGE.home}
          </Link>
        </div>
      </Glass>
    </div>
  );
}
