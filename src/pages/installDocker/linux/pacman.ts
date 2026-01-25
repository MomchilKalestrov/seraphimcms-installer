import { run } from '../../../lib/utils.ts';

const installDocker = async () =>
	void await run('pacman', [ '-Syu', '--noconfirm', 'docker' ]);

export default installDocker;