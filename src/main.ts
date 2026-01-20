import os from 'node:os';
import { spawnSync } from 'node:child_process';

import isElevated from 'is-elevated';

import setupEnv from './setupEnv/setupEnv.ts';
import setupContainer from './setupContainer/setupContainer.ts';

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
    [ 'win32', 'linux' ].includes(os.platform());

const installDocker = async () =>
    await (await import(`./dockerInstallers/${ os.platform() }.js`)).default();

global.skipToStep = Number(process.argv.pop()) || Infinity;

(async () => {
    if (!isSupportedPlatform()) {
        console.error('Unsupported platform!');
        process.exit(0);
    };
    
    if (!await isElevated()) {
        console.error('Script must be executed with elevated privilidges!');
        process.exit(0);
    };

    console.log('Executing step 1: Installing docker.');

    if (isDockerInstalled() && global.skipToStep >= 1)
        await installDocker();

    console.log('Executing step 2: Setting up environment.');

    if (global.skipToStep >= 2)
        await setupEnv();

    console.log('Executing step 3: Setting up SeraphimCMS.');

    if (global.skipToStep >= 3)
        await setupContainer();

})();