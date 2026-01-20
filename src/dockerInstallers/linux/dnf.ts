import { run } from '../../utils/exec.ts';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
    run('dnf', [ 'install', '-y', 'dnf-plugins-core' ]);
    run('dnf', [ 'config-manager', '--add-repo', 'https://download.docker.com/linux/fedora/docker-ce.repo' ]);
    run('dnf', [ 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);

    await enableDockerService();
};

export default installDocker;