import { run } from '../../../../lib/utils.ts';

const enableDockerService = async () => {
    await run('service', [ 'docker', 'start' ]);
    await run('update-rc.d', [ 'docker', 'defaults' ]);
};

export default enableDockerService;