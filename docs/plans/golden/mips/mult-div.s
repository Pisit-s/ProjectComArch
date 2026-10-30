# mult-div.s — mult / multu / div / divu เก็บผลใน HI และ LO
        .text
main:   li    $t0, -3
        li    $t1, 5
        mult  $t0, $t1        # {HI, LO} = -15 (ผลคูณ 64 บิตแบบมีเครื่องหมาย)
        mfhi  $s0             # 0xFFFFFFFF
        mflo  $s1             # 0xFFFFFFF1 (= -15)
        li    $t2, -1         # 0xFFFFFFFF
        li    $t3, 2
        multu $t2, $t3        # 4294967295 * 2 แบบไม่มีเครื่องหมาย
        mfhi  $s2             # 0x00000001
        mflo  $s3             # 0xFFFFFFFE
        li    $t4, -7
        div   $t4, $t3        # -7 / 2 : LO = ผลหาร, HI = เศษ
        mflo  $s4             # -3
        mfhi  $s5             # -1 (เศษมีเครื่องหมายเดียวกับตัวตั้ง)
        li    $t5, 7
        divu  $t5, $t3        # 7 / 2 แบบไม่มีเครื่องหมาย
        mflo  $s6             # 3
        mfhi  $s7             # 1
        li    $v0, 10
        syscall
