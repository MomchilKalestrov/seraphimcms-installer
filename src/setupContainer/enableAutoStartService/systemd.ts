import fs from 'node:fs';

import { run } from '../../utils/exec.ts';
import { CONTAINER_NAME, DOCKER_BIN } from './constants.ts';

const enableAutoStartService = () => {
    const serviceFile = `/etc/systemd/system/${ CONTAINER_NAME }.service`;
    const content =
        `[Unit]\n` +
        `Description=SeraphimCMS Docker container\n` +
        `After=docker.service\n` +
        `Requires=docker.service\n` +
        `\n` +
        `[Service]\n` +
        `Restart=always\n` +
        `ExecStart=${ DOCKER_BIN } start -a ${ CONTAINER_NAME }\n` +
        `ExecStop=${ DOCKER_BIN } stop ${ CONTAINER_NAME }\n` +
        `\n` +
        `[Install]\n` +
        `WantedBy=multi-user.target`;

    fs.writeFileSync(serviceFile, content, { mode: 0o644 });
    run('systemctl', [ 'daemon-reload' ]);
    run('systemctl', [ 'enable', CONTAINER_NAME ]);
    run('systemctl', [ 'start', CONTAINER_NAME ]);
}


export default enableAutoStartService;