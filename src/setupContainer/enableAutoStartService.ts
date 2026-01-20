import { run } from '../utils/exec.ts';

import init from './enableAutoStartService/init.ts';
import runit from './enableAutoStartService/runit.ts';
import openrc from './enableAutoStartService/openrc.ts';
import systemd from './enableAutoStartService/systemd.ts';

const inits: Record<string, () => void> = {
    init, openrc, runit, systemd
};

const getInit = (): string | undefined => {
    const init = run('ps', [ '-p', '1', '-o', 'comm=' ], { encoding: 'utf8' }).trim();
    return init in inits ? init : undefined;
};

const enableAutoStartService = async () => {
    const init = getInit();

    if (!init) {
        console.error('Unsuported init!');
        process.exit(0);
    };

    inits[ init ]!();
};

export default enableAutoStartService;