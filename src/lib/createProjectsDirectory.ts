import os from 'node:os';
import * as fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { ownPath } from './utils.ts';
import { ASSETS_PATH, GROUP_NAME, BLOB_FS_PATH } from './constants.ts';
import path from 'node:path';

const createGroup = () =>
    spawnSync('groupadd', [ '-f', GROUP_NAME ]);

const addToGroup = () => {
    const uid = process.env.PKEXEC_UID ?? process.env.SUDO_UID;
    if (!uid) return console.warn('WARNING: UNABLE TO DETERMINE THE USER\'S UID. WILL NOT ADD TO THE GROUP!');

    const res = spawnSync('getent', [ 'passwd', uid ]);
    if (!res.status) return console.warn('WARNING: UNABLE TO DETERMINE THE USER\'S NAME. WILL NOT ADD TO THE GROUP!');
    
    const username = res.stdout.toString().split(':')[ 0 ];

    spawnSync('usermod', [ '-a', '-G', GROUP_NAME, username! ]);
};

export const createProjectDirectory = () => {
    fs.mkdirSync(ASSETS_PATH, { recursive: true });
    fs.mkdirSync(BLOB_FS_PATH, { recursive: true });

    if (os.platform() !== 'win32') {
        createGroup();
        addToGroup();
        ownPath(ASSETS_PATH);
        ownPath(BLOB_FS_PATH);
    };
};