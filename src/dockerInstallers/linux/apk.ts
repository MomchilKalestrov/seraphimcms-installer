import { run } from '../../utils/exec.ts';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
	run('apk', [ 'update' ]);
	run('apk', [ 'add', 'docker' ]);

	run('rc-update', [ 'add', 'docker' ]);
	run('service', [ 'docker', 'start' ]);

    await enableDockerService();
};

export default installDocker;