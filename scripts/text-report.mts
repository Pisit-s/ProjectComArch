/** Prints the text budget per chapter (PLAN.md 1.3). Run with `npm run text:report`. */
import { LIMITS, allBudgets } from '../src/content/lesson/budget';

const rows = allBudgets();
const pad = (s: string | number, n: number) => String(s).padStart(n);
console.log(
  '| # | id | title | hook | vocab | takeaway | other | quiz | total / ' + LIMITS.total + ' |',
);
console.log('|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(
    `| ${r.number} | ${r.id} | ${pad(r.title, 2)} | ${pad(r.hook, 2)} | ${pad(r.vocab, 3)} | ${pad(r.takeaway, 3)} | ${pad(r.other, 3)} | ${pad(r.quiz, 3)} | ${pad(r.total, 3)} |`,
  );
}
