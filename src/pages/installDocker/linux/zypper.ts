import { run } from '../../../lib/utils.ts';

const installDocker = async () => {
    await run('zypper', [ 'addrepo', 'https://download.docker.com/linux/opensuse/docker-ce.repo' ]);
    await run('zypper', [ 'refresh' ]);
    await run('zypper', [ 'install', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);
};

export default installDocker;