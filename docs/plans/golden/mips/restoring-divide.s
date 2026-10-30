# restoring-divide.s — หารด้วยซอฟต์แวร์ ตามฮาร์ดแวร์การหารรุ่นปรับปรุงในตำรา
# Remainder 64 บิต = {$v1 ครึ่งซ้าย = เศษ, $v0 ครึ่งขวา = ผลหาร} · เริ่มต้น {0, Dividend}
        .text
main:   li   $a0, 7           # Dividend
        li   $a1, 2           # Divisor
        jal  div32
        move $s0, $v0         # ผลหาร = 3
        move $s1, $v1         # เศษ = 1
        li   $a0, 1000000
        li   $a1, 7
        jal  div32
        move $s2, $v0         # 142857
        move $s3, $v1         # 1
        li   $a0, -1          # 0xFFFFFFFF
        li   $a1, 0x80000001
        jal  div32
        move $s4, $v0         # 1
        move $s5, $v1         # 0x7FFFFFFE
        divu $a0, $a1         # เทียบกับคำสั่ง divu ของจริง
        mflo $s6              # ต้องเท่ากับ $s4
        mfhi $s7              # ต้องเท่ากับ $s5
        li   $v0, 10
        syscall

# div32: $v0 = $a0 / $a1, $v1 = $a0 % $a1 แบบไม่มีเครื่องหมาย ($a1 ต้องไม่เป็น 0) ทำ 32 รอบ
div32:  li   $t0, 32
        move $v1, $zero       # ครึ่งซ้าย (เศษ) = 0
        move $v0, $a0         # ครึ่งขวา = Dividend
loop:   srl  $t2, $v1, 31     # บิตที่จะหลุดออกจากครึ่งซ้าย (บิตที่ 33)
        sll  $v1, $v1, 1      # 1. เลื่อน {เศษ, ผลหาร} ไปทางซ้าย 1 บิต
        srl  $t1, $v0, 31
        or   $v1, $v1, $t1
        sll  $v0, $v0, 1
        bne  $t2, $zero, dosub #   มีบิตที่ 33 แปลว่าเศษ >= Divisor แน่นอน
        sltu $t3, $v1, $a1    # 2. เศษ < Divisor ไหม (ถ้าใช่ ลบแล้วจะติดลบ)
        bne  $t3, $zero, next #    ใช่ → ไม่ลบ (ผลเท่ากับลบแล้ว restore) บิตผลหาร = 0
dosub:  subu $v1, $v1, $a1    # 3. เศษ = เศษ - Divisor
        ori  $v0, $v0, 1      #    บิตผลหาร = 1
next:   addi $t0, $t0, -1
        bne  $t0, $zero, loop
        jr   $ra
