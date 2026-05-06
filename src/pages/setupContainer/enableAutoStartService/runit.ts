import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { DOCKER_NAME, DOCKER_BIN, ENV_FILE, CONTAINER_NAME } from '../../../lib/constants.ts';

const enableAutoStartService = () => {
    const serviceDir = `/etc/sv/${ DOCKER_NAME }`;
    const runFile = path.join(serviceDir, 'run');

    if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir, { recursive: true });

    const content =
        `#!/bin/sh\n` +
        `exec 2>&1\n` +
        `exec ${ DOCKER_BIN } start -a ${ DOCKER_NAME } || \\\n` +
        `    ${ DOCKER_BIN } run -d --name ${ DOCKER_NAME } --env-file=${ ENV_FILE } --restart unless-stopped ${ CONTAINER_NAME }\n`;

    fs.writeFileSync(runFile, content, { mode: 0o755 });

    const link = `/var/service/${ DOCKER_NAME }`;
    if (!fs.existsSync(link))
        spawnSync('ln', [ '-s', serviceDir, link ]);
}

export default enableAutoStartService;