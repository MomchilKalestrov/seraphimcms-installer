//@ts-check
import './generateBlob.js';

import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { TARGET_PLATFORM } from './constants.js';

const SCRIPT = path.join('sea', 'scripts', os.platform() === 'win32' ? 'build.bat' : 'build.sh');
const ARGS = TARGET_PLATFORM === 'win32'
?   [ 'payload.bin', '' ]
:   [ 'payload.bin', 'x86_64-w64-mingw32-' ];

const main = () => {
    if (os.platform() === 'win32' && TARGET_PLATFORM !== 'win32')
        throw new Error('ERROR: IF YOU WANT TO CROSS-COMPILE FOR LINUX, PLEASE USE WSL2');
    spawnSync(SCRIPT, ARGS, { stdio: 'inherit' });
};

main();