import { spawnSync } from 'node:child_process';

const enableDockerService = () => spawnSync('systemctl', [ 'enable', '--now', 'docker' ]);

export default enableDockerService;