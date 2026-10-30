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
7. ถ้าชื่อโปรเจกต์บน Vercel ไม่ใช่ `binary-lab` หรือต่อ domain เอง (เช่น `float.mypisit.com`: Settings → Domains → Add → ตั้ง CNAME ตามที่ Vercel บอก) ให้แก้ `siteUrl` ใน `src/lib/site.ts` ให้ตรง URL จริง (ใช้กับ OG image, sitemap, robots) แล้ว push (คำถาม Q4)

## ตรวจก่อน deploy (ทำแล้วในเครื่อง)
- `npm run lint && npm run typecheck && npm test` ผ่าน
- `npm run build` ผ่าน ทุก route เป็น static (○)
- `npm run test:e2e` ผ่านบน Chromium (Pixel 7) และ WebKit (iPhone 13)
