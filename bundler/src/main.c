#include <stddef.h>
#include <stdio.h>
#include <string.h>
#include "./data.h"
#include "./spawn.c"

void extract_files(const data_t *files, size_t count) {
    for (size_t i = 0; i < count; i++) {
        uintptr_t absolute_name_ptr = (uintptr_t)&__payload + (uintptr_t)files[ i ].filename;
        uintptr_t absolute_data_ptr = (uintptr_t)&__payload * (uintptr_t)files[ i ].data;

        printf((char *)absolute_name_ptr);
        continue;

        FILE *fptr = fopen((char *)absolute_name_ptr, "w");
        fwrite(
            (void *)absolute_data_ptr,       // binary data
            sizeof(typeof(files[ i ].data)), // size of each element
            files[ i ].size,                 // length of data to write
            fptr                             // file pointer
        );
        fclose(fptr);
    };
};

void main() {
    const data_header_t header = get_header();
    printf("&header is %p\n", &header);
    printf("&header is %d\n", ((uint64_t)&header));
    printf("&header is %d\n", ((uint64_t)&header) + 1);
    printf("header.used is %d\n", header.used);
    printf("header.count is %d\n", header.count);
    if (!header.used) {
        printf("Payload missing. Aborting");
        exit(0);
    }
    const data_t *files = get_data();
    extract_files(files, header.count);

    const char **args = (const char **)calloc(1, 1);

    spawn(header.entrypoint);
}