import { spawnSync } from 'node:child_process';

const enableDockerService = () => spawnSync('sv', [ 'up', 'docker' ]);

export default enableDockerService;