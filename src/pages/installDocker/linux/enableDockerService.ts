import { getInit } from '../../../lib/utils.ts';
import locale from '../../../lib/texts.ts';

import init from './enableDockerService/init.ts';
import runit from './enableDockerService/runit.ts';
import openrc from './enableDockerService/openrc.ts';
import systemd from './enableDockerService/systemd.ts';

const inits: Record<string, () => void> = {
    init, openrc, runit, systemd
};

const enableDockerService = async () => {
    const init = getInit();
    if (!init) throw locale.pages.installDocker.errors.unsupportedInit;
    inits[ init ]!();
};

export default enableDockerService;