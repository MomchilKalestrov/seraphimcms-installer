import { run } from '../../../utils/exec.ts';

const enableDockerService = () => run('sv', [ 'up', 'docker' ]);

export default enableDockerService;