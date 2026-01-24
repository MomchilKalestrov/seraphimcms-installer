#include "./data.h"

__attribute__((section(".payload"), used))
const data_header_t __payload = {
    .used = false,
    .count = 0,
    .entrypoint = "echo"
};

static inline const data_header_t get_header(void) {
    return __payload;
}

static inline const data_t *get_data(void) {
    const uint8_t *ptr = (uint8_t *)&__payload + sizeof(data_header_t) + strlen(__payload.entrypoint) + 1;
    return (const data_t *)ptr;
}