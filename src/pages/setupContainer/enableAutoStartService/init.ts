import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { DOCKER_NAME, DOCKER_BIN, ENV_FILE, CONTAINER_NAME, SERVICE_TITLE, SERVICE_DESCRIPTION, BLOB_FS_PATH } from '../../../lib/constants.ts';

const enableAutoStartService = () => {
    const scriptFile = `/etc/init.d/${ DOCKER_NAME }`;
    const content =
        `#!/bin/sh\n` +
        `### BEGIN INIT INFO\n` +
        `# Provides:          ${ SERVICE_TITLE }\n` +
        `# Required-Start:    $docker\n` +
        `# Required-Stop:     $docker\n` +
        `# Default-Start:     2 3 4 5\n` +
        `# Default-Stop:      0 1 6\n` +
        `# Short-Description: ${ SERVICE_DESCRIPTION }\n` +
        `### END INIT INFO\n` +
        `\n` +
        `case "$1" in\n` +
        `    start)\n` +
        `            ${ DOCKER_BIN } run -d --name ${ DOCKER_NAME } -v ${ BLOB_FS_PATH }:/app/public -p 443:3000 --env-file=${ ENV_FILE } --restart unless-stopped ${ CONTAINER_NAME }\n` +
        `            ${ DOCKER_BIN } run -d --name ${ DOCKER_NAME } -v ${ BLOB_FS_PATH }:/app/public --env-file=${ ENV_FILE } --restart unless-stopped ${ CONTAINER_NAME }\n` +
        `        ;;\n` +
        `    stop)\n` +
        `        ${ DOCKER_BIN } stop ${ DOCKER_NAME }\n` +
        `        ;;\n` +
        `    restart)\n` +
        `        $0 stop\n` +
        `        $0 start\n` +
        `        ;;\n` +
        `    status)\n` +
        `        ${ DOCKER_BIN } ps -f name=${ DOCKER_NAME }\n` +
        `        ;;\n` +
        `    *)\n` +
        `        echo "Usage: $0 {start|stop|restart|status}"\n` +
        `        exit 1\n` +
        `        ;;\n` +
        `esac\n` +
        `exit 0\n`;

    fs.writeFileSync(scriptFile, content, { mode: 0o755 });
    spawnSync('update-rc.d', [ DOCKER_NAME, 'defaults' ]);
};

export default enableAutoStartService;