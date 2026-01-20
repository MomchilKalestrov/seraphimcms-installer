import { run } from '../../utils/exec.ts';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
    run('zypper', [ 'addrepo', 'https://download.docker.com/linux/opensuse/docker-ce.repo' ]);
    run('zypper', [ 'refresh' ]);
    run('zypper', [ 'install', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);

    await enableDockerService();
};

export default installDocker;