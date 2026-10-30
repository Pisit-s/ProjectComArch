# shift-add-multiply.s — คูณแบบ shift-and-add ด้วยซอฟต์แวร์ ตามฮาร์ดแวร์การคูณรุ่นปรับปรุงในตำรา
# Product 64 บิต = {$v1 ครึ่งซ้าย, $v0 ครึ่งขวา} · ครึ่งขวาเริ่มต้นเป็น Multiplier
        .text
main:   li    $a0, 13         # Multiplicand
        li    $a1, 11         # Multiplier
        jal   mul32
        move  $s0, $v1        # ผลคูณครึ่งบน = 0
        move  $s1, $v0        # ผลคูณครึ่งล่าง = 143
        li    $a0, -1         # 0xFFFFFFFF
        li    $a1, -1         # 0xFFFFFFFF
        jal   mul32
        move  $s2, $v1        # 0xFFFFFFFE
        move  $s3, $v0        # 0x00000001
        multu $a0, $a1        # เทียบกับคำสั่ง multu ของจริง
        mfhi  $s4             # ต้องเท่ากับ $s2
        mflo  $s5             # ต้องเท่ากับ $s3
        li    $v0, 10
        syscall

# mul32: {$v1, $v0} = $a0 * $a1 แบบไม่มีเครื่องหมาย ทำ 32 รอบ
mul32:  li    $t0, 32         # ตัวนับรอบ
        move  $v1, $zero      # Product ครึ่งซ้าย = 0
        move  $v0, $a1        # Product ครึ่งขวา = Multiplier
loop:   andi  $t1, $v0, 1     # 1. ดูบิตขวาสุดของ Product
        move  $t2, $zero      #    carry = 0
        beq   $t1, $zero, shift
        addu  $v1, $v1, $a0   # 1a. ครึ่งซ้าย = ครึ่งซ้าย + Multiplicand
        sltu  $t2, $v1, $a0   #     ทดออกจากบิต 31 ไหม (carry)
shift:  srl   $v0, $v0, 1     # 2. เลื่อน {carry, ครึ่งซ้าย, ครึ่งขวา} ไปทางขวา 1 บิต
        sll   $t3, $v1, 31
        or    $v0, $v0, $t3   #    บิตขวาสุดของครึ่งซ้ายย้ายไปเป็นบิตซ้ายสุดของครึ่งขวา
        srl   $v1, $v1, 1
        sll   $t2, $t2, 31
        or    $v1, $v1, $t2   #    carry เข้าไปเป็นบิตซ้ายสุดของครึ่งซ้าย
        addi  $t0, $t0, -1
        bne   $t0, $zero, loop # 3. ยังไม่ครบ 32 รอบ → ทำต่อ
        jr    $ra
