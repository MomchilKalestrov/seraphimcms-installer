#!/bin/bash
set -e

BASE_DIR=$(dirname $0)/..
PAYLOAD_PATH=$1
GCC_PREFIX=$2
ZSTD_PATH=$BASE_DIR/lib/zstd/lib/libzstd.a

mkdir -p $BASE_DIR/build

function prepare_payload_windows {
    ${GCC_PREFIX}objcopy -I binary -O pe-x86-64 -B i386:x86-64 \
        --rename-section .data=.payload,contents,alloc,load,readonly,data \
        $PAYLOAD_PATH $BASE_DIR/build/payload.o
}

function prepare_payload_linux {
    ${GCC_PREFIX}objcopy -I binary -O elf64-x86-64 -B i386:x86-64 \
        --rename-section .data=.payload,contents,alloc,load,readonly,data \
        $PAYLOAD_PATH $BASE_DIR/build/payload.o
}

function prepare_zstd {
    file $BASE_DIR/lib/zstd > /dev/null 2> /dev/null
    if [ $? = 1 ]; then
        mkdir -p $BASE_DIR/lib/zstd
        git clone https://github.com/facebook/zstd.git $BASE_DIR/lib/zstd
    fi
    make -C $BASE_DIR/lib/zstd/lib ZSTD_LIB_COMPRESSION=0 ZSTD_LIB_DECOMPRESSION=1 CC=${GCC_PREFIX}gcc AR=${GCC_PREFIX}ar
}

function build_binary { 
    ${GCC_PREFIX}gcc \
        $BASE_DIR/src/data/data.c \
        $BASE_DIR/src/mkdir/mkdir.c \
        $BASE_DIR/src/main.c \
        $ZSTD_PATH $ICON_OBJECT $BASE_DIR/build/payload.o \
        -T $BASE_DIR/src/linker.ld \
        -o $BASE_DIR/build/out
}

function generate_icon_windows {
    cat > $BASE_DIR/build/icon.rc <<< "1 ICON \"$BASE_DIR/src/icon.ico\""
    ${GCC_PREFIX}windres $BASE_DIR/build/icon.rc -O coff -o $BASE_DIR/build/icon.o
    echo $BASE_DIR/build/icon.o
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