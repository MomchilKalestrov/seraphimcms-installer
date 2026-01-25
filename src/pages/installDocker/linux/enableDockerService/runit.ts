import { run } from '../../../../lib/utils.ts';

const enableDockerService = async () => void await run('sv', [ 'up', 'docker' ]);

export default enableDockerService;