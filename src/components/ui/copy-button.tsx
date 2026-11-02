'use client';

import { Check, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { UI } from '@/content/lesson/copy';
import { cn } from '@/lib/utils';

/** Copies the current page URL (share link). */
export function CopyLinkButton({ className }: { className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={cn('btn h-11 min-h-11 btn-primary', className)}
      data-testid="copy-link"
      onClick={async () => {
        const url = window.location.href;
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // clipboard blocked (e.g. insecure context): fall back to a prompt the user can copy from
          window.prompt(UI.copyLink, url);
        }
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <LinkIcon className="h-4 w-4" aria-hidden />
      )}
      <span aria-live="polite">{done ? UI.copied : UI.copyLink}</span>
    </button>
  );
}
