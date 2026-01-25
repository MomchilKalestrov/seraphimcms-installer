import { spawnSync } from 'node:child_process';

const installDocker = async () =>
	spawnSync('xbps-install', [ '-S', '-y', 'docker' ], { stdio: 'inherit' });

export default installDocker;