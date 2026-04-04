#!/bin/bash

BASEDIR=$(dirname $0)/..
PAYLOAD_PATH=$1
GCC_PREFIX=$2
ZSTD_PATH=$BASEDIR/lib/zstd/lib/libzstd.a

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

function build_zstd {
    make -C $BASEDIR/lib/zstd/lib ZSTD_LIB_COMPRESSION=0 ZSTD_LIB_DECOMPRESSION=1 CC=${GCC_PREFIX}gcc AR=${GCC_PREFIX}ar
}

function build_binary { 
    ${GCC_PREFIX}gcc \
        $BASEDIR/src/data/data.c \
        $BASEDIR/src/mkdir/mkdir.c \
        $BASEDIR/src/main.c \
        $ZSTD_PATH $ICON_OBJECT $BASEDIR/build/payload.o \
        -T $BASEDIR/src/linker.ld \
        -o $BASEDIR/build/out
}

function generate_icon_windows {
    cat > $BASEDIR/build/icon.rc <<< "1 ICON \"$BASEDIR/src/icon.ico\""
    ${GCC_PREFIX}windres $BASEDIR/build/icon.rc -O coff -o $BASEDIR/build/icon.o
    echo $BASEDIR/build/icon.o
}

echo Building ZSTD
build_zstd

echo Preparing \`payload.o\` 
if [[ "$GCC_PREFIX" == *"mingw32"* ]]; then
    prepare_payload_windows
    ICON_OBJECT=$(generate_icon_windows)
else prepare_payload_linux; fi

echo Building binary
build_binary

echo Compilation complete