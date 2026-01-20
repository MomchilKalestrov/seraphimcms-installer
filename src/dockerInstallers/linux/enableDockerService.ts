import { execSync } from 'node:child_process';

const getInit = (): string | undefined => {
    const init = execSync('ps -p 1 -o comm=', { encoding: 'utf8' }).trim();
    return [ 'systemd', 'openrc', 'runit', 'init' ].includes(init) ? init : undefined;
};

const enableDockerService = async () => {
    const init = getInit();

    if (!init) {
        console.error('Unsuported init!');
        process.exit(0);
    };

    await (require(`./enableDockerService/${ init }.ts`) as { default: () => Promise<void>; }).default();
};

export default enableDockerService;