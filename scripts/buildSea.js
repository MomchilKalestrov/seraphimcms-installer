//@ts-check
import './generateBlob.js';

import os from 'node:os';
import { spawnSync } from 'node:child_process';

import { TARGET_PLATFORM, SLASH } from './constants.js';

const SCRIPT = os.platform() === 'win32'
?   `.${ SLASH }sea${ SLASH }scripts${ SLASH }build.bat`
:   `.${ SLASH }sea${ SLASH }scripts${ SLASH }build.sh`;
const ARGS = TARGET_PLATFORM === 'win32'
?   [ 'payload.bin', '' ]
:   [ 'payload.bin', 'x86_64-w64-mingw32-' ];

const main = () => {
    spawnSync(SCRIPT, ARGS, { stdio: 'inherit' });
};

main();