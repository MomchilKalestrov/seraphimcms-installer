import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { CONTAINER_NAME, DOCKER_BIN, SERVICE_DESCRIPTION, SERVICE_TITLE, DOCKER_NAME, ENV_FILE, BLOB_FS_PATH } from '../../../lib/constants.ts';

const enableAutoStartService = () => {
    const serviceFile = `/etc/systemd/system/${ SERVICE_TITLE }.service`;
    const content =
        `[Unit]\n` +
        `Description=${ SERVICE_DESCRIPTION }\n` +
        `After=docker.service\n` +
        `Requires=docker.service\n` +
        `\n` +
        `[Service]\n` +
        `Restart=always\n` +
        `ExecStartPre=/bin/sh -c 'if ! ${ DOCKER_BIN } ps -a --format "{{.Names}}" | grep -q "^${ DOCKER_NAME }$"; then ${ DOCKER_BIN } run -d --name ${ DOCKER_NAME } -v ${ BLOB_FS_PATH }:/app/public -p 443:3000 --env-file=${ ENV_FILE } --restart unless-stopped ${ CONTAINER_NAME }; fi'\n` +
        `ExecStart=/bin/sh -c 'exec ${ DOCKER_BIN } start -a ${ DOCKER_NAME }'\n` +
        `ExecStop=/bin/sh -c '${ DOCKER_BIN } stop ${ DOCKER_NAME }'\n` +
        `\n` +
        `[Install]\n` +
        `WantedBy=multi-user.target`;

    fs.writeFileSync(serviceFile, content, { mode: 0o644 });
    
    spawnSync('systemctl', [ 'daemon-reload' ]);
    spawnSync('systemctl', [ 'enable', SERVICE_TITLE ]);
    spawnSync('systemctl', [ 'start', SERVICE_TITLE ]);
}


export default enableAutoStartService;