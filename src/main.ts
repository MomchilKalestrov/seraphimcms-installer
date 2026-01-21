import os from 'node:os';
import readline from 'node:readline/promises';
import { spawnSync } from 'node:child_process';

import isElevated from 'is-elevated';

import setupEnv from './setupEnv/setupEnv.ts';
import setupContainer from './setupContainer/setupContainer.ts';

import win32 from './dockerInstallers/win32.ts';
import linux from './dockerInstallers/linux.ts';
import createOwnerUser from './createOwnerUser.ts';

const dockerInstallers: Record<string, () => Promise<void>> = { win32, linux };

global.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const isDockerInstalled = (): boolean => {
    if (os.platform() === 'win32')
        try {
            spawnSync('docker', [ '--version' ]);
            return true;
        } catch {
            return false;
        };
    
    return !spawnSync('which', [ 'docker' ]).status;
};

const isSupportedPlatform = (): boolean =>
    os.platform() in dockerInstallers;

const installDocker = async () =>
    await dockerInstallers[ os.platform() ]!();

global.skipToStep = Number(process.argv.pop()) || -Infinity;

(async () => {
    if (!isSupportedPlatform()) {
        console.error('Unsupported platform!');
        process.exit(0);
    };
    
    if (!await isElevated()) {
        console.error('Script must be executed with elevated privilidges!');
        process.exit(0);
    };

    if (skipToStep <= 1) {
        console.log('Executing step 1: Installing docker.');
        if (isDockerInstalled())
            await installDocker();
    };
    
    if (skipToStep <= 2) {
        console.log('Executing step 2: Setting up environment.');
        await setupEnv();
    };

    if (skipToStep <= 3) {
        console.log('Executing step 3: Setting up SeraphimCMS.');
        await setupContainer();
    };

    if (skipToStep <= 4) {
        console.log('Executing step 4: Creating an owner user.');
        await createOwnerUser();
    };

    global.rl.close();

    process.exit(0);
})();