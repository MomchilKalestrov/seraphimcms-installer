#!/bin/bash


which gcc > /dev/null
if [ $? -ne 0 ]; then
    echo "GCC not found!"
    exit
fi

BASEDIR=$(dirname $0)/..
echo $BASEDIR

mkdir -p $BASEDIR/build 

gcc -T $BASEDIR/src/linker.ld -c $BASEDIR/src/main.c -o $BASEDIR/build/a.o
gcc $BASEDIR/build/a.o -o $BASEDIR/build/out
chmod +x $BASEDIR/build/out