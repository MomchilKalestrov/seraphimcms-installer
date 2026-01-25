SECTIONS
{
    /* We place our payload after the read-only data segment */
    .payload : ALIGN(4096) 
    {
        __start_payload = .;
        KEEP(*(payload))
        __stop_payload = .;
    }
}
/* This tells ld to append this to the standard default script */
INSERT AFTER .rodata;