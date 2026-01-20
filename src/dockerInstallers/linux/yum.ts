import { run } from '../../utils/exec.ts';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
    run('yum', [ 'install', '-y', 'yum-utils' ]);
    run('yum-config-manager', [ '--add-repo', 'https://download.docker.com/linux/centos/docker-ce.repo' ]);
    run('yum', [ 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);

    await enableDockerService();
};

export default installDocker;