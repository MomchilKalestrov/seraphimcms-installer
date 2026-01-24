#ifndef __DATA_H

#define __DATA_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <string.h>


typedef struct __attribute__((__packed__)) {
    bool used;
    size_t count;
    char entrypoint[];
} data_header_t;

typedef struct __attribute__((__packed__)) {
    size_t size;
    char *filename;
    uint8_t *data;
} data_t;

static inline const data_header_t get_header(void);
static inline const data_t *get_data(void);

#include "./data.c"

#endif