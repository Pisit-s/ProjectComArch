# factorial.s — ฟังก์ชันเรียกตัวเอง (recursive) ด้วย jal / jr และ stack
        .text
main:   li   $a0, 5           # n = 5
        jal  fact             # $ra = address ของคำสั่งถัดไป แล้วกระโดดไป fact
        move $s0, $v0         # $s0 = fact(5)
        li   $v0, 1
        move $a0, $s0
        syscall
        li   $v0, 10
        syscall

fact:   addi $sp, $sp, -8     # จองที่บน stack 2 word
        sw   $ra, 4($sp)      # เก็บ return address
        sw   $a0, 0($sp)      # เก็บ n
        slti $t0, $a0, 1      # n < 1 ?
        beq  $t0, $zero, L1   # ไม่ใช่ → ไปคำนวณ n * fact(n - 1)
        li   $v0, 1           # fact(0) = 1
        addi $sp, $sp, 8      # คืนพื้นที่ stack
        jr   $ra
L1:     addi $a0, $a0, -1     # n - 1
        jal  fact             # $v0 = fact(n - 1)
        lw   $a0, 0($sp)      # เอา n กลับมา
        lw   $ra, 4($sp)      # เอา return address กลับมา
        addi $sp, $sp, 8
        mult $a0, $v0         # {HI, LO} = n * fact(n - 1)
        mflo $v0
        jr   $ra
