import { run } from '../../utils/exec.ts';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
	run('xbps-install', [ '-S', '-y', 'docker' ], { stdio: 'inherit' });

    await enableDockerService();
};

export default installDocker;