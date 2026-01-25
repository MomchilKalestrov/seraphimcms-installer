import { run } from '../../../lib/utils.ts';

const installDocker = async () => {
	await run('apk', [ 'update' ]);
	await run('apk', [ 'add', 'docker' ]);
};

export default installDocker;