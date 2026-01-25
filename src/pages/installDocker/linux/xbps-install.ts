import { run } from '../../../lib/utils.ts';

const installDocker = async () =>
	void await run('xbps-install', [ '-S', '-y', 'docker' ]);

export default installDocker;