# array-sum.s — รวมค่าใน array ด้วย lw
        .data
arr:    .word 3, -1, 4, 1, -5, 9
len:    .word 6
        .text
main:   la   $s0, arr         # $s0 = address ของ arr[0]
        la   $t9, len
        lw   $s1, 0($t9)      # $s1 = จำนวนสมาชิก
        li   $s2, 0           # sum = 0
        li   $t0, 0           # i = 0
loop:   beq  $t0, $s1, done   # ครบทุกตัวแล้ว → ออกจากลูป
        sll  $t1, $t0, 2      # offset = i * 4 (1 word = 4 byte)
        add  $t1, $s0, $t1    # address ของ arr[i]
        lw   $t2, 0($t1)      # $t2 = arr[i]
        add  $s2, $s2, $t2    # sum = sum + arr[i]
        addi $t0, $t0, 1      # i = i + 1
        j    loop
done:   li   $v0, 1
        move $a0, $s2
        syscall
        li   $v0, 10
        syscall
