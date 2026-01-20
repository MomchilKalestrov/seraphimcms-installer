import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { CONTAINER_NAME, DOCKER_BIN, ENV_FILE, IMAGE_NAME } from './constants.ts';

const enableAutoStartService = () => {
    const scriptFile = `/etc/init.d/${ CONTAINER_NAME }`;
    const content =
        `#!/bin/sh\n` +
        `### BEGIN INIT INFO\n` +
        `# Provides:          ${ CONTAINER_NAME }\n` +
        `# Required-Start:    $docker\n` +
        `# Required-Stop:     $docker\n` +
        `# Default-Start:     2 3 4 5\n` +
        `# Default-Stop:      0 1 6\n` +
        `# Short-Description: SeraphimCMS Docker container\n` +
        `### END INIT INFO\n` +
        `\n` +
        `case "$1" in\n` +
        `    start)\n` +
        `        ${ DOCKER_BIN } start -a ${ CONTAINER_NAME } || \\\n` +
        `            ${ DOCKER_BIN } run -d --name ${ CONTAINER_NAME } --env-file=${ ENV_FILE } --restart unless-stopped ${ IMAGE_NAME }\n` +
        `        ;;\n` +
        `    stop)\n` +
        `        ${ DOCKER_BIN } stop ${ CONTAINER_NAME }\n` +
        `        ;;\n` +
        `    restart)\n` +
        `        $0 stop\n` +
        `        $0 start\n` +
        `        ;;\n` +
        `    status)\n` +
        `        ${ DOCKER_BIN } ps -f name=${ CONTAINER_NAME }\n` +
        `        ;;\n` +
        `    *)\n` +
        `        echo "Usage: $0 {start|stop|restart|status}"\n` +
        `        exit 1\n` +
        `        ;;\n` +
        `esac\n` +
        `exit 0\n`;

    fs.writeFileSync(scriptFile, content, { mode: 0o755 });
    spawnSync('update-rc.d', [ CONTAINER_NAME, 'defaults' ]);
};

export default enableAutoStartService;