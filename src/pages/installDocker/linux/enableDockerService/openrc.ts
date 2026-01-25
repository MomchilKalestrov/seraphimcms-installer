import { run } from '../../../../lib/utils.ts';

const enableDockerService = async () => {
    await run('rc-service', [ 'docker', 'start' ]);
    await run('rc-update', [ 'add', 'docker', 'default' ]);
};

export default enableDockerService;