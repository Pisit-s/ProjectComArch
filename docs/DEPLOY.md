# คู่มือ deploy บน Vercel (Pisit ทำเอง)

เว็บนี้เป็น static ทั้งหมด ไม่ต้องตั้ง Environment Variables และไม่มี database

1. เข้า vercel.com → **Add New → Project** → Import `Pisit-s/ProjectComArch` (ให้สิทธิ์ GitHub ถ้าถูกถาม)
2. Framework Preset: **Next.js** (ตรวจเจอเอง) · Root Directory: `./` · Build Command / Install Command: ใช้ค่าเริ่มต้น · Node.js Version: **24.x** (ค่าเริ่มต้น)
3. ไม่ต้องตั้ง Environment Variables
4. กด **Deploy** → ได้ `https://<ชื่อโปรเจกต์>.vercel.app`
5. ทดสอบบนมือถือจริง (iPhone Safari + Android Chrome):
   - เปิดครบทุกบทจากเมนู และปุ่มบทก่อน/ถัดไป
   - ปุ่มของ StepPlayer (ย้อน, ถัดไป, เล่น, ความเร็ว, กดตัวเลขขั้น) และกดกล่อง flowchart
   - กดบิตในบทที่ 1–3 และแตะบิตใน register เพื่อดูคำอธิบาย
   - เปิด Reduce Motion (iOS: Settings → Accessibility → Motion) แล้วลองเปลี่ยนขั้น
   - เปิด share link ของ Lab จาก LINE
6. หลังต่อแล้ว ทุก push เข้า `main` = deploy production อัตโนมัติ · branch อื่น/PR = preview URL
7. ถ้าเปลี่ยนชื่อโปรเจกต์บน Vercel หรือต่อ domain เอง (เช่น `float.mypisit.com`: Settings → Domains → Add → ตั้ง CNAME ตามที่ Vercel บอก) ให้แก้ `siteUrl` ใน `src/lib/site.ts` ให้ตรง URL จริง (ใช้กับ OG image, sitemap, robots) แล้ว push (คำถาม Q4)

## เปิด Web Analytics (ทำครั้งเดียว)
โค้ดใส่ `<Analytics />` ไว้แล้ว (Q9) แต่ต้องเปิดที่ Vercel ก่อนถึงจะเริ่มนับ: Project → แท็บ **Analytics** → **Enable** → redeploy หนึ่งครั้ง (Deployments → ⋯ → Redeploy) · ดูจำนวนผู้เข้าชมได้ที่แท็บ Analytics (ข้อมูลไม่ระบุตัวตน ไม่ใช้ cookie)

## ตรวจก่อน deploy (ทำแล้วในเครื่อง)
- `npm run lint && npm run typecheck && npm test` ผ่าน
- `npm run build` ผ่าน ทุก route เป็น static (○)
- `npm run test:e2e` ผ่านบน Chromium (Pixel 7) และ WebKit (iPhone 13)

## ระยะที่ 2 (comkrub)

### หลัง merge PR ของ WP-0
1. ดูว่า Vercel deploy production แล้ว (Deployments ต้องมีรายการล่าสุดเป็น Ready) ถ้ายังไม่ deploy ให้กด **Redeploy** หรือ push commit ว่างจากเครื่องตัวเอง: `git commit --allow-empty -m "chore: deploy"` แล้ว `git push`
2. เปิด https://comkrub.mypisit.com บนมือถือจริง:
   - หน้าแรกเป็นหน้าเลือกหัวข้อ กดการ์ดครบ 4 ใบ (คูณ หาร MIPS Simulator ต้องขึ้นหน้า "กำลังพัฒนา")
   - เมนูบน (desktop) และเมนูมือถือ: ในหัวข้อ Floating-Point ต้องเห็นบท 1–5 และ Lab
   - ตรวจ redirect: `/learn` → `/floating-point`, `/learn/ieee-754` → `/floating-point/ieee-754`, `/lab?tab=calc&op=mul&a=0.1&b=3&step=round` → `/floating-point/lab?...` (query ต้องติดไปด้วย)
   - ลิงก์ Lab เก่าที่เคยแชร์ใน LINE ต้องเปิดได้และอยู่ขั้นเดิม
3. OG image เปลี่ยนเป็น comkrub แล้ว แต่ LINE เก็บ cache รูปเดิมไว้ระยะหนึ่ง

### merge PR ของเพื่อน
- ใช้ปุ่ม **"Create a merge commit"** เท่านั้น (ไม่ใช้ squash หรือ rebase) เพื่อให้ commit ล่าสุดบน `main` เป็นของ Pisit
- เหตุผล: โปรเจกต์ Vercel เป็นแผน Hobby และ repo เป็น private ซึ่ง Vercel ให้เฉพาะเจ้าของบัญชี trigger deployment ได้ และตรวจว่าผู้เขียน commit มีสิทธิ์ในโปรเจกต์ก่อน deploy · commit ของเพื่อนจึงไม่ขึ้น preview (Vercel Bot comment ว่า blocked ถือว่าปกติ) และถ้า commit ล่าสุดบน `main` เป็นของเพื่อน production อาจไม่ deploy
- ถ้า merge แล้ว production ไม่ deploy: กด Redeploy หรือ push commit ว่างตามข้อ 1
- Claude Code ห้ามแก้ settings บน Vercel (Pisit ทำเอง)
