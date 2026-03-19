#!/bin/bash

PAYLOAD_PATH=$1
GCC_PREFIX=$2

BASEDIR=$(dirname $0)/..

mkdir -p $BASEDIR/build

function prepare_payload_windows {
    ${GCC_PREFIX}objcopy -I binary -O pe-x86-64 -B i386:x86-64 \
        --rename-section .data=.payload,contents,alloc,load,readonly,data \
        $PAYLOAD_PATH $BASEDIR/build/payload.o
}

function prepare_payload_linux {
    ${GCC_PREFIX}objcopy -I binary -O elf64-x86-64 -B i386:x86-64 \
        --rename-section .data=.payload,contents,alloc,load,readonly,data \
        $PAYLOAD_PATH $BASEDIR/build/payload.o
}

function build_binary {
    ${GCC_PREFIX}gcc -c $BASEDIR/src/main.c -o $BASEDIR/build/main.o
    ${GCC_PREFIX}gcc $BASEDIR/build/main.o $ICON_OBJECT $BASEDIR/build/payload.o -T $BASEDIR/src/linker.ld -o $BASEDIR/build/out
}

function generate_icon_windows {
    cat > $BASEDIR/build/icon.rc <<< "1 ICON \"$BASEDIR/src/icon.ico\""
    ${GCC_PREFIX}windres $BASEDIR/build/icon.rc -O coff -o $BASEDIR/build/icon.o
    echo $BASEDIR/build/icon.o
}

if [[ "$GCC_PREFIX" == *"mingw32"* ]]; then
    prepare_payload_windows
    ICON_OBJECT=$(generate_icon_windows)
    build_binary
else
    prepare_payload_linux
    build_binary
fi
