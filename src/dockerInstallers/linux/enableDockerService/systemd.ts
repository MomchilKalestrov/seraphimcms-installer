import { run } from '../../../utils/exec.ts';

const enableDockerService = () => run('systemctl', [ 'enable', '--now', 'docker' ]);

export default enableDockerService;