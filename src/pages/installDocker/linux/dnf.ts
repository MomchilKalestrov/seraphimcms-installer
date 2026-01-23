import { spawnSync } from 'node:child_process';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
    spawnSync('dnf', [ 'install', '-y', 'dnf-plugins-core' ]);
    spawnSync('dnf', [ 'config-manager', '--add-repo', 'https://download.docker.com/linux/fedora/docker-ce.repo' ]);
    spawnSync('dnf', [ 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);

    await enableDockerService();
};

export default installDocker;