import { spawnSync } from 'node:child_process';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
	spawnSync('xbps-install', [ '-S', '-y', 'docker' ], { stdio: 'inherit' });

    await enableDockerService();
};

export default installDocker;