import { spawnSync } from 'node:child_process';

const installDocker = async () =>
	spawnSync('pacman', [ '-Syu', '--noconfirm', 'docker' ], { stdio: 'inherit' });

export default installDocker;