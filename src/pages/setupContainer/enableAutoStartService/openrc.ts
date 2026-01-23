import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { CONTAINER_NAME, DOCKER_BIN, ENV_FILE, IMAGE_NAME } from '../../../lib/constants.ts';

const enableAutoStartService = () => {
    const scriptFile = `/etc/init.d/${ CONTAINER_NAME }`;
    const content =
        `#!/sbin/openrc-run\n` +
        `\n` +
        `name="${ CONTAINER_NAME }"\n` +
        `command="${ DOCKER_BIN }"\n` +
        `command_args="start -a ${ CONTAINER_NAME }"\n` +
        `pidfile="/run/$RC_SVCNAME.pid"\n` +
        `\n` +
        `depend() {\n` +
        `    need docker\n` +
        `}\n` +
        `\n` +
        `start_pre() {\n` +
        `    if ! ${ DOCKER_BIN } ps -a --format '{{.Names}}' | grep -q "^${ CONTAINER_NAME }$"; then\n` +
        `        ${ DOCKER_BIN } run -d --name ${ CONTAINER_NAME } --env-file=${ ENV_FILE } --restart unless-stopped ${ IMAGE_NAME }\n` +
        `    fi\n` +
        `}`;

    fs.writeFileSync(scriptFile, content, { mode: 0o755 });
    spawnSync('rc-update' , [ 'add', CONTAINER_NAME, 'default' ]);
};

export default enableAutoStartService;