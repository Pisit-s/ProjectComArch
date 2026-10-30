# io.s — รับตัวเลข 2 ตัวจาก Console แล้วพิมพ์ผลบวก
        .data
p1:     .asciiz "a = "
p2:     .asciiz "b = "
res:    .asciiz "a + b = "
        .text
main:   li   $v0, 4
        la   $a0, p1
        syscall
        li   $v0, 5           # syscall 5 = read_int → ค่าอยู่ใน $v0
        syscall
        move $s0, $v0
        li   $v0, 4
        la   $a0, p2
        syscall
        li   $v0, 5
        syscall
        move $s1, $v0
        add  $s2, $s0, $s1
        li   $v0, 4
        la   $a0, res
        syscall
        li   $v0, 1
        move $a0, $s2
        syscall
        li   $v0, 10
        syscall
