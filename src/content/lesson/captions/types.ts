import type { CaptionKey, Params } from '@/lib/lesson/keys';

export type CaptionFn = (p: Params) => string;
export type CaptionTable = Partial<Record<CaptionKey, CaptionFn>>;
