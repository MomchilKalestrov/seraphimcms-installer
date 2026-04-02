#ifndef _MKDIR_H

#define _MKDIR_H

#include <stdio.h>
#include <string.h>

#ifdef _WIN32
#include <direct.h>
#define MKDIR(path) _mkdir(path)
#define PATH_SEP '\\'
#else
#include <sys/stat.h>
#include <sys/types.h>
#include <errno.h>
#define MKDIR(path) mkdir(path, 0755)
#define PATH_SEP '/'
#endif

static int mkdir_p(const char *path);
void ensure_parent_dirs(const char *filepath);

#include "./mkdir.c"

#endif