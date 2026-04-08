//@ts-check
import './buildSea.js';

import fs from 'node:fs';

import { SLASH, TARGET_PLATFORM } from './constants.js';

const [ PUBLISH_SRC, PUBLISH_DEST ] = TARGET_PLATFORM === 'win32'
?   [ `sea${SLASH }build${ SLASH }out.exe`, `publish${ SLASH }seraphimcms-win32-installer.exe` ]
:   [ `sea${SLASH }build${ SLASH }out`, `publish${ SLASH }seraphimcms-linux-installer` ]

const main = () => {
    fs.mkdirSync('publish', { recursive: true });
    fs.cpSync(PUBLISH_SRC, PUBLISH_DEST);
};

main();