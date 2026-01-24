SECTIONS
{
  .text : { *(.text) }
  .data : { *(.data) }
  .bss : { *(.bss) }
  .payload : { *(.payload) }
}