import { spawnSync } from 'node:child_process';

import apk from './linux/apk.ts';
import apt from './linux/apt.ts';
import dnf from './linux/dnf.ts';
import yum from './linux/yum.ts';
import zypper from './linux/zypper.ts';
import pacman from './linux/pacman.ts';
import xbpsInstall from './linux/xbps-install.ts';
import enableDockerService from './linux/enableDockerService.ts';
import locale from '../../lib/texts.ts';

const packageManagers: Record<string, () => Promise<void>> = {
    apk, apt, dnf, yum, zypper, pacman, 'xbps-install': xbpsInstall
};

const getPM = () =>
    Object.keys(packageManagers)
        .find(pm => !spawnSync('which', [ pm ]).status);

const installDocker = async () => {
    const pm = getPM();
    if (!pm) throw locale.pages.installDocker.errors.unsupportedPackageManager;
    await packageManagers[ pm ]!();
    await enableDockerService();
};

export default installDocker;