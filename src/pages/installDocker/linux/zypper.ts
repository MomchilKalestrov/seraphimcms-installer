import { spawnSync } from 'node:child_process';

const installDocker = async () => {
    spawnSync('zypper', [ 'addrepo', 'https://download.docker.com/linux/opensuse/docker-ce.repo' ]);
    spawnSync('zypper', [ 'refresh' ]);
    spawnSync('zypper', [ 'install', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);
};

export default installDocker;