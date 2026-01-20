import { run } from '../../utils/exec.ts';

import enableDockerService from './enableDockerService.ts';

const installDocker = async () => {
	run('pacman', [ '-Syu', '--noconfirm', 'docker' ], { stdio: 'inherit' });

    await enableDockerService();
};

export default installDocker;