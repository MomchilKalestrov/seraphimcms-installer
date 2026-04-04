SECTIONS
{
    .payload : ALIGN(4096) 
    {
        __start_payload = .;
        KEEP(*(payload))
        __stop_payload = .;
    }
}
INSERT AFTER .text;