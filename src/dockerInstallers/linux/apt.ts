import fs from 'node:fs/promises';

import { run } from '../../utils/exec.ts';
import { capture } from '../../utils/exec.ts';
import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
    const fetchBuffer = async (url: string): Promise<Buffer> => {
        const response = await fetch(url);

        if (!response.ok)
            throw new Error(`Failed to fetch ${ url }: ${ response.status } ${ response.statusText }`);

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    };

    const getVersionCodename = async (): Promise<string> => {
        const osRelease = await fs.readFile('/etc/os-release', { encoding: 'utf8' });

        const match = osRelease.match(/^(?:VERSION_CODENAME|UBUNTU_CODENAME)=(.*)$/m);
        if (!match)
            throw new Error('Could not determine VERSION_CODENAME from /etc/os-release');

        return match[ 1 ]!.trim().replace(/^"|"$/g, '');
    };

    run('apt', [ 'update' ]);
    run('apt', [ 'install', '-y', 'ca-certificates', 'gnupg' ]);

    run('install', [ '-m', '0755', '-d', '/etc/apt/keyrings' ]);

    const gpgKey = await fetchBuffer('https://download.docker.com/linux/ubuntu/gpg');
    run('gpg', [ '--batch', '--dearmor', '-o', '/etc/apt/keyrings/docker.gpg' ], { input: gpgKey });

    const arch = (await capture('dpkg', [ '--print-architecture' ])).trim();
    const codename = await getVersionCodename();

    const dockerListLine =
        `deb [arch=${ arch } signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${ codename } stable\n`;

    await fs.writeFile('/etc/apt/sources.list.d/docker.list', dockerListLine, { encoding: 'utf8' });

    run('apt', ['update']);
    run('apt', ['install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io']);

    await enableDockerService();
};

export default installDocker;