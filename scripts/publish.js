//@ts-check
import './buildSea.js';

import fs from 'node:fs';
import path from 'node:path';

import { TARGET_PLATFORM } from './constants.js';

const [ PUBLISH_SRC, PUBLISH_DEST ] = TARGET_PLATFORM === 'win32'
?   [ path.resolve('sea', 'build', 'out.exe'), path.resolve('publish', 'seraphimcms-win32-installer.exe') ]
:   [ path.resolve('sea', 'build', 'out'), path.resolve('publish', 'seraphimcms-linux-installer') ]

const main = () => {
    fs.mkdirSync('publish', { recursive: true });
    fs.cpSync(PUBLISH_SRC, PUBLISH_DEST);
};

main();