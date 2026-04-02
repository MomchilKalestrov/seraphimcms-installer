#include "./data.h"

extern uint8_t __start_payload[];
extern uint8_t __stop_payload[];

void *decompressed_data_ptr = NULL;

void decompress_data(void) {
    size_t original_size = ((size_t *)__start_payload)[0];
    size_t compressed_size = ((size_t *)__start_payload)[1];
    void *compressed_data_ptr = (size_t *)__start_payload + 2;

    if (decompressed_data_ptr != NULL) // idk, better be safe than sorry
        free(decompressed_data_ptr);
    decompressed_data_ptr = (uint8_t *)malloc(original_size);
   
    // If it has an error decompressing, we'll get a segfault and exit anyways, so there's need to check for the success
    ZSTD_decompress(decompressed_data_ptr, original_size + 1, compressed_data_ptr, compressed_size);
}

static inline const data_header_t *get_header(void) {
    if (decompressed_data_ptr == NULL) decompress_data();
    return (data_header_t *)decompressed_data_ptr;
}

static inline const data_t *get_data(void) {
    if (decompressed_data_ptr == NULL) decompress_data();
    
    const data_header_t *header = get_header();
    const uint8_t *ptr = (uint8_t *)header + sizeof(data_header_t) + strlen(&header->entrypoint);
    return (const data_t *)ptr;
}