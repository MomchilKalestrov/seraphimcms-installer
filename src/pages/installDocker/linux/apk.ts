import { spawnSync } from 'node:child_process';

const installDocker = async () => {
	spawnSync('apk', [ 'update' ]);
	spawnSync('apk', [ 'add', 'docker' ]);
};

export default installDocker;