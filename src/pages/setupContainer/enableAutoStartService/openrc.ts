import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { DOCKER_NAME, DOCKER_BIN, ENV_FILE, CONTAINER_NAME, SERVICE_TITLE, BLOB_FS_PATH } from '../../../lib/constants.ts';

const enableAutoStartService = () => {
    const scriptFile = `/etc/init.d/${ SERVICE_TITLE }`;
    const content =
        `#!/sbin/openrc-run\n` +
        `\n` +
        `name="${ SERVICE_TITLE }"\n` +
        `command="${ DOCKER_BIN }"\n` +
        `command_args="start -a ${ DOCKER_NAME }"\n` +
        `pidfile="/run/$RC_SVCNAME.pid"\n` +
        `\n` +
        `depend() {\n` +
        `    need docker\n` +
        `}\n` +
        `\n` +
        `start_pre() {\n` +
        `    if ! ${ DOCKER_BIN } ps -a --format '{{.Names}}' | grep -q "^${ DOCKER_NAME }$"; then\n` +
        `        ${ DOCKER_BIN } run -d --name ${ DOCKER_NAME } -v ${ BLOB_FS_PATH }:/app/public -p 443:3000 --env-file=${ ENV_FILE } --restart unless-stopped ${ CONTAINER_NAME }\n` +
        `    fi\n` +
        `}`;

    fs.writeFileSync(scriptFile, content, { mode: 0o755 });
    spawnSync('rc-update' , [ 'add', DOCKER_NAME, 'default' ]);
};

export default enableAutoStartService;