import { run } from '../../../utils/exec.ts';

const enableDockerService = () => {
    run('service', [ 'docker', 'start' ]);
    run('update-rc.d', [ 'docker', 'defaults' ]);
};

export default enableDockerService;