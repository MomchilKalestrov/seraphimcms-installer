#include "./data.h"

extern uint8_t __start_payload[];
extern uint8_t __stop_payload[];

static inline const data_header_t *get_header(void) {
    return (data_header_t *)__start_payload;
}

static inline const data_t *get_data(void) {
    const data_header_t *header = get_header();
    const uint8_t *ptr = (uint8_t *)header + sizeof(data_header_t) + strlen(&header->entrypoint);
    return (const data_t *)ptr;
}