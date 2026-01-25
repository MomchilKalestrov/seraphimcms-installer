SECTIONS
{
  .text : { *(.text) }
  .data : { *(.data) }
  .bss : { *(.bss) }
  .payload :
    {
        KEEP(*(.payload))
    } >RODATA
}