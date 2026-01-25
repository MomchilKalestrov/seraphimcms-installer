import { getInit } from '../../../lib/utils.ts';

import init from './enableDockerService/init.ts';
import runit from './enableDockerService/runit.ts';
import openrc from './enableDockerService/openrc.ts';
import systemd from './enableDockerService/systemd.ts';

const inits: Record<string, () => void> = {
    init, openrc, runit, systemd
};

const enableDockerService = async () => {
    const init = getInit();
    if (!init) throw 'Unsuported init!';
    inits[ init ]!();
};

export default enableDockerService;