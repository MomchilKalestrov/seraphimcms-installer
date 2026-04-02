#include <stdio.h>
#include <stdlib.h>
#include <stddef.h>
#include <string.h>

#ifdef __linux__
#include <sys/stat.h>
#include <sys/ioctl.h>
#endif

#ifdef _WIN32
#include <windows.h>
#endif

#include "./data/data.h"
#include "./mkdir/mkdir.h"

size_t window_width = 80;

void print_progress(size_t current, size_t total) {
    size_t progress_bar_width = window_width - 2;
    float progress = (float)current / (float)total;

    printf("\33[2k\r"); // clears the previous text
    printf("[");
    for (size_t i = 0; i < (size_t)(progress * (float)progress_bar_width); i++)
        printf("#");
    for (size_t i = 0; i < progress_bar_width - 1 - (size_t)(progress * (float)progress_bar_width); i++)
        printf("-");
    printf("]");
}

void extract_files(const data_t *files, size_t count) {
    for (size_t i = 0; i < count; i++) {
        uintptr_t absolute_name_ptr = (uintptr_t)decompressed_data_ptr + (uintptr_t)files[ i ].filename;
        uintptr_t absolute_data_ptr = (uintptr_t)decompressed_data_ptr + (uintptr_t)files[ i ].data;

        print_progress(i, count);

        ensure_parent_dirs((char *)absolute_name_ptr);
        
        FILE *fptr = fopen((char *)absolute_name_ptr, "wb");

        if (!fptr) {
            printf("Failed to extract file: %s\n", absolute_name_ptr);
            continue;
        }

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
    }
}

size_t get_console_width(void) {
#ifdef _WIN32
    CONSOLE_SCREEN_BUFFER_INFO csbi;
    GetConsoleScreenBufferInfo(GetStdHandle(STD_OUTPUT_HANDLE), &csbi);
    return csbi.srWindow.Right - csbi.srWindow.Left + 1;
#else
    struct winsize w;
    ioctl(0, TIOCGWINSZ, &w);
    return w.ws_col;
#endif
}

void main() {
    window_width = get_console_width();

    const data_header_t *header = get_header();

    printf("Decompressing, please wait.\n");

    const data_t *files = get_data();
    extract_files(files, header->count);
    
    system(&header->entrypoint);
}