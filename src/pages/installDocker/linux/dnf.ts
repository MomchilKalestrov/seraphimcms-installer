import { run } from '../../../lib/utils.ts';

const installDocker = async () => {
    await run('dnf', [ 'install', '-y', 'dnf-plugins-core' ]);
    await run('dnf', [ 'config-manager', '--add-repo', 'https://download.docker.com/linux/fedora/docker-ce.repo' ]);
    await run('dnf', [ 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io' ]);
};

export default installDocker;