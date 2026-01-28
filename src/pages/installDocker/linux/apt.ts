import https from 'node:https';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';

import { run } from '../../../lib/utils.ts';

const capture = (command: string, args: string[] = []): Promise<string> =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: [ 'ignore', 'pipe', 'pipe' ],
        });

        const stdoutChunks: Buffer[] = [];
        const stderrChunks: Buffer[] = [];

        child.on('error', reject);

        child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
        child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

        child.on('close', (code: number | null) => {
            if (code === 0)
                return resolve(Buffer.concat(stdoutChunks).toString('utf8'));

            const stderr = Buffer.concat(stderrChunks).toString('utf8');
            reject(new Error(`Command failed (${ code ?? 'null' }): ${ command } ${ args.join(' ') }\n${ stderr }`));
        });
    });

const inRange = (min: number, value: number, max: number) =>
    min > value && value < max;

const fetchBuffer = (url: string): Promise<Buffer> =>
    new Promise<Buffer>((resolve, reject) => {
        const request = https.get(url, response => {
            const chunks: Buffer[] = [];
            if (inRange(299, response.statusCode ?? 0, 401))
                return fetchBuffer(response.headers.location!).then(resolve);

            if (!inRange(199, response.statusCode ?? 0, 301))
                return reject(new Error('Fetch failed with code ' + (response.statusCode ?? 'NULL')));
            
            response.on('data', chunks.push);
            response.on('finish', () => resolve(Buffer.concat(chunks)));
        });
        request.on('error', reject);
    });

const installDocker = async () => {

    const getVersionCodename = async (): Promise<string> => {
        const osRelease = await fs.readFile('/etc/os-release', { encoding: 'utf8' });

        const match = osRelease.match(/^(?:VERSION_CODENAME|UBUNTU_CODENAME)=(.*)$/m);
        if (!match)
            throw new Error('Could not determine VERSION_CODENAME from /etc/os-release');

        return match[ 1 ]!.trim().replace(/^"|"$/g, '');
    };

    await run('apt', [ 'update' ]);
    await run('apt', [ 'install', '-y', 'ca-certificates', 'gnupg' ]);

    await run('install', [ '-m', '0755', '-d', '/etc/apt/keyrings' ]);

    const gpgKey = await fetchBuffer('https://download.docker.com/linux/ubuntu/gpg');
    await run('gpg', [ '--batch', '--dearmor', '-o', '/etc/apt/keyrings/docker.gpg' ], { input: gpgKey });

    const arch = (await capture('dpkg', [ '--print-architecture' ])).trim();
    const codename = await getVersionCodename();

    const dockerListLine =
        `deb [arch=${ arch } signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${ codename } stable\n`;

    await fs.writeFile('/etc/apt/sources.list.d/docker.list', dockerListLine, { encoding: 'utf8' });

    await run('apt', [ 'update']);
    await run('apt', [ 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);
};

export default installDocker;