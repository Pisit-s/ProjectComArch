# ไฟล์ธีมอ้างอิงจาก CoE-Shop (อ่านอย่างเดียว)

- copy มาจาก `/Users/pisit/Documents/Development/CoE-Shop` (commit `55429c0`, 14 ต.ค. 2569) เมื่อ 30 ต.ค. 2569 ตอนเขียน `PLAN.md`
- ทุกไฟล์ต่อท้ายด้วย `.txt` เพื่อไม่ให้ TypeScript / ESLint / Vitest / Prettier หยิบไปรัน — ห้าม import ไฟล์ในนี้ตรง ๆ ให้ port เข้า `src/` ตาม `PLAN.md` หัวข้อ 9.2
- ห้ามแก้ไฟล์ในโฟลเดอร์นี้ และห้ามแก้ repo CoE-Shop ต้นทาง (เป็นเว็บที่ใช้งานจริง)
- CoE-Shop ใช้ shadcn/ui และ token แบบ shadcn (`--primary`, `--card`, `--foreground`) ส่วนโปรเจกต์นี้ใช้ daisyUI 5 — วิธี map อยู่ใน `PLAN.md` หัวข้อ 9.2–9.3

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `src/app/globals.css.txt` | token สี + class กระจกทั้งหมด (`.glass`, `.glass-raised`, `.glass-solid`, `.glass-interactive`), blueprint grid, animation (`tb-rise`, `tb-pop`, `tb-glow`), BeamRing, fallback สำหรับจอสัมผัส / reduced transparency / reduced motion |
| `src/components/glass/*.tsx.txt` | `Glass`, `GlassPill`, `GlassPointer`, `LiquidBackground`, `BeamRing` |
| `src/components/ui/blur-fade.tsx.txt`, `animated-shiny-text.tsx.txt` | component สไตล์ Magic UI ที่ปรับให้เร็วบน iPhone แล้ว |
| `src/components/providers/motion-provider.tsx.txt` | `MotionConfig reducedMotion="user"` |
| `src/app/layout.tsx.txt` | การโหลดฟอนต์ Chakra Petch / IBM Plex Sans Thai / JetBrains Mono ด้วย `next/font/google` + `viewport` |
| `src/components/shop/navbar.tsx.txt` | แถบเมนูกระจกทรงแคปซูล (มือถือใช้พื้นทึบขึ้น) |
| `src/components/shop/animated-baht.tsx.txt` | ตัวอย่างตัวเลขที่ค่อย ๆ นับไปค่าใหม่ + reduced motion |
| `src/components/brand/icon-art.tsx.txt` | `next/og` + โหลดฟอนต์จาก `@fontsource/chakra-petch` (ใช้ทำ icon / OG image) |
| `src/lib/utils.ts.txt`, `src/lib/use-media-query.ts.txt` | helper |
| `src/app/not-found.tsx.txt`, `src/app/error.tsx.txt` | หน้า 404 / error ตามธีม (เขียนข้อความใหม่) |
| `scripts/shot.mts.txt`, `playwright.config.ts.txt`, `vitest.config.mts.txt`, `eslint.config.mjs.txt`, `.prettierrc.json.txt`, `postcss.config.mjs.txt` | config ที่ใช้งานได้จริงกับ Next.js 16 + Tailwind v4 (ตัดส่วน DB/auth ออกตอน port) |
