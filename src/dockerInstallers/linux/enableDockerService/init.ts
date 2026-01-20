import { spawnSync } from 'node:child_process';

const enableDockerService = () => {
    spawnSync('service', [ 'docker', 'start' ]);
    spawnSync('update-rc.d', [ 'docker', 'defaults' ]);
};

export default enableDockerService;