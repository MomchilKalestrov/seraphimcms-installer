import { run } from '../../../lib/utils.ts';

const installDocker = async () => {
    await run('yum', [ 'install', '-y', 'yum-utils' ]);
    await run('yum-config-manager', [ '--add-repo', 'https://download.docker.com/linux/centos/docker-ce.repo' ]);
    await run('yum', [ 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);
};

export default installDocker;