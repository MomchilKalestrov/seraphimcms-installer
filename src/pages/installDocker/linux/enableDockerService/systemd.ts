import { run } from '../../../../lib/utils.ts';

const enableDockerService = async () => void await run('systemctl', [ 'enable', '--now', 'docker' ]);

export default enableDockerService;