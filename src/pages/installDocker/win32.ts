import fs from 'node:fs';
import http from 'node:https';

import { spawnSync } from 'node:child_process';

const FILENAME = '.\\DockerDesktopInstaller.exe';

const downloadDockerDesktop = (): Promise<void> =>
    new Promise(async resolve => {
        http.get('https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe', response => {
            const writeStream = fs.createWriteStream(FILENAME);
            writeStream.on('finish', resolve);
            response.pipe(writeStream);
        });
    });


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
    await downloadDockerDesktop();
    spawnSync(FILENAME, [ 'install', '--accept-license', '--backend=wsl-2', '--always-run-service' ]);
    enableDockerService();
};

export default installDocker;