# คู่มือ deploy บน Vercel (Pisit ทำเอง)

เว็บนี้เป็น static ทั้งหมด ไม่ต้องตั้ง Environment Variables และไม่มี database

1. เข้า vercel.com → **Add New → Project** → Import `Pisit-s/ProjectComArch` (ให้สิทธิ์ GitHub ถ้าถูกถาม)
2. Framework Preset: **Next.js** (ตรวจเจอเอง) · Root Directory: `./` · Build Command / Install Command: ใช้ค่าเริ่มต้น · Node.js Version: **24.x** (ค่าเริ่มต้น)
3. ไม่ต้องตั้ง Environment Variables
4. กด **Deploy** → ได้ `https://<ชื่อโปรเจกต์>.vercel.app`
5. ทดสอบบนมือถือจริง (iPhone Safari + Android Chrome):
   - เลื่อนหน้าเดียวจากบนลงล่าง ทุกบทโหลดภาพขึ้นมาเอง ไม่ค้างเป็นกล่องว่าง · เมนูบท (มือถือ: ปุ่มขวาบน) พาไปบทที่กดได้
   - ปุ่มของ StepPlayer (ปุ่มเล่นใหญ่, ย้อน, ถัดไป, จุดบอกขั้น, ความเร็ว, เริ่มใหม่, นำเสนอ) และปุ่ม "ทำไม?"
   - บทที่ 5: ใส่เลขเองและกด chip ตัวอย่าง · บทที่ 6: แตะกล่องในวงจร · บทที่ 7: สลับบิต/วงจร แล้ว "คัดลอกลิงก์" ส่งใน LINE แล้วเปิดดูว่าได้ตัวอย่างและขั้นเดิม
   - เปิด Reduce Motion (iOS: Settings → Accessibility → Motion) แล้วดูว่าไม่มีอะไรเล่นเองแต่เปลี่ยนขั้นได้ครบ
   - ลิงก์เก่า `/learn/ieee-754` และ `/lab?a=0.1&b=0.2&op=add` ต้องพาไปบทที่ตรงกัน
6. หลังต่อแล้ว ทุก push เข้า `main` = deploy production อัตโนมัติ · branch อื่น/PR = preview URL
7. domain จริงตอนนี้คือ `https://comkrub.mypisit.com` (`siteUrl` ใน `src/lib/site.ts` ใช้กับ OG image, sitemap, robots) ถ้าย้าย domain ให้แก้ที่เดียวแล้ว push

## Preview ของ branch และสิ่งที่ตรวจหลัง merge
- ทุก push ของ branch (`addsub-redesign`, `addsub-ch12`, `addsub-ch34`) Vercel สร้าง preview URL ให้เอง ดูได้ที่หน้า PR หรือแท็บ Deployments · ใช้ preview ลองบนมือถือจริงก่อน merge
- หลัง merge เข้า `main` (production) เปิดตรวจบน https://comkrub.mypisit.com:
  - `/learn` → `/` · `/learn/number-systems` → `/#binary` · `/learn/binary-fractions` → `/#convert` · `/learn/ieee-754` → `/#ieee754` · `/learn/add-sub` → `/#fp-add` · `/learn/mul-div` → `/` · `/lab?a=0.1&b=0.2&op=add` → `/?a=0.1&b=0.2&op=add#playground` (เห็นตัวอย่าง 0.1 + 0.2 ในบทที่ 7)
  - `/dev/kit` ต้องเป็น 404 · `/sitemap.xml` มีแค่ `/` · รูปตัวอย่างตอนแชร์ลิงก์ (OG) เป็นรูป comkrub

## เปิด Web Analytics (ทำครั้งเดียว)
โค้ดใส่ `<Analytics />` ไว้แล้ว (Q9) แต่ต้องเปิดที่ Vercel ก่อนถึงจะเริ่มนับ: Project → แท็บ **Analytics** → **Enable** → redeploy หนึ่งครั้ง (Deployments → ⋯ → Redeploy) · ดูจำนวนผู้เข้าชมได้ที่แท็บ Analytics (ข้อมูลไม่ระบุตัวตน ไม่ใช้ cookie)

## ตรวจก่อน deploy (ทำแล้วในเครื่อง)
- `npm run lint && npm run typecheck && npm test` ผ่าน
- `npm run build` ผ่าน ทุก route เป็น static (○)
- `npm run test:e2e` ผ่านบน Chromium (Pixel 7, desktop) และ WebKit (iPhone 13)
- `npm run text:report` ทุกบทอยู่ในงบ (≤ 600)
