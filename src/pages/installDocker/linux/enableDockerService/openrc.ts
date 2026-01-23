import { spawnSync } from 'node:child_process';

const enableDockerService = () => {
    spawnSync('rc-service', [ 'docker', 'start' ]);
    spawnSync('rc-update', [ 'add', 'docker', 'default' ]);
};

export default enableDockerService;