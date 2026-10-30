# Stack และ version ที่ติดตั้งจริง

ติดตั้งเมื่อ 30 ต.ค. 2569 ด้วย `@latest` (ยกเว้น 3 ตัวด้านล่าง) · Node ในเครื่อง 26.11.1 · npm 11.20.0 · Vercel ใช้ Node 24.x (`"engines": { "node": ">=24" }`)

| package | version จริง | หมายเหตุ |
|---|---|---|
| next / eslint-config-next | 16.4.3 | App Router, Turbopack, `typedRoutes: true` |
| react / react-dom | 19.3.1 | |
| typescript | 6.0.3 | **ข้อยกเว้น**: latest คือ 7.0.2 แต่ `typescript-eslint` 8.72.1 รองรับ `>=4.8.4 <6.1.0` (ตรวจด้วย `npm view typescript-eslint peerDependencies` วันที่ติดตั้ง) |
| eslint | 9.39.5 | **ข้อยกเว้น**: latest คือ 10.13.0 แต่ `eslint-plugin-react` 7.37.5 รองรับถึง `^9.7` |
| @types/node | 24.19.2 | **ข้อยกเว้น**: ให้ตรงกับ Node 24 บน Vercel (latest คือ 26.6.6) |
| tailwindcss | 4.3.3 | ตั้งค่าใน CSS ไม่มี tailwind.config |
| @tailwindcss/turbopack | 4.3.3 | **ต่างจากแผน**: แผนเขียนว่าใช้ `@tailwindcss/postcss` แต่ create-next-app 16.4.3 สร้างโปรเจกต์ด้วย loader `@tailwindcss/turbopack` (ตั้งใน `next.config.ts` → `turbopack.rules`) ซึ่งเป็นตัวเชื่อมแบบใหม่ที่เร็วกว่า PostCSS (Context7: Tailwind v4.3 blog) จึงใช้ตามค่าเริ่มต้นของ scaffold และไม่มี `postcss.config.mjs` |
| daisyui | 5.7.50 | `@plugin "daisyui"` ใน globals.css |
| motion | 14.8.0 | import จาก `motion/react` |
| lucide-react | 1.64.0 | |
| clsx / tailwind-merge | 2.1.1 / 3.7.0 | `cn()` |
| vitest / @vitest/coverage-v8 | 5.0.5 | |
| vite | 8.3.5 | peer ของ vitest |
| fast-check | 4.10.2 | |
| @playwright/test | 1.64.1 | chromium + webkit |
| @axe-core/playwright | 4.14.0 | |
| prettier / prettier-plugin-tailwindcss | 3.9.10 / 0.8.1 | |
| tsx | 4.23.15 | รัน `scripts/*.mts` |
| @fontsource/chakra-petch | 5.3.0 | ฟอนต์ไทยให้ `next/og` |
| @types/react / @types/react-dom | 19.3.0 | |
| @vercel/analytics | 2.0.1 | เพิ่มตามคำตอบ Q9 · โหลดเฉพาะ build บน Vercel (`process.env.VERCEL === '1'`) · `npm audit --omit=dev` หลังติดตั้ง: 0 vulnerabilities |

## npm audit
- `npm audit --omit=dev` (30 ต.ค. 2569): **found 0 vulnerabilities**

## หมายเหตุ
- npm 11 เตือนว่า install script ของ `esbuild` และ `unrs-resolver` ยังไม่ได้อนุมัติ (`allowScripts`) — ทั้งสองตัวใช้ binary จาก optional dependency ได้อยู่แล้ว (tsx/vitest/eslint รันได้ปกติ) จึงยังไม่อนุมัติ
