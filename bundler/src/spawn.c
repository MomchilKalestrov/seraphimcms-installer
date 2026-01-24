#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#ifdef _WIN32
#include <windows.h>
#elifdef __linux__
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#endif

void spawn(const char *command) {
    #ifdef _WIN32
    STARTUPINFOA si;
    PROCESS_INFORMATION pi;

    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    ZeroMemory(&pi, sizeof(pi));

    // Command line MUST be mutable (Windows may modify it)
    char *copy = (char *)calloc(sizeof(char), strlen(command) + 1);
    strcpy(copy, command);

    CreateProcessA(
        NULL,
        copy,
        NULL,
        NULL,
        FALSE,
        0,
        NULL,
        NULL,
        &si,
        &pi,
    );

    WaitForSingleObject(pi.hProcess, INFINITE);

    CloseHandle(pi.hThread);
    CloseHandle(pi.hProcess);

    free(copy);
    #elifdef __linux__
    pid_t pid = fork();

    if (pid < 0) return;

    if (pid == 0) {
        execl("/bin/sh", "sh", "-c", command);
        _exit(127);
    }

    waitpid(pid, NULL, 0);
    #endif
}