import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { DOCKER_NAME, DOCKER_BIN, ENV_FILE, CONTAINER_NAME } from '../../../lib/constants.ts';

const enableAutoStartService = () => {
    const scriptFile = `/etc/init.d/${ DOCKER_NAME }`;
    const content =
        `#!/sbin/openrc-run\n` +
        `\n` +
        `name="${ DOCKER_NAME }"\n` +
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
        `        ${ DOCKER_BIN } run -d --name ${ DOCKER_NAME } --env-file=${ ENV_FILE } --restart unless-stopped ${ CONTAINER_NAME }\n` +
        `    fi\n` +
        `}`;

    fs.writeFileSync(scriptFile, content, { mode: 0o755 });
    spawnSync('rc-update' , [ 'add', DOCKER_NAME, 'default' ]);
};

export default enableAutoStartService;