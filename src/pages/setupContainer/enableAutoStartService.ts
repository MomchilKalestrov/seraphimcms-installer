import os from 'node:os';

import { getInit } from '../../lib/utils.ts';

import init from './enableAutoStartService/init.ts';
import runit from './enableAutoStartService/runit.ts';
import openrc from './enableAutoStartService/openrc.ts';
import systemd from './enableAutoStartService/systemd.ts';

const inits: Record<string, () => void> = {
    init, openrc, runit, systemd
};

const enableAutoStartService = () => {
    if (os.platform() === 'win32') return;
    const init = getInit();
    if (!init) throw 'Unsuported init!';
    inits[ init ]!();
};

export default enableAutoStartService;