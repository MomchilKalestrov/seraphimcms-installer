import path from 'node:path';
import { spawnSync } from 'node:child_process';

import download from '../../lib/download.ts';
import { ASSETS_PATH } from '../../lib/constants.ts';

const FILENAME = 'DockerDesktopInstaller.exe';

const enableDockerService = () => {
    const { error } = spawnSync('schtasks', [
        '/Create', 
        '/TN', '"DockerDesktopAutostart"',
        '/TR', '"\\"C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe\\""',
        '/SC', 'ONSTART',
        '/RU', 'SYSTEM',
        '/RL', 'HIGHEST',
        '/F'
    ]);
    
    if (error) throw error.message;
};

const installDocker = async () => {
    await download(
        'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
        path.resolve(ASSETS_PATH, FILENAME)
    );
    spawnSync(FILENAME, [ 'install', '--accept-license', '--backend=wsl-2', '--always-run-service' ]);
    enableDockerService();
};

export default installDocker;