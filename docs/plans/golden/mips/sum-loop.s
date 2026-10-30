# sum-loop.s — หาผลรวม 1 + 2 + ... + 10 ด้วยลูป
        .text
main:   li   $t0, 0           # sum = 0
        li   $t1, 1           # i = 1
        li   $t2, 10          # n = 10
loop:   add  $t0, $t0, $t1    # sum = sum + i
        addi $t1, $t1, 1      # i = i + 1
        ble  $t1, $t2, loop   # ถ้า i <= n วนต่อ (pseudo: slt + beq)
        li   $v0, 1           # syscall 1 = print_int
        move $a0, $t0
        syscall
        li   $v0, 10
        syscall
