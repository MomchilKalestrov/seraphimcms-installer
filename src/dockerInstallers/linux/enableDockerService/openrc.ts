import { run } from '../../../utils/exec.ts';

const enableDockerService = () => {
    run('rc-service', [ 'docker', 'start' ]);
    run('rc-update', [ 'add', 'docker', 'default' ]);
};

export default enableDockerService;