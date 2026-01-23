import { spawnSync } from 'node:child_process';

const inits = [ 'init', 'openrc', 'runit', 'systemd' ];

export const getInit = (): string | undefined => {
    const init = spawnSync('ps', [ '-p', '1', '-o', 'comm=' ]).stdout.toString().trim();
    return inits.includes(init) ? init : undefined;
};