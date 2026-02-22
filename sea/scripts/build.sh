#!/bin/bash

PAYLOAD_PATH=$1
GCC_PREFIX=$2

BASEDIR=$(dirname $0)/..

mkdir -p $BASEDIR/build

if [[ "$GCC_PREFIX" == *"mingw32"* ]]; then
    ${GCC_PREFIX}objcopy -I binary -O pe-x86-64 -B i386:x86-64 \
        --rename-section .data=.payload,contents,alloc,load,readonly,data \
        $PAYLOAD_PATH $BASEDIR/build/payload.o
else
    ${GCC_PREFIX}objcopy -I binary -O elf64-x86-64 -B i386:x86-64 \
        --rename-section .data=.payload,contents,alloc,load,readonly,data \
        $PAYLOAD_PATH $BASEDIR/build/payload.o
fi

${GCC_PREFIX}gcc -c $BASEDIR/src/main.c -o $BASEDIR/build/main.o
${GCC_PREFIX}gcc $BASEDIR/build/main.o $BASEDIR/build/payload.o -T $BASEDIR/src/linker.ld -o $BASEDIR/build/out