#!/bin/bash

PAYLOAD_PATH=$1

which gcc > /dev/null
if [ $? -ne 0 ]; then
    echo "GCC not found!"
    exit
fi

BASEDIR=$(dirname $0)/..

mkdir -p $BASEDIR/build

objcopy -I binary -O elf64-x86-64 -B i386:x86-64 \
        --rename-section .data=.payload,contents,alloc,load,readonly,data \
        $PAYLOAD_PATH $BASEDIR/build/payload.o

gcc -c $BASEDIR/src/main.c -o $BASEDIR/build/main.o
gcc $BASEDIR/build/main.o $BASEDIR/build/payload.o -T $BASEDIR/src/linker.ld -o $BASEDIR/build/out
chmod +x $BASEDIR/build/out