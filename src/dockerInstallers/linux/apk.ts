import { spawnSync } from 'node:child_process';
import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
	spawnSync('apk', [ 'update' ]);
	spawnSync('apk', [ 'add', 'docker' ]);

	spawnSync('rc-update', [ 'add', 'docker' ]);
	spawnSync('service', [ 'docker', 'start' ]);

    await enableDockerService();
};

export default installDocker;