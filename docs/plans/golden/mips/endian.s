# endian.s — MIPS เก็บแบบ Big-Endian: byte ที่ address ต่ำสุดคือ byte ที่มีนัยสำคัญสูงสุด
        .data
w:      .word 0x11223344
b:      .byte 0x80
        .text
main:   la   $a0, w
        lbu  $t0, 0($a0)      # 0x11
        lbu  $t1, 1($a0)      # 0x22
        lbu  $t2, 2($a0)      # 0x33
        lbu  $t3, 3($a0)      # 0x44
        lhu  $t4, 0($a0)      # 0x1122
        lhu  $t5, 2($a0)      # 0x3344
        lbu  $t6, 4($a0)      # 0x80 เติม 0 ข้างหน้า → 0x00000080
        lb   $t7, 4($a0)      # 0x80 ขยายเครื่องหมาย → 0xFFFFFF80
        li   $t8, 0xAB
        sb   $t8, 0($a0)      # เขียนทับ byte แรก
        lw   $t9, 0($a0)      # 0xAB223344
        li   $v0, 10
        syscall
