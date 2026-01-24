#!/bin/bash

which gcc > /dev/null
if [ $? -ne 0 ]; then
    echo "GCC not found!"
    exit
fi

mkdir -p build 

gcc -T src/linker.ld -c src/main.c -o build/a.o
gcc build/a.o -o build/out
chmod +x build/out