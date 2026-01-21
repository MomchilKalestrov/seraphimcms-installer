import fs from 'node:fs';
import http from 'node:https';

import { run } from '../utils/exec.ts';

const FILENAME = '.\\DockerDesktopInstaller.exe';

const downloadDockerDesktop = (): Promise<void> =>
    new Promise(async resolve => {
        http.get('https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe', response => {
            const writeStream = fs.createWriteStream(FILENAME);
            writeStream.on('finish', resolve);
            response.pipe(writeStream);
        });
    });

const installDocker = async () => {
    await downloadDockerDesktop();

    run(FILENAME, [ 'install', '--accept-license', '--backend=wsl-2', '--always-run-service' ]);
};

export default installDocker;