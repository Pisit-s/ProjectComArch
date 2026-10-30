# WP-1: MIPS Simulator (`/mips`)

> ผู้รับผิดชอบ: Pisit (ค่าเริ่มต้น) · branch `wp1-mips-sim` · progress `docs/progress/wp1-mips-sim.md` · เขียนเมื่อ 31 ต.ค. 2569
> อ่านคู่กับ `PLAN.md` (กติกา ทีม ไฟล์ที่แก้ได้ design system) · เริ่มได้หลัง WP-0 merge แล้ว
> แหล่งอ้างอิง: `EMIPS.pdf` = MIPS Reference Data ("Green Card") จาก Patterson & Hennessy, *Computer Organization and Design* 4th ed. (ใช้เป็นข้อมูล ห้ามคัดลอก layout) · แนว UI จาก z80-workspace ของเพื่อน (https://github.com/VVeb1250/z80-workspace)
> golden: `docs/plans/golden/mips/` (ภาคผนวก D ของ PLAN.md)

## สารบัญ
- 0. เป้าหมายและขอบเขต
- 1. เทียบกับ z80-workspace
- 2. ชุดคำสั่งที่รองรับ
- 3. กติกาของเครื่อง (memory, register, exception, delay slot)
- 4. Assembler
- 5. Simulator และ syscall
- 6. ส่วนช่วยสอน (หัวใจของ WP นี้)
- 7. UI/UX
- 8. โครงสร้างโค้ดและ API
- 9. Testing
- 10. Phase และ Definition of Done
- 11. คำถามตั้งต้นของ WP-1
- ภาคผนวก A: โปรแกรมตัวอย่างและผลที่ต้องได้
- ภาคผนวก B: ตัวอย่างผลของแผง "อธิบายขั้นนี้"

---

## 0. เป้าหมายและขอบเขต
- **คืออะไร**: IDE + simulator ของ MIPS32 (ชุดคำสั่งตาม Green Card) ที่รันในเบราว์เซอร์ล้วน ภาษาไทย ใช้ได้ทั้งมือถือและคอม
- **ใครใช้**: นักศึกษาที่เรียน MIPS assembly และการคูณ/หาร และคนนำเสนอที่ต้องอธิบายทีละคำสั่งหน้าห้อง
- **เป้าหมายการสอน**: นักศึกษาเปิดตัวอย่าง `sum-loop` แล้วกดทีละคำสั่ง ต้องอธิบายได้ว่าคำสั่งนั้นมี field อะไร ทำอะไรกับ register/memory และ PC ไปไหนต่อ โดยดูจากแผง "อธิบายขั้นนี้" อย่างเดียว
- **มี**: editor + หลายไฟล์, assemble พร้อม error ภาษาไทย, รัน/ทีละคำสั่ง/ย้อนกลับ/breakpoint, register, memory, console (print และ read), รหัสเครื่องระบายสีตาม format, แผงอธิบาย, ตารางคำสั่ง, ตัวแปลงคำสั่ง ↔ รหัสเครื่อง, โปรแกรมตัวอย่าง 12 อัน, welcome + guided tour
- **ไม่มี**: คำสั่ง floating-point (coprocessor 1), CP0 และ exception handler แบบเต็ม, pipeline, หลาย thread, ไฟล์/เวลา/สุ่มแบบ MARS, ระบบปฏิบัติการ

---

## 1. เทียบกับ z80-workspace
| z80-workspace | comkrub `/mips` | ระดับ |
|---|---|---|
| Monaco + syntax Z80 | CodeMirror 6 + syntax MIPS (เบา ใช้บนมือถือได้) | Must |
| autocomplete mnemonic/register + เช็ค error สด | autocomplete จากตารางคำสั่ง + error ภาษาไทยในบรรทัด | Must |
| assemble ด้วย C16 จริงผ่าน DOSBox-WASM | assembler ของเราเอง (TypeScript) เร็วทันที ทดสอบได้ | Must |
| Listing / Hex | แผง "รหัสเครื่อง": address, hex, binary ระบายสีตาม field, คำสั่งจริง, บรรทัดต้นฉบับ | Must |
| Z80sim (ET-Board) | Registers + Memory + Console + ทีละคำสั่ง/รัน/ย้อนกลับ | Must |
| จุดสถานะ compile (none/fresh/stale) ต่อไฟล์ | เหมือนกัน | Should |
| หลายไฟล์ เก็บใน localStorage | Explorer (ตัวอย่าง + ไฟล์ของฉัน) | Must |
| editor tabs | แท็บไฟล์ที่เปิดอยู่ | Should |
| dockview (ลาก panel ได้) | `react-resizable-panels` บน desktop + แท็บบนมือถือ | Must |
| Instructions panel | ตารางคำสั่งภาษาไทยจากตารางเดียวกับ assembler | Must |
| Sim guide | แผง "อธิบายขั้นนี้" (fetch → decode → execute → memory → write back → PC) | Must |
| Welcome panel + guided tour | เหมือนกัน + "ประเด็นสำหรับอธิบาย" และ "คำถามชวนคิด" | Should (welcome) / Should (tour) |
| Settings (font, tab, ภาษา tutorial) | ขนาดตัวอักษร, รูปแบบตัวเลข, ความเร็ว, delayed branching | Should |
| Export .hex / .lst | Export / Import ไฟล์ `.s`, copy รหัสเครื่อง | Should |
| Desktop app (Electron), tutorial ภาษาอังกฤษ | ไม่ทำ | Won't |

---

## 2. ชุดคำสั่งที่รองรับ

### 2.1 Must: คำสั่งจริง (Green Card หน้า 1 ส่วน integer + `lb`, `lh` จากตาราง opcode)
ตารางเดียวนี้เป็นแหล่งข้อมูลของ assembler, decoder, autocomplete และตารางคำสั่งในเว็บ (`src/lib/mips/isa.ts`) · opcode/funct เป็นฐานสิบหก · RTL เขียนตาม Green Card · หมายเหตุ (1)–(7) ใน 2.5

| คำสั่ง | format | opcode / funct | รูปแบบ | ทำอะไร (RTL) | หมายเหตุ |
|---|---|---|---|---|---|
| `add` | R | 00 / 20 | `add rd, rs, rt` | R[rd] = R[rs] + R[rt] | (1) |
| `addu` | R | 00 / 21 | `addu rd, rs, rt` | R[rd] = R[rs] + R[rt] | |
| `sub` | R | 00 / 22 | `sub rd, rs, rt` | R[rd] = R[rs] - R[rt] | (1) |
| `subu` | R | 00 / 23 | `subu rd, rs, rt` | R[rd] = R[rs] - R[rt] | |
| `and` | R | 00 / 24 | `and rd, rs, rt` | R[rd] = R[rs] & R[rt] | |
| `or` | R | 00 / 25 | `or rd, rs, rt` | R[rd] = R[rs] \| R[rt] | |
| `nor` | R | 00 / 27 | `nor rd, rs, rt` | R[rd] = ~(R[rs] \| R[rt]) | |
| `slt` | R | 00 / 2a | `slt rd, rs, rt` | R[rd] = (R[rs] < R[rt]) ? 1 : 0 | |
| `sltu` | R | 00 / 2b | `sltu rd, rs, rt` | R[rd] = (R[rs] < R[rt]) ? 1 : 0 | (6) |
| `sll` | R | 00 / 00 | `sll rd, rt, shamt` | R[rd] = R[rt] << shamt | rs = 0 |
| `srl` | R | 00 / 02 | `srl rd, rt, shamt` | R[rd] = R[rt] >> shamt (เติม 0) | rs = 0 |
| `sra` | R | 00 / 03 | `sra rd, rt, shamt` | R[rd] = R[rt] >>> shamt (เติมบิตเครื่องหมาย) | rs = 0 |
| `jr` | R | 00 / 08 | `jr rs` | PC = R[rs] | |
| `mult` | R | 00 / 18 | `mult rs, rt` | {Hi, Lo} = R[rs] * R[rt] | ไม่ตรวจ overflow |
| `multu` | R | 00 / 19 | `multu rs, rt` | {Hi, Lo} = R[rs] * R[rt] | (6) |
| `div` | R | 00 / 1a | `div rs, rt` | Lo = R[rs] / R[rt]; Hi = R[rs] % R[rt] | หัวข้อ 3.5 |
| `divu` | R | 00 / 1b | `divu rs, rt` | Lo = R[rs] / R[rt]; Hi = R[rs] % R[rt] | (6) |
| `mfhi` | R | 00 / 10 | `mfhi rd` | R[rd] = Hi | |
| `mflo` | R | 00 / 12 | `mflo rd` | R[rd] = Lo | |
| `syscall` | R | 00 / 0c | `syscall` | เรียกบริการตาม $v0 (หัวข้อ 5.4) | |
| `addi` | I | 08 | `addi rt, rs, imm` | R[rt] = R[rs] + SignExtImm | (1)(2) |
| `addiu` | I | 09 | `addiu rt, rs, imm` | R[rt] = R[rs] + SignExtImm | (2) |
| `andi` | I | 0c | `andi rt, rs, imm` | R[rt] = R[rs] & ZeroExtImm | (3) |
| `ori` | I | 0d | `ori rt, rs, imm` | R[rt] = R[rs] \| ZeroExtImm | (3) |
| `slti` | I | 0a | `slti rt, rs, imm` | R[rt] = (R[rs] < SignExtImm) ? 1 : 0 | (2) |
| `sltiu` | I | 0b | `sltiu rt, rs, imm` | R[rt] = (R[rs] < SignExtImm) ? 1 : 0 | (2)(6) |
| `lui` | I | 0f | `lui rt, imm` | R[rt] = {imm, 16'b0} | rs = 0 |
| `lw` | I | 23 | `lw rt, offset(rs)` | R[rt] = M[R[rs] + SignExtImm] | (2) |
| `lbu` | I | 24 | `lbu rt, offset(rs)` | R[rt] = {24'b0, M[R[rs] + SignExtImm](7:0)} | (2) |
| `lhu` | I | 25 | `lhu rt, offset(rs)` | R[rt] = {16'b0, M[R[rs] + SignExtImm](15:0)} | (2) |
| `lb` | I | 20 | `lb rt, offset(rs)` | R[rt] = SignExt(M[R[rs] + SignExtImm](7:0)) | (2) อยู่ในตาราง opcode หน้า 3 |
| `lh` | I | 21 | `lh rt, offset(rs)` | R[rt] = SignExt(M[R[rs] + SignExtImm](15:0)) | (2) อยู่ในตาราง opcode หน้า 3 |
| `ll` | I | 30 | `ll rt, offset(rs)` | R[rt] = M[R[rs] + SignExtImm] | (2)(7) |
| `sw` | I | 2b | `sw rt, offset(rs)` | M[R[rs] + SignExtImm] = R[rt] | (2) |
| `sh` | I | 29 | `sh rt, offset(rs)` | M[R[rs] + SignExtImm](15:0) = R[rt](15:0) | (2) |
| `sb` | I | 28 | `sb rt, offset(rs)` | M[R[rs] + SignExtImm](7:0) = R[rt](7:0) | (2) |
| `sc` | I | 38 | `sc rt, offset(rs)` | M[R[rs] + SignExtImm] = R[rt]; R[rt] = (atomic) ? 1 : 0 | (2)(7) |
| `beq` | I | 04 | `beq rs, rt, label` | if (R[rs] == R[rt]) PC = PC + 4 + BranchAddr | (4) |
| `bne` | I | 05 | `bne rs, rt, label` | if (R[rs] != R[rt]) PC = PC + 4 + BranchAddr | (4) |
| `j` | J | 02 | `j label` | PC = JumpAddr | (5) |
| `jal` | J | 03 | `jal label` | R[31] = PC + 8 (Green Card); PC = JumpAddr | (5) ซิมเก็บ PC + 4 (หัวข้อ 3.4) |

### 2.2 Should: คำสั่งจริงจากตาราง opcode หน้า 3 (ทำใน phase 1E)
| คำสั่ง | format | opcode / funct | รูปแบบ | ทำอะไร |
|---|---|---|---|---|
| `xor` | R | 00 / 26 | `xor rd, rs, rt` | R[rd] = R[rs] ^ R[rt] |
| `xori` | I | 0e | `xori rt, rs, imm` | R[rt] = R[rs] ^ ZeroExtImm |
| `sllv` / `srlv` / `srav` | R | 00 / 04, 06, 07 | `sllv rd, rt, rs` | shift R[rt] ด้วย R[rs] & 31 |
| `jalr` | R | 00 / 09 | `jalr rs` หรือ `jalr rd, rs` | R[rd] = PC + 4 (rd เริ่มต้น = 31); PC = R[rs] |
| `mthi` / `mtlo` | R | 00 / 11, 13 | `mthi rs` | Hi = R[rs] / Lo = R[rs] |
| `blez` / `bgtz` | I | 06 / 07 | `blez rs, label` | แตกกิ่งเมื่อ R[rs] ≤ 0 / > 0 (มีเครื่องหมาย) · rt = 0 |
| `break` | R | 00 / 0d | `break` | หยุดโปรแกรม (Bp, ExcCode 9) |

### 2.3 Won't (assembler ต้องบอกว่า "มีใน MIPS แต่ซิมนี้ยังไม่รองรับ" ไม่ใช่ "ไม่รู้จักคำสั่ง")
- คำสั่ง floating-point ทั้งหมด (`add.s`, `lwc1`, `swc1`, `bc1t`, `c.x.s` …), `mfc0`, `lwl`, `lwr`, `swl`, `swr`, `cache`, `pref`, `sync`, `movz`, `movn`, คำสั่ง trap (`teq`, `tge` …), `bltz`/`bgez` และ pseudo อื่นนอกจาก 2.4

### 2.4 Pseudo-instruction (ขยายแบบเดียวกับ MARS · รหัสเครื่องตรวจแล้วใน `encodings.json`)
| pseudo | ขยายเป็น | หมายเหตุ |
|---|---|---|
| `li rt, imm` | ถ้า imm อยู่ใน -32768..32767: `addiu rt, $zero, imm` · ถ้าอยู่ใน 0..65535: `ori rt, $zero, imm` · นอกนั้น (ถึง 32 บิต): `lui $at, hi16` + `ori rt, $at, lo16` | Green Card |
| `la rt, label` | `lui $at, hi16(label)` + `ori rt, $at, lo16(label)` (2 คำสั่งเสมอ) | ไม่อยู่ใน Green Card แต่ต้องใช้กับ `.data` |
| `move rd, rs` | `addu rd, $zero, rs` | Green Card |
| `blt rs, rt, L` | `slt $at, rs, rt` + `bne $at, $zero, L` | Green Card |
| `bgt rs, rt, L` | `slt $at, rt, rs` + `bne $at, $zero, L` | Green Card |
| `ble rs, rt, L` | `slt $at, rt, rs` + `beq $at, $zero, L` | Green Card |
| `bge rs, rt, L` | `slt $at, rs, rt` + `beq $at, $zero, L` | Green Card |
| `nop` | `sll $zero, $zero, 0` (= 0x00000000) | ไม่อยู่ใน Green Card |
- branch pseudo รับเฉพาะ register 2 ตัว (ไม่รับ immediate) · ถ้าเขียน immediate ให้ error พร้อม hint "ใช้ li ใส่ค่าลง register ก่อน"
- ตัวอย่างที่ตรวจแล้ว: `li $t0, 0x12345678` → `0x3C011234` + `0x34285678` · `li $t0, -100000` → `0x3C01FFFE` + `0x34287960` · `move $t0, $t1` → `0x00094021` · `blt $t0, $t1, L` (L = PC เดียวกัน) → `0x0109082A` + `0x1420FFFE`

### 2.5 หมายเหตุของ Green Card (เขียนเป็นภาษาไทยในตารางคำสั่งของเว็บ)
1. อาจเกิด overflow exception (ตรวจเฉพาะเลขมีเครื่องหมาย)
2. SignExtImm = {16{immediate[15]}, immediate}: ขยาย immediate 16 บิตเป็น 32 บิตด้วยบิตเครื่องหมาย
3. ZeroExtImm = {16{1'b0}, immediate}: เติม 0 ด้านหน้า
4. BranchAddr = {14{immediate[15]}, immediate, 2'b0}: offset นับเป็นจำนวนคำสั่ง ขยายเครื่องหมายแล้วคูณ 4 · ปลายทาง = PC + 4 + BranchAddr
5. JumpAddr = {PC+4[31:28], address, 2'b0}: 4 บิตบนจาก PC + 4 ต่อด้วย address 26 บิต แล้วต่อ 00
6. มองตัวถูกดำเนินการเป็นเลขไม่มีเครื่องหมาย
7. `ll`/`sc` ใช้คู่กันทำ atomic test-and-set: `sc` ให้ R[rt] = 1 ถ้าคู่นี้ atomic, 0 ถ้าไม่
- จุดที่นักศึกษาสับสนบ่อย (ใส่ในตารางคำสั่งเป็น "ระวัง"): `addiu` ยังขยายเครื่องหมายของ immediate (u แปลว่าไม่ตรวจ overflow) · `sltiu` ขยายเครื่องหมายก่อนแล้วค่อยเทียบแบบไม่มีเครื่องหมาย · `andi`/`ori` เติม 0 ไม่ขยายเครื่องหมาย · `lb` กับ `lbu` ต่างกันเมื่อบิต 7 เป็น 1 · `sll $zero, $zero, 0` คือ `nop`

### 2.6 Register (ตามตาราง register convention ของ Green Card)
| ชื่อ | เลข | ใช้ทำอะไร | คงค่าข้ามการเรียกฟังก์ชัน |
|---|---|---|---|
| `$zero` | 0 | ค่าคงที่ 0 (เขียนแล้วไม่เปลี่ยน) | - |
| `$at` | 1 | assembler ใช้ตอนขยาย pseudo-instruction | ไม่ |
| `$v0`–`$v1` | 2–3 | ผลลัพธ์ของฟังก์ชัน · `$v0` เลือก syscall | ไม่ |
| `$a0`–`$a3` | 4–7 | argument | ไม่ |
| `$t0`–`$t7` | 8–15 | temporary | ไม่ |
| `$s0`–`$s7` | 16–23 | saved | ใช่ |
| `$t8`–`$t9` | 24–25 | temporary | ไม่ |
| `$k0`–`$k1` | 26–27 | สงวนให้ OS kernel | ไม่ |
| `$gp` | 28 | global pointer | ใช่ |
| `$sp` | 29 | stack pointer | ใช่ |
| `$fp` | 30 | frame pointer | ใช่ |
| `$ra` | 31 | return address | ไม่ |
- assembler รับทั้งชื่อ (`$t0`) และเลข (`$8`) · แสดงผลใช้ชื่อเสมอ

---

## 3. กติกาของเครื่อง

### 3.1 Memory (ตาม Memory Allocation ของ Green Card)
| ส่วน | address | หมายเหตุ |
|---|---|---|
| reserved | 0x00000000–0x003FFFFF | เข้าถึงไม่ได้ (AdEL/AdES) |
| text | เริ่ม 0x00400000 | โค้ด · อ่านเป็นข้อมูลได้ เขียนไม่ได้ (error) · สูงสุด 16,384 คำสั่ง |
| static data | เริ่ม 0x10000000 | `.data` · `$gp` = 0x10008000 |
| heap | เริ่ม 0x10040000 | `sbrk` (syscall 9, Should) · ถ้า `.data` ใหญ่จนชน heap ให้ error ตอน assemble |
| stack | `$sp` เริ่ม 0x7FFFFFFC โตลงล่าง | |
| kernel | ≥ 0x80000000 | เข้าถึงไม่ได้ (AdEL/AdES) |
- memory แบบ sparse (page 4 KB เก็บใน `Map`) ค่าเริ่มต้นเป็น 0 ทุก byte
- **big-endian** ตาม Green Card (Data Alignment) และตำรา ("MIPS is in the big-endian camp") · byte ที่ address ต่ำสุดของ word คือ byte ที่มีนัยสำคัญสูงสุด
- alignment: `lw`/`ll`/`sw`/`sc` ต้องหาร 4 ลงตัว, `lh`/`lhu`/`sh` หาร 2 ลงตัว ไม่งั้นเกิด AdEL (อ่าน) / AdES (เขียน)

### 3.2 สถานะเริ่มต้น
- register ทั้งหมด = 0 ยกเว้น `$gp` = 0x10008000, `$sp` = 0x7FFFFFFC · HI = LO = 0 · PC = 0x00400000 (คำสั่งแรกของ `.text`)
- โปรแกรมจบเมื่อ: syscall 10 หรือ 17 · หรือ PC เลยคำสั่งสุดท้าย (ข้อความ "โปรแกรมจบ: ทำคำสั่งสุดท้ายแล้ว") · หรือเกิด exception
- **จำนวนคำสั่ง (steps)** = จำนวนคำสั่งที่ทำสำเร็จ รวม syscall ที่สั่งจบ แต่ไม่นับคำสั่งที่เกิด exception (golden ใช้นิยามนี้)

### 3.3 Exception (รหัสตาม Exception Codes ของ Green Card) → หยุดโปรแกรม แสดงแถบสีแดงพร้อมคำอธิบาย (6.9) และไฮไลต์บรรทัด
| เหตุการณ์ | ชื่อ | ExcCode | ผล |
|---|---|---|---|
| `add`/`addi`/`sub` ผลเกินช่วงเลขมีเครื่องหมาย 32 บิต | Ov | 12 | ไม่เขียนผลลง register ปลายทาง |
| อ่านไม่ตรง alignment, อ่านนอกพื้นที่, PC ไม่ใช่ตำแหน่งคำสั่ง | AdEL | 4 | |
| เขียนไม่ตรง alignment, เขียนนอกพื้นที่ | AdES | 5 | |
| เขียนลงส่วน text | AdES | 5 | ข้อความบอกว่าเขียนทับโค้ดไม่ได้ |
| รหัสคำสั่งที่ไม่รู้จัก (เช่น jump ไปที่ข้อมูล) | RI | 10 | |
| syscall ที่ไม่รองรับ | Sys | 8 | |
| `break` (Should) | Bp | 9 | |

### 3.4 Branch delay slot และ `jal`
- **ค่าเริ่มต้น: ไม่มี delay slot** (แบบ single-cycle ในตำราบทที่ 2 และ 4 และค่าเริ่มต้นของ MARS) → branch/jump มีผลทันที และ `jal`/`jalr` เก็บ **PC + 4**
- Green Card เขียน `jal`: R[31] = PC + 8 เพราะเครื่อง MIPS จริงมี branch delay slot (คำสั่งถัดจาก branch ถูกทำก่อนเสมอ) → แผงอธิบายของ `jal` ต้องบอกเรื่องนี้ทุกครั้ง
- Should (phase 1E): setting "Delayed branching" เปิดแล้ว branch/jump มีผลหลังทำคำสั่งถัดไป 1 คำสั่ง และ `jal` เก็บ PC + 8 ตรงกับ Green Card · golden ทั้งหมดใช้ค่าเริ่มต้น (ปิด)

### 3.5 กรณีที่ผลไม่นิยามตามสเปก (ซิมเลือกแบบ MARS และแสดงคำเตือนสีเหลือง ไม่หยุดโปรแกรม)
- `div`/`divu` ด้วย 0: ไม่มี exception · HI และ LO คงค่าเดิม · คำเตือน "MIPS ไม่ตรวจการหารด้วยศูนย์ โปรแกรมต้องตรวจตัวหารเอง"
- `div` 0x80000000 ÷ -1: LO = 0x80000000, HI = 0 + คำเตือนว่าผลเกินช่วง
- `mult`/`multu` ไม่ตรวจ overflow โดยตั้งใจ (ผล 64 บิตอยู่ใน HI/LO ครบเสมอ) · แผงอธิบายบอกวิธีตรวจ: `multu` ไม่ล้น 32 บิตถ้า HI = 0 · `mult` ไม่ล้นถ้า HI เท่ากับบิตเครื่องหมายของ LO ที่ขยายเต็ม 32 บิต
- `div` ของเลขมีเครื่องหมาย: ผลหารปัดเข้าหา 0 และเศษมีเครื่องหมายเดียวกับตัวตั้ง (-7 ÷ 2 → LO = -3, HI = -1)

### 3.6 `ll` / `sc`
- `ll` ตั้ง link ที่ address นั้น · `sc` สำเร็จ (เขียน memory และ R[rt] = 1) เฉพาะเมื่อมี link ที่ address เดียวกัน ไม่งั้นไม่เขียนและ R[rt] = 0 · `sc` ล้าง link ทุกครั้ง · แผงอธิบายบอกว่าใช้ทำ atomic operation ในระบบหลาย core ซึ่งซิมนี้มี core เดียว

### 3.7 ต่างจาก MARS (เขียนในหน้า "เกี่ยวกับ" ของซิม)
| เรื่อง | comkrub (ตาม Green Card/ตำรา) | MARS |
|---|---|---|
| byte order | big-endian | little-endian |
| `.data` เริ่มที่ | 0x10000000 | 0x10010000 |
| `$sp` เริ่มต้น | 0x7FFFFFFC | 0x7FFFEFFC |
| delay slot | ปิด (เปิดได้ใน Settings) | ปิด (เปิดได้) |
- ผลของ `lbu`/`lhu` บน word เดียวกันจึงต่างจาก MARS: ต้องอธิบายในตัวอย่าง `endian`

---

## 4. Assembler

### 4.1 ไวยากรณ์
- 1 บรรทัด: `[label:] [คำสั่งหรือ directive] [# comment]` · label มีหลายตัวได้ · บรรทัดที่มีแค่ label ใช้ได้
- label: `[A-Za-z_.][A-Za-z0-9_.]*` แยกตัวพิมพ์เล็ก-ใหญ่ · ห้ามซ้ำกับชื่อคำสั่ง
- mnemonic และ directive ไม่แยกตัวพิมพ์เล็ก-ใหญ่ · operand คั่นด้วย `,` (ช่องว่างรอบ ๆ ได้)
- register: `$0`–`$31` หรือชื่อใน 2.6
- ตัวเลข: ฐานสิบ (มี `-` ได้), `0x` ฐานสิบหก, `0b` ฐานสอง (ช่วยสอน), อักษรเดี่ยว `'A'` (รองรับ `\n`, `\t`, `\0`, `\\`, `\'`)
- ข้อความ: `"..."` รองรับ `\n`, `\t`, `\0`, `\\`, `\"` · ข้อความภาษาไทยเก็บเป็น UTF-8 (`TextEncoder`)
- comment ภาษาไทยได้ · ไฟล์เป็น UTF-8

### 4.2 Directive
| directive | ที่ใช้ได้ | ผล |
|---|---|---|
| `.text` / `.data` | ทุกที่ | สลับส่วน (ไม่รองรับการกำหนด address เอง: ถ้ามีเลขตามมาให้ error ว่ายังไม่รองรับ) |
| `.word v1, v2, …` | `.data` | ข้อมูล 4 byte ต่อค่า จัดให้ตรง 4 อัตโนมัติ · ค่า -2^31..2^32-1 หรือ label |
| `.half …` | `.data` | 2 byte จัดตรง 2 · ค่า -32768..65535 |
| `.byte …` | `.data` | 1 byte · ค่า -128..255 |
| `.ascii "…"` / `.asciiz "…"` | `.data` | ข้อความ (asciiz ต่อ 0 ท้าย) |
| `.space n` | `.data` | จอง n byte เป็น 0 |
| `.align n` | `.data` | จัดให้ตรง 2^n (n = 0..3) |
| `.globl name` | ทุกที่ | รับไว้แต่ไม่มีผล |
- label หน้า `.word`/`.half` ได้ address หลังจัด alignment แล้ว

### 4.3 ขั้นตอน (two-pass)
1. แยกบรรทัด → token (เก็บ line/column ทุก token สำหรับ error)
2. pass 1: ไล่บรรทัดคำนวณ address (pseudo รู้ขนาดตั้งแต่ pass 1: `li` ดูจากค่า, `la` 2 คำสั่งเสมอ, branch pseudo 2 คำสั่ง) และเก็บ label
3. pass 2: แปลงทุกคำสั่งเป็น word 32 บิต ตรวจช่วงค่า แก้ label เป็น offset/address
4. ผลลัพธ์: `Program` (หัวข้อ 8) รวม `rows` สำหรับแผงรหัสเครื่อง: `{ addr, word, line, source, basic, pseudo?: { text, part, count } }`
- error ทุกตัวต้องมี line, column, ช่วงที่ขีดเส้นใต้ใน editor, รหัส error และข้อความไทย · assembler ไม่หยุดที่ error แรก (เก็บได้สูงสุด 50 ตัว)

### 4.4 ข้อความ error (ภาษาไทย · `{}` คือค่าที่เติม · รหัสใช้ใน test)
| รหัส | ข้อความ |
|---|---|
| `unknown-mnemonic` | ไม่รู้จักคำสั่ง "{op}" (+ "หมายถึง "{suggest}" หรือเปล่า" ถ้า edit distance ≤ 2) |
| `unsupported` | "{op}" มีใน MIPS แต่ซิมนี้ยังไม่รองรับ |
| `operand-count` | "{op}" ต้องเขียนแบบ {syntax} |
| `expect-register` | ตรงนี้ต้องเป็น register เช่น $t0 หรือ $8 แต่พบ "{tok}" |
| `unknown-register` | ไม่มี register ชื่อ "{tok}" |
| `expect-number` | ตรงนี้ต้องเป็นตัวเลขหรือ label แต่พบ "{tok}" |
| `imm-signed-range` | {value} เกินช่วงของ immediate 16 บิตแบบมีเครื่องหมาย (-32768 ถึง 32767) · hint: ใช้ li ใส่ค่าลง register ก่อน |
| `imm-unsigned-range` | {value} เกินช่วง 0 ถึง 65535 ({op} เติม 0 ด้านหน้า immediate) |
| `shamt-range` | shamt ต้องอยู่ระหว่าง 0 ถึง 31 |
| `mem-operand` | address ต้องเขียนแบบ offset($reg) เช่น 4($sp) |
| `undefined-label` | ไม่พบ label "{name}" |
| `duplicate-label` | label "{name}" ประกาศซ้ำ (ครั้งแรกที่บรรทัด {line}) |
| `branch-range` | ปลายทางของ branch ไกลเกินไป (offset ต้องอยู่ใน 16 บิต) |
| `jump-region` | ปลายทางของ j/jal ต้องอยู่ในช่วง 256 MB เดียวกับ PC + 4 |
| `unknown-directive` | ไม่รู้จัก directive "{d}" |
| `wrong-segment` | {thing} ต้องอยู่ใน {segment} |
| `value-range` | ค่า {value} เกินช่วงของ {d} |
| `bad-string` | ข้อความต้องอยู่ในเครื่องหมาย "…" |
| `text-too-large` / `data-too-large` | โปรแกรมหรือข้อมูลใหญ่เกินที่ซิมรองรับ |
| `at-used` (warning, Should) | ใช้ $at เอง: assembler ใช้ $at ตอนขยาย pseudo-instruction ค่าอาจถูกเขียนทับ |

---

## 5. Simulator และ syscall

### 5.1 การทำงานทีละคำสั่ง
- register เก็บเป็นเลข 32 บิตไม่มีเครื่องหมาย (`>>> 0`) · `mult`/`multu`/`div`/`divu` ใช้ BigInt ให้ถูกทุกบิต
- `step()` คืน `StepRecord` ที่มีทุกอย่างที่แผงอธิบายและการย้อนกลับต้องใช้ (หัวข้อ 8): PC, word, ผล decode, ค่าที่อ่าน (register/memory), การเขียน register (ค่าเดิม/ใหม่), การเขียน memory (byte เดิม/ใหม่), HI/LO เดิม/ใหม่, ผลการตัดสินใจ branch, PC ถัดไป, syscall ที่เกิด, exception หรือคำเตือน
- `$zero` เขียนแล้วไม่เปลี่ยน และแผงอธิบายบอกว่า "เขียนลง $zero ไม่มีผล"

### 5.2 รันและหยุด
- ปุ่ม: Assemble · Run/Pause · Step · Step back · Reset (กลับสถานะเริ่มต้นของโปรแกรมเดิม)
- ความเร็ว: "ช้า" (2 คำสั่ง/วินาที) · "ปานกลาง" (10/วินาที) · "เร็ว" (50/วินาที) · "ทันที" (รันเป็นก้อนใน `requestAnimationFrame` ใช้เวลาไม่เกิน ~12 ms ต่อเฟรม UI ไม่ค้าง) · ความเร็วต่ำไฮไลต์บรรทัดและ register ทุกคำสั่ง
- breakpoint: กดที่ gutter ของบรรทัด (หยุดก่อนทำคำสั่งแรกของบรรทัดนั้น) · Run หยุดที่ breakpoint, exception, จบโปรแกรม, รอ input หรือครบเพดาน
- เพดาน 5,000,000 คำสั่งต่อการกด Run (แก้ได้ใน Settings) → หยุดชั่วคราวพร้อมข้อความ "ทำงานครบ 5,000,000 คำสั่งแล้ว (อาจวนไม่รู้จบ) กด Run เพื่อทำต่อ"
- แก้โค้ดหลัง assemble → สถานะไฟล์เป็น "แก้แล้ว ยังไม่ assemble" (จุดสีเหลือง) ปุ่ม Run/Step ยังใช้กับโปรแกรมเดิมได้ แต่มีแถบเตือนให้ assemble ใหม่

### 5.3 ย้อนกลับ (Step back)
- เก็บ `StepRecord` ย้อนหลังได้สูงสุด 100,000 ขั้น (ring buffer) · Step back คืนค่า register, HI/LO, memory, PC, ข้อความใน console, input ที่ใช้ไป และ link ของ `ll`
- property test: ทำ k ขั้นแล้วย้อน k ขั้น ต้องได้สถานะเท่ากับก่อนทำทุกบิต

### 5.4 syscall (ตาม SPIM ที่ตำราใช้ + บางตัวของ MARS)
| `$v0` | ชื่อ | ทำอะไร | ระดับ |
|---|---|---|---|
| 1 | print_int | พิมพ์ `$a0` แบบมีเครื่องหมาย | Must |
| 4 | print_string | พิมพ์ข้อความที่ `$a0` จนเจอ byte 0 (ถอดรหัส UTF-8 แบบ stream) | Must |
| 5 | read_int | รอรับจำนวนเต็ม 32 บิตจาก console → `$v0` | Must |
| 10 | exit | จบโปรแกรม | Must |
| 11 | print_char | พิมพ์ byte ต่ำของ `$a0` | Must |
| 8 | read_string | อ่านข้อความไม่เกิน `$a1` - 1 ตัวลงที่ `$a0` ต่อ 0 ท้าย | Should |
| 9 | sbrk | จอง `$a0` byte บน heap → `$v0` = address | Should |
| 12 | read_char | รอรับ 1 ตัวอักษร → `$v0` | Should |
| 17 | exit2 | จบโปรแกรมพร้อมรหัส `$a0` | Should |
| 34 | print_hex | พิมพ์ `$a0` เป็น 0x + 8 หลัก (MARS) | Should |
| 35 | print_binary | พิมพ์ `$a0` เป็น 32 บิต (MARS) | Should |
| 36 | print_uint | พิมพ์ `$a0` แบบไม่มีเครื่องหมาย (MARS) | Should |
- console เก็บผลเป็น byte แล้วถอดรหัส UTF-8 แบบ stream (ข้อความไทยใน `.asciiz` แสดงถูก) · ข้อความที่ผู้ใช้พิมพ์ตอน read แสดงใน console ด้วยสีต่างกันแล้วขึ้นบรรทัดใหม่
- read_int: ช่องพิมพ์โผล่ใต้ console พร้อมโฟกัสอัตโนมัติ · รับ -2147483648..2147483647 · ค่าผิดให้ขึ้นข้อความแล้วรอรับใหม่ (ไม่หยุดโปรแกรม)

### 5.5 ประสิทธิภาพ
- เป้า: ≥ 1,000,000 คำสั่ง/วินาทีในโหมด "ทันที" บน MacBook M2 (วัดด้วย script ใน `tests/unit/mips/bench.test.ts` แบบ `skip` บน CI หรือ `scripts/bench-mips.mts`) · `restoring-divide` (1,014 คำสั่ง) ต้องจบทันทีที่กด Run
- โหมด "ทันที" ห้ามสร้าง object ใหญ่ต่อคำสั่งเกินจำเป็น และอัปเดต UI แค่ครั้งเดียวต่อเฟรม

---

## 6. ส่วนช่วยสอน (หัวใจของ WP นี้)

### 6.1 แผง "อธิบายขั้นนี้" (Must)
- แสดงคำสั่งที่**เพิ่งทำไป** (จาก `StepRecord`) เป็น 6 ช่วงเรียงลงมา แต่ละช่วงมีค่าจริงและปุ่ม "ทำไม" เปิดคำอธิบายสั้น · ด้านบนมีบรรทัด "คำสั่งถัดไป: <basic> ที่ PC = …"
  1. **Fetch**: PC และ word ที่อ่านได้ (hex)
  2. **Decode**: word เป็น binary แบ่ง field ระบายสีตาม format (สีจาก PLAN.md 6.1) · บอกว่า opcode → format อะไร · funct → คำสั่งอะไร · rs/rt/rd เป็น register อะไร · immediate เป็นค่าอะไรหลัง sign/zero extend
  3. **Execute**: RTL ของคำสั่งจากตาราง 2.1 แล้วแทนค่าจริง เช่น `R[rd] = R[rs] + R[rt]` → `$t0 = 0 + 1 = 1` · บอกผลตรวจ overflow (ถ้ามี) · branch บอกผลการเปรียบเทียบและกระโดดไหม
  4. **Memory**: address ที่คำนวณ (`R[rs] + SignExtImm`) และ byte ที่อ่าน/เขียนเรียงแบบ big-endian · คำสั่งที่ไม่ใช้ memory เขียนว่า "ไม่ใช้ memory"
  5. **Write back**: register ที่เปลี่ยน ค่าเดิม → ค่าใหม่ (หรือ HI/LO) · ถ้าไม่มีให้บอกว่าไม่มี
  6. **PC ถัดไป**: PC + 4 หรือการคำนวณ BranchAddr / JumpAddr ทีละส่วน
- ถ้าคำสั่งมาจาก pseudo-instruction: แถบบนสุดบอกบรรทัดต้นฉบับ, คำสั่งจริงทั้งหมดที่ได้, และ "กำลังทำคำสั่งที่ n จาก m"
- syscall: บอกบริการตาม `$v0` และค่าที่ใช้/ได้ · exception: แสดงแทนช่วง Execute เป็นสีแดง (6.9)
- คำ "ทำไม" ที่ต้องมีอย่างน้อย: ทำไม branch คูณ 4 (คำสั่งยาว 4 byte address จึงลงท้าย 00 เสมอ เก็บเป็นจำนวนคำสั่งได้ไกลขึ้น 4 เท่า), ทำไมนับจาก PC + 4, ทำไม `$at` ถูกใช้, ทำไม `jal` ใน Green Card เป็น PC + 8, sign extension กับ zero extension ต่างกันยังไง, big-endian คืออะไร
- ตัวอย่างผลที่ต้องได้อยู่ในภาคผนวก B · ทุกตัวเลขในแผงนี้มาจาก `StepRecord` และฟังก์ชันใน `src/lib/mips/explain.ts` (มี unit test)

### 6.2 แผงรหัสเครื่อง (Must)
- แถวละ 1 คำสั่งจริง: address · hex · binary แบ่ง field ระบายสี · คำสั่งจริง (`basic`) · เลขบรรทัดและข้อความต้นฉบับ (pseudo แสดงทุกส่วนที่ขยาย)
- แถวที่ PC ชี้อยู่ไฮไลต์ · แตะ field เพื่อดูชื่อ field ค่า และความหมาย · แตะแถวเพื่อเลื่อน editor ไปบรรทัดนั้น
- มือถือ: binary ยาวเลื่อนแนวนอนในแถวของมันเอง (ห้ามทำให้ทั้งหน้าเลื่อนแนวนอน)

### 6.3 Registers (Must)
- 32 ตัว + PC + HI + LO · คอลัมน์: ชื่อ (และเลข) · ค่า · ตัวที่เปลี่ยนในขั้นล่าสุดมี highlight และ tooltip ค่าเดิม
- รูปแบบตัวเลข: hex (ค่าเริ่มต้น) / ฐานสิบมีเครื่องหมาย / ฐานสิบไม่มีเครื่องหมาย / binary (เลือกทั้งแผง) · แตะ register ดูครบทุกรูปแบบ + หน้าที่ตาม convention (2.6)
- มือถือ: grid 2 คอลัมน์ ตัวอักษร ≥ 14px

### 6.4 Memory (Must)
- เลือกส่วน: `.data` · stack (รอบ `$sp`) · heap · text · พิมพ์ address เอง · ติดตาม `$sp` อัตโนมัติ (เลือกได้)
- แถวละ 16 byte: address · 4 word เป็น hex · ASCII · byte ที่เปลี่ยนในขั้นล่าสุดไฮไลต์ · มีป้าย "big-endian" แตะแล้วมีภาพอธิบาย word 0x11223344 → byte 11 22 33 44 ตาม address จากน้อยไปมาก

### 6.5 ตารางคำสั่ง (Must)
- สร้างจาก `isa.ts` ตัวเดียวกับ assembler (ห้ามมีตารางแยก) · ค้นหาได้ · จัดกลุ่ม: คำนวณ · ตรรกะ · shift · เปรียบเทียบ · load/store · branch/jump · คูณ/หาร · ระบบ · pseudo
- แต่ละคำสั่ง: ชื่อเต็มภาษาอังกฤษ, คำอธิบายไทย 1–2 ประโยค, รูปแบบ, format, opcode/funct, RTL, หมายเหตุ (2.5), "ระวัง" (ถ้ามี), ตัวอย่าง 1 บรรทัดพร้อมคำอธิบาย, ปุ่ม "แทรกตัวอย่างลง editor" (แทรกที่ cursor ไม่ทับของเดิม)
- ท้ายตาราง: "อ้างอิง: MIPS Reference Data (Green Card), Patterson & Hennessy, Computer Organization and Design, 4th ed." (เขียนเองทั้งหมด ไม่คัดลอก layout)

### 6.6 ตัวแปลงคำสั่ง ↔ รหัสเครื่อง (Must)
- พิมพ์คำสั่ง 1 บรรทัด → binary แบ่ง field ระบายสี + hex · พิมพ์ hex → คำสั่ง + field · branch/jump รับปลายทางเป็นตัวเลขและมีช่อง PC (ค่าเริ่มต้น 0x00400000)
- ตัวอย่างที่ต้องได้ (จาก `encodings.json`): `add $t0, $t1, $t2` → `0x012A4020` · `lw $t0, 4($sp)` → `0x8FA80004` · `beq $t0, $t1, 0x0040000C` ที่ PC 0x00400000 → `0x11090002` · `jal 0x00400020` ที่ PC 0x00400004 → `0x0C100008`

### 6.7 โปรแกรมตัวอย่าง (Must)
- 12 อันตาม `MipsExampleId` (ต้นฉบับใน `docs/plans/golden/mips/*.s` · รายละเอียดในภาคผนวก A) · ใน Explorer แบ่งกลุ่ม "พื้นฐาน" / "คูณและหาร" / "memory และ exception"
- เก็บใน `src/content/mips/examples/<id>.ts` (`{ id, title, summary, topics, source }`) โดย `source` ต้องตรงกับไฟล์ golden ทุกตัวอักษร (unit test อ่านไฟล์ `.s` มาเทียบ) · ระวัง: `hello.s` มี `\n` อยู่ในข้อความ ถ้าเก็บเป็น template literal ต้องใช้ `String.raw` หรือ escape เป็น `\\n` ไม่งั้นจะกลายเป็นขึ้นบรรทัดจริง
- ตัวอย่างเปิดแบบอ่านอย่างเดียว มีปุ่ม "ทำสำเนาเพื่อแก้" (สร้างไฟล์ของฉัน)
- `/mips?example=<id>`: เปิดตัวอย่างนั้นและ assemble ให้เลย (ยังไม่รัน) · ใช้ `useSearchParams` ใน `Suspense` เหมือน Lab · id ไม่รู้จัก → เปิดหน้า welcome พร้อมข้อความเตือน

### 6.8 Welcome, guided tour, ประเด็นสำหรับอธิบาย (Should, แต่ "ประเด็นสำหรับอธิบาย" และ "คำถามชวนคิด" เป็น Must)
- Welcome (แท็บแรกเมื่อเปิดครั้งแรก): วิธีใช้ 5 ขั้น (เลือกตัวอย่าง → Assemble → Step/Run → ดู Registers/Memory → อ่านแผงอธิบาย) + ปุ่มเปิดตัวอย่าง `sum-loop`
- Guided tour: ชี้ปุ่มจริงด้วย `data-tour` (editor, Assemble, Step, Registers, แผงอธิบาย, รหัสเครื่อง, ตารางคำสั่ง) · ปิดได้ จำว่าเคยดู · เปิดใหม่จากเมนูช่วยเหลือ
- `TalkingPoints` (ประเด็นสำหรับอธิบาย): คำสั่ง MIPS ยาว 32 บิตเท่ากันและมี 3 format · register 32 ตัว `$zero` เป็น 0 เสมอ · ทุกคำสั่งผ่าน fetch, decode, execute, memory, write back แล้ว PC ไปต่อ · branch เป็น PC-relative (PC + 4 + offset × 4) ส่วน jump ใช้ 26 บิต · pseudo-instruction ไม่มีในฮาร์ดแวร์ assembler แปลงให้โดยใช้ `$at` · memory เป็น big-endian และการเรียกฟังก์ชันใช้ `jal`/`jr` กับ stack
- `SelfCheck` (คำถามชวนคิด · ตัวเลขในเฉลยต้องคำนวณจาก engine): ทำไม `addi $t0, $t0, 70000` assemble ไม่ผ่าน · `beq` ที่ PC 0x00400018 มี immediate 0xFFFC กระโดดไปไหน (0x0040000C) · `lb` กับ `lbu` ได้ค่าต่างกันอย่างไรเมื่อ byte เป็น 0x80 · ทำไม `mult` ไม่มี overflow exception · ทำไม Green Card เขียน `jal` เก็บ PC + 8 แต่ซิมเก็บ PC + 4

### 6.9 คำอธิบาย exception และคำเตือน (Must)
- แถบสีแดง: ชื่อ + ExcCode ตาม Green Card + ประโยคอธิบายสาเหตุ + วิธีแก้ เช่น Ov: "`addi` คิดเลขแบบมีเครื่องหมายแล้วเกินช่วง 32 บิต จึงเกิด exception และไม่เขียนผลลง `$t3` ถ้าไม่ต้องการให้ตรวจ ใช้ `addiu`" · AdEL/AdES บอก address และเหตุ (ไม่ลงตัว/นอกพื้นที่/เขียนทับโค้ด)
- คำเตือนสีเหลือง (โปรแกรมไม่หยุด): หารด้วยศูนย์, 0x80000000 ÷ -1, เขียนลง `$zero`

### 6.10 Datapath (Could · ทำเมื่อทุกอย่างเสร็จและมีเวลา)
- ภาพ datapath แบบ single-cycle (แนวคิดจากตำราบทที่ 4 แต่วาดเองด้วยชุด `src/components/hw/` + mux ที่ทำใน `src/components/mips/`) ไฮไลต์เส้นที่ใช้และแสดงค่าบนเส้นสำคัญสำหรับคำสั่งกลุ่ม R-type, `lw`, `sw`, `beq`/`bne`, `j`, `addi`/`ori` · คำสั่งอื่นแสดง "datapath แบบง่ายไม่ครอบคลุมคำสั่งนี้"
- สัญญาณควบคุมที่ต้องแสดง:

| คำสั่ง | RegDst | ALUSrc | MemtoReg | RegWrite | MemRead | MemWrite | Branch | ALUOp |
|---|---|---|---|---|---|---|---|---|
| R-type | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 10 |
| `lw` | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 00 |
| `sw` | X | 1 | X | 0 | 0 | 1 | 0 | 00 |
| `beq` | X | 0 | X | 0 | 0 | 0 | 1 | 01 |
| `addi` | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 00 |
- `j` ใช้สัญญาณ Jump = 1 · ค่าในตารางนี้เป็นของ datapath ในตำรา ห้ามใช้เป็นเหตุผลเปลี่ยนพฤติกรรมของ simulator

---

## 7. UI/UX

### 7.1 Desktop (≥ 1024px)
- หน้า `/mips` เต็มความสูงจอใต้ header (`100dvh` ลบความสูง header) · footer อยู่ใต้ workspace (เลื่อนลงถึงเห็น)
- Toolbar บนสุด: ชื่อไฟล์ + จุดสถานะ (ยังไม่ assemble / ตรงกับโค้ด / แก้แล้ว) · Assemble · Run/Pause · Step · Step back · Reset · ความเร็ว · จำนวนคำสั่งที่ทำ · Settings · ช่วยเหลือ (tour) · เต็มจอ
- panel ด้วย `react-resizable-panels` v4 (ตรวจ API กับ Context7: `Group`, `Panel`, `Separator`):
  - ซ้าย (พับได้): Explorer (ตัวอย่าง / ไฟล์ของฉัน: สร้าง เปลี่ยนชื่อ ทำสำเนา ลบ (ยืนยันด้วย modal ของ daisyUI ห้ามใช้ `window.confirm`), Import/Export `.s`)
  - กลาง: editor
  - ขวา: Registers (บน) + อธิบายขั้นนี้ (ล่าง)
  - ล่าง (แท็บ): Console · รหัสเครื่อง · Memory · Problems · ตารางคำสั่ง · ตัวแปลง
- จำขนาด panel ไว้ (`onLayoutChanged` → localStorage)

### 7.2 มือถือและ tablet (< 1024px)
- Toolbar ติดบน ปุ่มใหญ่ ≥ 44px: Assemble · Step back · Step · Run/Pause · เมนู (Reset ความเร็ว Settings ช่วยเหลือ)
- แท็บด้านล่าง: โค้ด · Registers · อธิบาย · Memory · Console · อื่น ๆ (รหัสเครื่อง ตารางคำสั่ง ตัวแปลง ไฟล์)
- หลัง Step บนแท็บใดก็ตาม ให้แสดงแถบเล็กใต้ toolbar สรุป "คำสั่งที่เพิ่งทำ + register ที่เปลี่ยน" แตะแล้วไปแท็บอธิบาย
- editor บนมือถือ: ตัวอักษร ≥ 14px, ปิดการซูมอัตโนมัติของ iOS (font-size ≥ 16px ในช่องพิมพ์), มีแถบปุ่มลัดเหนือคีย์บอร์ดสำหรับ `$` `,` `(` `)` `#` `:` (Should)

### 7.3 คีย์ลัด (desktop · บอกใน tooltip และเมนูช่วยเหลือ)
| คีย์ | ทำอะไร |
|---|---|
| Ctrl/Cmd + S หรือ Ctrl/Cmd + Enter | Assemble |
| F5 | Run / ทำต่อ |
| F10 | Step |
| Shift + F10 | Step back |
| Esc | Pause |
| Ctrl/Cmd + / | comment บรรทัด |

### 7.4 Settings (Should) · เก็บใน localStorage
- ขนาดตัวอักษร editor (12–24) · รูปแบบตัวเลขเริ่มต้น · ความเร็วเริ่มต้น · เพดานจำนวนคำสั่ง · Delayed branching (3.4) · แสดงคำสั่งจริงที่ขยายจาก pseudo ใน editor (inline hint) · เริ่ม tour ใหม่

### 7.5 การเก็บข้อมูล
- key: `comkrub:mips:files:v1`, `comkrub:mips:settings:v1`, `comkrub:mips:layout:v1`, `comkrub:mips:tour:v1`
- อ่าน/เขียนใน `try/catch` ทุกครั้ง · ถ้าใช้ localStorage ไม่ได้ (private mode) ให้ทำงานต่อด้วย memory และแจ้งเล็ก ๆ ว่าไฟล์จะไม่ถูกบันทึก
- Should: แชร์โค้ดเป็นลิงก์ `/mips?code=<base64url(deflate-raw)>` (`CompressionStream`) ไม่เกิน ~8 KB ถ้ายาวกว่านั้นให้บอกให้ Export ไฟล์แทน

### 7.6 Editor (CodeMirror 6)
- `StreamLanguage` สำหรับ MIPS: comment, label, directive, mnemonic (จาก `isa.ts` + pseudo), register, ตัวเลข, ข้อความ · สีจาก theme ของเว็บ (พื้นขาวกระจก) ด้วย `HighlightStyle`
- autocomplete: mnemonic พร้อมรูปแบบและคำอธิบายสั้น · register หลังพิมพ์ `$` · label ในไฟล์ · directive หลังพิมพ์ `.`
- lint: ใช้ผลของ assembler (debounce ~300 ms) แสดงขีดเส้นใต้ + ข้อความไทย
- gutter: เลขบรรทัด + breakpoint · decoration ไฮไลต์บรรทัดของคำสั่งถัดไปตอนรัน/step
- ฟอนต์ JetBrains Mono (มีอยู่แล้ว) + IBM Plex Sans Thai สำรองสำหรับตัวอักษรไทยใน comment

### 7.7 Accessibility และอื่น ๆ
- ใช้คีย์บอร์ดได้ทุกส่วน · focus เห็นชัด · `aria-live` แจ้ง "assemble สำเร็จ", "โปรแกรมจบ", exception · ปุ่มมี `aria-label` ไทย
- reduced motion: ไม่มี animation กระพริบ ใช้แค่เปลี่ยนสีพื้น
- ทั้งหน้าเป็น static: ส่วน workspace เป็น client component · metadata: title "MIPS Simulator" + description

---

## 8. โครงสร้างโค้ดและ API
```
src/lib/mips/
  isa.ts         ตารางคำสั่ง (แหล่งข้อมูลเดียว): mnemonic, ชื่อเต็ม, format, opcode, funct, รูปแบบ operand, RTL, notes, กลุ่ม, ระดับ (must/should), คำอธิบายไทย, ระวัง, ตัวอย่าง
  registers.ts   ชื่อ เลข convention
  lexer.ts       token พร้อมตำแหน่ง
  assembler.ts   assemble(source) -> { program?, diagnostics }
  encode.ts      encode(spec, operands, pc) -> number
  decode.ts      decode(word) -> Decoded | null · disassemble(word, pc, symbols?) -> string
  memory.ts      sparse big-endian memory + ตรวจ segment/alignment
  cpu.ts         createState(program), step(state, io) -> StepRecord, undo(state, record)
  run.ts         runChunk(state, io, { maxSteps, timeBudgetMs, breakpoints })
  syscalls.ts    ตาราง syscall
  explain.ts     explain(record, program) -> ExplainModel (6 ช่วง + pseudo + ทำไม)
  index.ts
src/content/mips/
  examples/<id>.ts   ตัวอย่าง 12 อัน (source ตรงกับ golden)
  examples/index.ts  รายการ + กลุ่ม (ครบทุก MipsExampleId)
  guide.ts           ข้อความ welcome, tour, ประเด็นสำหรับอธิบาย, คำถามชวนคิด
src/components/mips/
  workspace.tsx  toolbar.tsx  explorer.tsx  editor/  registers-panel.tsx  memory-panel.tsx
  console-panel.tsx  machine-code-panel.tsx  explain-panel.tsx  reference-panel.tsx
  converter-panel.tsx  problems-panel.tsx  welcome.tsx  tour.tsx  settings.tsx  use-simulator.ts
src/app/mips/page.tsx   metadata + <Suspense><Workspace /></Suspense>
```
- type หลัก (ปรับชื่อได้ แต่ข้อมูลต้องครบ):
```ts
export type Format = 'R' | 'I' | 'J';
export interface Diagnostic { line: number; col: number; endCol: number; severity: 'error' | 'warning'; code: string; message: string; hint?: string }
export interface ListingRow { addr: number; word: number; line: number; source: string; basic: string; pseudo?: { text: string; part: number; count: number } }
export interface Program { textBase: number; text: Uint32Array; dataBase: number; data: Uint8Array; symbols: Map<string, number>; rows: ListingRow[]; lineOfAddr: Map<number, number> }
export interface Decoded { format: Format; mnemonic: string; op: number; rs: number; rt: number; rd: number; shamt: number; funct: number; imm: number; target: number }
export interface StepRecord {
  pc: number; word: number; decoded: Decoded; nextPc: number;
  regWrites: { reg: number; before: number; after: number }[];
  hiLo?: { hiBefore: number; loBefore: number; hiAfter: number; loAfter: number };
  memReads: { addr: number; bytes: number[] }[];
  memWrites: { addr: number; before: number[]; after: number[] }[];
  branch?: { taken: boolean; target: number };
  syscall?: { code: number; output?: string; input?: string };
  warning?: { code: string; message: string };
  exception?: { name: 'Ov' | 'AdEL' | 'AdES' | 'RI' | 'Sys' | 'Bp'; excCode: number; message: string };
}
```
- `use-simulator.ts`: `useReducer` state machine: `idle` → `assembled` → `running` / `paused` / `waiting-input` / `halted` / `error` · UI อ่าน state จากที่เดียว

---

## 9. Testing
- unit (`tests/unit/mips/`, Vitest · coverage ของ `src/lib/mips/**` ≥ 95%):
  - `encodings.test.ts`: อ่าน `docs/plans/golden/mips/encodings.json` → คำสั่งจริง 41 แบบต้องได้ word ตรงกัน (branch/jump ในไฟล์ใช้ปลายทางเป็นตัวเลข absolute + `pc` ของคำสั่ง จึงทดสอบผ่าน `encode()` หรือ API ของตัวแปลงใน 6.6) และ pseudo 12 แบบต้องขยายเป็น word ตรงกันทุกตัว (assemble โดยมีบรรทัดนำหน้า `.data` / `msg: .asciiz "hi"` / `.text` / `L:` ทำให้คำสั่งแรกอยู่ที่ 0x00400000, `msg` = 0x10000000, `L` = 0x00400000) · decode ของทุก word กลับมาเป็นคำสั่งเดิม · ห้ามเทียบข้อความ disassembly กับช่อง `capstone` ในไฟล์ (Capstone ใช้ชื่อย่อและรูปแบบ operand ของตัวเอง) ให้เทียบแค่ word
  - `roundtrip.test.ts` (fast-check, `numRuns: 2000`): สุ่มคำสั่งจาก `isa.ts` พร้อม operand ที่ถูกต้อง → assemble → decode → disassemble → assemble ซ้ำ ต้องได้ word เดิม
  - `assembler.test.ts`: directive ทุกตัว (layout ของ `.data` เช่น `.byte 1` แล้ว `.word 2` ต้องจัดตรง 4), label, pseudo, และ error ทุกรหัสใน 4.4 (เทียบ `code` และ `line`)
  - `semantics.test.ts` (fast-check, `numRuns: 1000` ต่อคำสั่ง): ทุกคำสั่งใน 2.1 เทียบกับสูตร BigInt ที่เขียนใน test · overflow ของ `add`/`addi`/`sub` ต้องเกิด Ov และไม่เขียนผล · `addu`/`addiu`/`subu` ต้องไม่เกิด · `sltiu` ใช้ immediate ที่ sign-extend · `andi`/`ori` zero-extend · `sra` เติมบิตเครื่องหมาย
  - `memory.test.ts`: big-endian ทุกขนาด, alignment → AdEL/AdES, เขียน text → error, address นอกพื้นที่, `ll`/`sc`
  - `programs.test.ts`: อ่าน `docs/plans/golden/mips/*.s` + `expected.json` → assemble และรันทุกโปรแกรม (ใส่ `inputs` ถ้ามี) ต้องได้ register ทั้ง 32 ตัว, HI, LO, output, steps, exception (ชื่อ ExcCode PC บรรทัด) และข้อมูลใน `.data` ตรงทุกตัว · `examples/<id>.ts` ต้องมี `source` ตรงกับไฟล์ `.s`
  - `undo.test.ts` (fast-check): สุ่มโปรแกรมจาก golden และจำนวนขั้น k → ทำ k ขั้นแล้วย้อน k ขั้น สถานะต้องเท่าเดิมทุกบิต
  - `explain.test.ts`: ผลของ `explain()` สำหรับตัวอย่างในภาคผนวก B ต้องมีตัวเลขตรง
- e2e (`tests/e2e/mips.spec.ts`, pixel7 + iphone13 + desktop):
  1. เปิด `/mips?example=sum-loop` → assemble อัตโนมัติ → Run → console มี "55"
  2. Reset → Step 5 ครั้ง → `$t0` = 1, `$t1` = 2 · แผงอธิบายแสดง `addi` และ field ระบายสี · Step back 1 ครั้ง → `$t1` กลับเป็น 1 และ `$t0` ยังเป็น 1
  3. breakpoint ที่บรรทัด `li $v0, 1` → Run หยุดที่บรรทัดนั้น
  4. พิมพ์ `ad $t0, $t1, $t2` → Problems มี error `unknown-mnemonic` พร้อม "add"
  5. `io`: พิมพ์ 7 แล้ว 35 → console แสดง "a = 7", "b = 35", "a + b = 42"
  6. `overflow` → แถบ exception "Ov" และ ExcCode 12 ที่บรรทัด 6 · `$t3` ยังเป็น 0
  7. ตัวแปลง: `add $t0, $t1, $t2` → `0x012A4020`
  8. ไฟล์ของฉัน: สร้าง แก้ reload แล้วยังอยู่ · ลบต้องผ่าน modal
  9. มือถือ: ไม่มีการเลื่อนแนวนอนทั้งหน้า · แท็บครบ · ปุ่ม ≥ 44px · keyboard shortcut บน desktop
  10. ไม่มี console error · axe ไม่มี serious/critical
- performance: วัดตาม 5.5 และจดผลใน progress

---

## 10. Phase และ Definition of Done
| phase | งาน | DoD |
|---|---|---|
| 1A Engine | `src/lib/mips/` ทั้งหมด (ไม่มี UI) + unit test ทั้งหมดในหัวข้อ 9 | test ผ่านครบ รวม golden ทุกไฟล์ · coverage ≥ 95% · ติดตั้ง dependency ของ WP-1 และจดใน `docs/STACK.md` |
| 1B Workspace | หน้า `/mips`, layout desktop/มือถือ, editor (highlight, autocomplete, lint, breakpoint, ไฮไลต์บรรทัด), toolbar, Registers, Memory, Console + input, รหัสเครื่อง, Problems, Explorer + เก็บไฟล์, เปิดตัวอย่างจาก URL | e2e ข้อ 1–5, 8–10 ผ่าน · screenshot 390/1440 เปิดดูแล้ว · build static |
| 1C ช่วยสอน | แผงอธิบาย (6.1), field ระบายสี + แตะดูความหมาย, ตารางคำสั่ง, ตัวแปลง, exception/คำเตือน, ตัวอย่าง 12 อันพร้อมกลุ่ม, welcome + ประเด็นสำหรับอธิบาย + คำถามชวนคิด · แล้วเปลี่ยน `mips` เป็น `ready` ใน `topics.ts` และเพิ่มอ้างอิง Green Card ใน `site.references` | e2e ทุกข้อผ่าน · อ่านคำอธิบายทุกคำสั่ง Must ทวนกับ 2.1 และ 2.5 แล้ว |
| 1D Polish | a11y, reduced motion, ประสิทธิภาพ (5.5), error boundary (`ToolBoundary` เดิม), Lighthouse ของ `/mips` (accessibility ≥ 95, performance มือถือ ≥ 80 เพราะมี editor) | ผลวัดจดใน progress |
| 1E Should/Could | ตามลำดับ: คำสั่ง 2.2 → syscall Should → Delayed branching → guided tour → Settings → แชร์ลิงก์โค้ด → แท็บไฟล์ → datapath (Could) | แต่ละข้อมี test ของตัวเอง |
| ปิดงาน | review 3 รอบ (PLAN.md 11) → รายงาน → PR | PR เปิดแล้ว |

---

## 11. คำถามตั้งต้นของ WP-1 (ใส่ในไฟล์ progress แล้วทำต่อด้วยค่าที่สมมติ)
| # | ระดับ | คำถาม | ค่าที่ใช้ไปก่อน |
|---|---|---|---|
| WP1-Q1 | ยืนยันค่าเริ่มต้น | ปิด delay slot เป็นค่าเริ่มต้น (`jal` เก็บ PC + 4) และอธิบายว่า Green Card เขียน PC + 8 เพราะ delay slot · อาจารย์รับแบบนี้ไหม | ปิด + มี setting เปิด (1E) |
| WP1-Q2 | ยืนยันค่าเริ่มต้น | ใช้ big-endian และ `.data` ที่ 0x10000000 ตาม Green Card (ต่างจาก MARS) | ตาม Green Card |
| WP1-Q3 | ไม่ด่วน | อาจารย์ใช้ MARS หรือ SPIM ในคาบไหม (จะได้เขียนหน้า "ต่างจาก MARS" ให้ตรง) | เขียนเทียบกับ MARS |

---

## ภาคผนวก A: โปรแกรมตัวอย่างและผลที่ต้องได้
ต้นฉบับ: `docs/plans/golden/mips/<id>.s` · ผลครบทุก register: `expected.json` (ตารางนี้สรุปเฉพาะค่าที่ใช้สอน · ตัวเลขเป็นฐานสิบหกถ้าขึ้นต้น 0x)

| id | ชื่อในเว็บ | สอนเรื่อง | กลุ่ม | คำสั่ง (word) | steps | output | ค่าที่ต้องได้ |
|---|---|---|---|---|---|---|---|
| `hello` | Hello, MIPS | `.asciiz`, `la`, syscall 4 | พื้นฐาน | 6 | 6 | `Hello, MIPS!` + ขึ้นบรรทัด | `$a0` = 0x10000000 |
| `sum-loop` | ผลรวม 1 ถึง 10 | loop, `add`/`addi`, `ble` (pseudo) | พื้นฐาน | 12 | 48 | `55` | `$t0` = 55, `$t1` = 11 |
| `array-sum` | รวมค่าใน array | `.word`, `lw`, `sll` หา offset, `j` | พื้นฐาน | 19 | 55 | `11` | `$s2` = 11 |
| `max` | ค่ามากที่สุดใน array | `bge`/`ble` → `slt` + `beq`, `move` | พื้นฐาน | 22 | 69 | `45` | `$s2` = 45 |
| `factorial` | factorial แบบ recursive | `jal`/`jr`, stack, `sw`/`lw $ra`, `mult`/`mflo` | พื้นฐาน | 24 | 81 | `120` | `$s0` = 120, `$sp` = 0x7FFFFFFC, `$ra` = 0x00400008 |
| `mult-div` | mult, multu, div, divu | HI/LO, มี/ไม่มีเครื่องหมาย | คูณและหาร | 20 | 20 | - | `$s0`–`$s7` = 0xFFFFFFFF, 0xFFFFFFF1, 1, 0xFFFFFFFE, 0xFFFFFFFD, 0xFFFFFFFF, 3, 1 |
| `div-signs` | เครื่องหมายของผลหารและเศษ | ±7 ÷ ±2 | คูณและหาร | 20 | 20 | - | `$s0`–`$s7` = 3, 1, 0xFFFFFFFD, 0xFFFFFFFF, 0xFFFFFFFD, 1, 3, 0xFFFFFFFF |
| `shift-add-multiply` | คูณแบบ shift-and-add | อัลกอริทึมคูณรุ่นปรับปรุงเขียนด้วย MIPS, carry ด้วย `sltu` | คูณและหาร | 32 | 797 | - | `$s1` = 143, `$s2` = `$s4` = 0xFFFFFFFE, `$s3` = `$s5` = 1 |
| `restoring-divide` | หารแบบ restoring | อัลกอริทึมหารรุ่นปรับปรุงเขียนด้วย MIPS, บิตที่ 33 | คูณและหาร | 38 | 1014 | - | `$s0` = 3, `$s1` = 1, `$s2` = 142857, `$s3` = 1, `$s4` = `$s6` = 1, `$s5` = `$s7` = 0x7FFFFFFE |
| `endian` | Big-Endian | `lbu`/`lhu`/`lb`, `sb` แล้ว `lw` | memory และ exception | 15 | 15 | - | `$t0`–`$t3` = 0x11, 0x22, 0x33, 0x44 · `$t4` = 0x1122 · `$t5` = 0x3344 · `$t6` = 0x80 · `$t7` = 0xFFFFFF80 · `$t9` = 0xAB223344 |
| `overflow` | Overflow exception | `addi` trap vs `addu`/`addiu` วนค่า | memory และ exception | 6 | 4 | - | exception Ov (ExcCode 12) ที่ PC 0x00400010 บรรทัด 6 · `$t1` = 0xFFFFFFFE · `$t2` = 0x80000000 · `$t3` = 0 |
| `io` | รับค่าจาก Console | syscall 5 และ 4 | พื้นฐาน | 24 | 24 | `a = b = a + b = 42` (input 7, 35) | `$s2` = 42 · console รวม input: "a = 7", "b = 35", "a + b = 42" |

---

## ภาคผนวก B: ตัวอย่างผลของแผง "อธิบายขั้นนี้" (ค่าตรวจแล้วจาก listing ของ `sum-loop` และ `factorial`)
1. `sum-loop` คำสั่งที่ 4 (รอบแรก) PC = 0x0040000C · word 0x01094020
   - Decode: `000000 01000 01001 01000 00000 100000` → R-format · funct 0x20 = `add` · rs = `$t0` · rt = `$t1` · rd = `$t0`
   - Execute: `R[rd] = R[rs] + R[rt]` → `$t0 = 0 + 1 = 1` (ไม่ overflow)
   - Memory: ไม่ใช้ · Write back: `$t0` 0x00000000 → 0x00000001 · PC ถัดไป 0x00400010
2. `sum-loop` คำสั่งที่ 7 (ส่วนที่ 2 ของ `ble $t1, $t2, loop`) PC = 0x00400018 · word 0x1020FFFC = `beq $at, $zero, loop`
   - แถบ pseudo: "บรรทัด 8 `ble $t1, $t2, loop` ขยายเป็น `slt $at, $t2, $t1` และ `beq $at, $zero, loop` · กำลังทำคำสั่งที่ 2 จาก 2"
   - Execute: เทียบ `$at` กับ `$zero` (รอบแรก `$at` = 0) → เท่ากัน → กระโดด
   - PC ถัดไป: immediate 0xFFFC → SignExtImm = -4 → BranchAddr = -4 × 4 = -16 → PC + 4 + BranchAddr = 0x0040001C - 16 = 0x0040000C
3. `factorial` คำสั่งที่ 2 PC = 0x00400004 · word 0x0C100008 = `jal fact`
   - Execute: `$ra` = PC + 4 = 0x00400008 · หมายเหตุ: Green Card เขียน R[31] = PC + 8 เพราะเครื่องจริงมี delay slot (ซิมปิด delay slot ไว้)
   - PC ถัดไป: JumpAddr = {PC+4[31:28], address, 00} = 0x00400020
