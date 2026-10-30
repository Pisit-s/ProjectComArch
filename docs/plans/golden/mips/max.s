# max.s — หาค่ามากที่สุดใน array ด้วย bge / ble (pseudo-instruction)
        .data
arr:    .word 12, -7, 45, 3, 45, 0, 28
n:      .word 7
        .text
main:   la   $s0, arr         # $s0 = address ของ arr[0]
        la   $t9, n
        lw   $s1, 0($t9)      # $s1 = จำนวนสมาชิก
        lw   $s2, 0($s0)      # max = arr[0]
        li   $t0, 1           # i = 1
loop:   bge  $t0, $s1, done   # i >= n → จบ (pseudo: slt + beq)
        sll  $t1, $t0, 2
        add  $t1, $s0, $t1
        lw   $t2, 0($t1)      # $t2 = arr[i]
        ble  $t2, $s2, skip   # arr[i] <= max → ไม่ต้องเปลี่ยน
        move $s2, $t2         # max = arr[i]
skip:   addi $t0, $t0, 1
        j    loop
done:   li   $v0, 1
        move $a0, $s2
        syscall
        li   $v0, 10
        syscall
