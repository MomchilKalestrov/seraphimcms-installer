#include "./mkdir.h"

static int mkdir_p(const char *path) {
    char tmp[1024];
    size_t len;

    snprintf(tmp, sizeof(tmp), "%s", path);
    len = strlen(tmp);

    if (len == 0)
        return -1;

    // Remove trailing separator
    if (tmp[len - 1] == PATH_SEP)
        tmp[len - 1] = '\0';

    for (char *p = tmp + 1; *p; p++) {
        if (*p == '/' || *p == '\\') {
            *p = '\0';
            MKDIR(tmp); // ignore error if exists
            *p = PATH_SEP;
        }
    }

    return MKDIR(tmp); // final one
}

void ensure_parent_dirs(const char *filepath) {
    char path[1024];
    snprintf(path, sizeof(path), "%s", filepath);
    
    char *last_sep = strrchr(path, '/');
#ifdef _WIN32
    char *last_sep2 = strrchr(path, '\\');
    if (!last_sep || (last_sep2 && last_sep2 > last_sep))
        last_sep = last_sep2;
#endif

    if (last_sep) {
        *last_sep = '\0';
        mkdir_p(path);
    }
}
