import { spawnSync } from 'node:child_process';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
    spawnSync('zypper', [ 'addrepo', 'https://download.docker.com/linux/opensuse/docker-ce.repo' ]);
    spawnSync('zypper', [ 'refresh' ]);
    spawnSync('zypper', [ 'install', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);

    await enableDockerService();
};

module.exports.default = installDocker;