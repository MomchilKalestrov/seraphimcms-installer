import { execSync } from 'node:child_process';

import init from './enableDockerService/init.ts';
import runit from './enableDockerService/runit.ts';
import openrc from './enableDockerService/openrc.ts';
import systemd from './enableDockerService/systemd.ts';

const inits: Record<string, () => void> = {
    init, openrc, runit, systemd
};

const getInit = (): string | undefined => {
    const init = execSync('ps -p 1 -o comm=', { encoding: 'utf8' }).trim();
    return init in inits ? init : undefined;
};

const enableDockerService = async () => {
    const init = getInit();

    if (!init) throw 'Unsuported init!';

    inits[ init ]!();
};

export default enableDockerService;