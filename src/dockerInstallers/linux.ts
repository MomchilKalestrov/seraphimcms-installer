import { spawnSync } from "node:child_process";

const getPM = () =>
    [ 'apk', 'apt', 'dnf', 'pacman', 'xbps-install', 'yum', 'zypper' ]
        .find(pm => !spawnSync('which', [ pm ]).status);

const installDocker = async () => {
    const pm = getPM();

    if (!pm) {
        console.error('Unsuported package manager!');
        process.exit(0);
    };

    console.log('Found package manager: ' + pm);

    await (await import(`./linux/${ pm }.js`)).default();
};

module.exports.default = installDocker;