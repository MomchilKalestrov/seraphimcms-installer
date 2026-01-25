#include <stdio.h>
#include <stdlib.h>
#include <stddef.h>
#include <string.h>

#include "./data/data.h"
#include "./mkdir/mkdir.h"

void extract_files(const data_t *files, size_t count) {
    for (size_t i = 0; i < count; i++) {
        uintptr_t absolute_name_ptr = (uintptr_t)&__start_payload + (uintptr_t)files[ i ].filename;
        uintptr_t absolute_data_ptr = (uintptr_t)&__start_payload + (uintptr_t)files[ i ].data;

        ensure_parent_dirs((char *)absolute_name_ptr);

        printf("files[ %d ].filename is %s\n", i, absolute_name_ptr);
        printf("files[ %d ].permissions is %o\n", i, files[ i ].permissions);
        printf("files[ %d ].size is %d\n", i, files[ i ].size);
        printf("---\n");

        FILE *fptr = fopen((char *)absolute_name_ptr, "wb");

        if (!fptr) {
            printf("Failed to extract file: %s\n", absolute_name_ptr);
            continue;
        };

        fwrite(
            (void *)absolute_data_ptr, // binary data
            1,                         // size of each element
            files[ i ].size,           // length of data to write
            fptr                       // file pointer
        );
        #ifdef __linux__
        chmod(
            (char *)absolute_name_ptr,
            files[ i ].permissions |
            files[ i ].permissions << 3 |
            files[ i ].permissions << 6
        );
        #endif
        fclose(fptr);
    };
};

void main() {
    const data_header_t *header = get_header();
    if (!header->used) {
        printf("Payload missing. Aborting");
        exit(0);
    }

    printf("header is %p\n", header);
    printf("header->count is %d\n", header->count);
    printf("header->entrypoint is %s\n", &header->entrypoint);
    printf("--\n");

    const data_t *files = get_data();
    extract_files(files, header->count);
    
    system(&header->entrypoint);
}