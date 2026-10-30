# overflow.s — add / addi / sub ตรวจ overflow ส่วน addu / addiu / subu ไม่ตรวจ
        .text
main:   li    $t0, 0x7FFFFFFF # จำนวนบวกที่มากที่สุดของ 32 บิต
        addu  $t1, $t0, $t0   # ไม่ตรวจ: ได้ 0xFFFFFFFE
        addiu $t2, $t0, 1     # ไม่ตรวจ: ได้ 0x80000000 (วนกลับไปเป็นค่าลบ)
        addi  $t3, $t0, 1     # ตรวจ: เกิด exception Ov (ExcCode 12) โปรแกรมหยุดที่นี่ และ $t3 ไม่ถูกเขียน
        li    $t4, 1          # บรรทัดนี้จะไม่ถูกทำ
