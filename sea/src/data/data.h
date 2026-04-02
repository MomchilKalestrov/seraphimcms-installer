#ifndef __DATA_H

#define __DATA_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <string.h>
#include "../../lib/zstd/lib/zstd.h"

typedef struct __attribute__((__packed__)) data_header {
    bool reserved; // used to be `used`, but useless after adding compression
    size_t count;
    char entrypoint;
} data_header_t;

typedef struct __attribute__((__packed__)) data {
    size_t size;
    uint8_t permissions;
    char *filename;
    uint8_t *data;
} data_t;

static inline const data_header_t *get_header(void);
static inline const data_t *get_data(void);

#include "./data.c"

#endif