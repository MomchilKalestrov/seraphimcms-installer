import os from 'node:os';
import { spawnSync } from 'node:child_process';

import { getInit } from '../../lib/utils.ts';

import init from './enableAutoStartService/init.ts';
import runit from './enableAutoStartService/runit.ts';
import openrc from './enableAutoStartService/openrc.ts';
import systemd from './enableAutoStartService/systemd.ts';

const inits: Record<string, () => void> = {
    init, openrc, runit, systemd
};

const linux = () => {
    const init = getInit();
    if (!init) throw 'Unsuported init!';
    inits[ init ]!();
};

const win32 = () => {
    const { error } = spawnSync('schtasks', [
        '/Create', 
        '/TN', '"DockerDesktopAutostart"',
        '/TR', '"\\"C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe\\""',
        '/SC', 'ONSTART',
        '/RU', 'SYSTEM',
        '/RL', 'HIGHEST',
        '/F'
    ]);
    
    if (error) throw error.message;
};

const platforms: Record<string, () => void> = { linux, win32 };

const enableAutoStartService = () => platforms[ os.platform() ]!();

export default enableAutoStartService;