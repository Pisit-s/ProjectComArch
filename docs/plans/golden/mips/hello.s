# hello.s — พิมพ์ข้อความด้วย syscall
        .data
msg:    .asciiz "Hello, MIPS!\n"
        .text
main:   li   $v0, 4           # syscall 4 = print_string
        la   $a0, msg         # $a0 = address ของข้อความ (pseudo: lui + ori)
        syscall
        li   $v0, 10          # syscall 10 = exit
        syscall
