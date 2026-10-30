# div-signs.s — กฎเครื่องหมายของการหาร: เศษมีเครื่องหมายเดียวกับตัวตั้ง (Dividend)
        .text
main:   li   $t0, 7
        li   $t1, 2
        div  $t0, $t1         # +7 / +2
        mflo $s0              # +3
        mfhi $s1              # +1
        li   $t0, -7
        div  $t0, $t1         # -7 / +2
        mflo $s2              # -3
        mfhi $s3              # -1
        li   $t0, 7
        li   $t1, -2
        div  $t0, $t1         # +7 / -2
        mflo $s4              # -3
        mfhi $s5              # +1
        li   $t0, -7
        div  $t0, $t1         # -7 / -2
        mflo $s6              # +3
        mfhi $s7              # -1
        li   $v0, 10
        syscall
