import dns from 'node:dns';
import fs from 'node:fs/promises';

import { run } from '../../../lib/utils.ts';
import download from '../../../lib/download.ts';

dns.setDefaultResultOrder('ipv4first');

const getDistroInfo = async (): Promise<{ distro: string, codename: string }> => {
    const osRelease = await fs.readFile('/etc/os-release', { encoding: 'utf8' });

    const distroMatch = osRelease.match(/^ID=(.*)$/m);
    if (!distroMatch)
        throw new Error('Could not determine ID from /etc/os-release');
    const distro = distroMatch[ 1 ]!.trim().replace(/^"|"$/g, '');

    const codenameMatch = osRelease.match(/^(?:VERSION_CODENAME|UBUNTU_CODENAME)=(.*)$/m);
    if (!codenameMatch)
        throw new Error('Could not determine VERSION_CODENAME or UBUNTU_CODENAME from /etc/os-release');
    const codename = codenameMatch[ 1 ]!.trim().replace(/^"|"$/g, '');

    return { distro, codename };
};

const installDocker = async () => {
    await run('apt', [ 'update' ]);
    await run('apt', [ 'install', '-y', 'ca-certificates', 'curl' ]);

    await run('install', [ '-m', '0755', '-d', '/etc/apt/keyrings' ]);

    const { distro, codename } = await getDistroInfo();

    const gpgKey = await download(
        `https://download.docker.com/linux/${ distro }/gpg`,
        progress => console.log(`${ progress }%`)
    );
    await fs.writeFile('/etc/apt/keyrings/docker.asc', gpgKey);
    await run('chmod', [ 'a+r', '/etc/apt/keyrings/docker.asc' ]);

    const dockerListLines = [
        'Types: deb',
        `URIs: https://download.docker.com/linux/${ distro }`,
        `Suites: ${ codename }`,
        'Components: stable',
        'Signed-By: /etc/apt/keyrings/docker.asc',
    ];

    await fs.writeFile(
        '/etc/apt/sources.list.d/docker.sources',
        dockerListLines.join('\n') + '\n',
        { encoding: 'utf8' }
    );

    await run('apt', [ 'update']);
    await run('apt', [ 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);
};

export default installDocker;