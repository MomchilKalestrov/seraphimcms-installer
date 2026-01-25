import { spawn, spawnSync, type SpawnOptions } from 'node:child_process';

const inits = [ 'init', 'openrc', 'runit', 'systemd' ];

export const getInit = (): string | undefined => {
    const init = spawnSync('ps', [ '-p', '1', '-o', 'comm=' ]).stdout.toString().trim();
    return inits.includes(init) ? init : undefined;
};

export const run = (command: string, args: string[], options: SpawnOptions & { input?: string | Buffer } = {}) =>
    new Promise((resolve, reject) => {
        const { input, ...spawnOptions } = options;
        const process = spawn(command, args, { stdio: 'inherit', ...spawnOptions });

        if (input) {
            process.stdin?.write(input);
            process.stdin?.end();
        }

        process.on('error', reject);
        process.on('close', code => {
            if (code === 0) resolve(code);
            else reject(new Error('Process exited with ' + code))
        });
    });