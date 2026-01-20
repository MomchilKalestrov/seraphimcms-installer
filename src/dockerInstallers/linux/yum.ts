import { spawnSync } from 'node:child_process';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
    spawnSync('yum', [ 'install', '-y', 'yum-utils' ]);
    spawnSync('yum-config-manager', [ '--add-repo', 'https://download.docker.com/linux/centos/docker-ce.repo' ]);
    spawnSync('yum', [ 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);

    await enableDockerService();
};

export default installDocker;