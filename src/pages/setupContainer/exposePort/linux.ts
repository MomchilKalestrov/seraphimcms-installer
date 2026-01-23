import { spawnSync } from 'node:child_process';

const hasNftablesInstalled = () =>
    !spawnSync('which', [ 'nftables' ]).status;

const exposePort = () => {
    if (!hasNftablesInstalled()) {
        console.warn('"nftables" not detected. If you have a firewall enabled, you must have expose port 8080 manually to accept external traffic.');
        return;
    };

    spawnSync('nft', [ 'add', 'rule', 'inet', 'filter', 'input', 'tcp', 'dport', '8080', 'ct', 'state', 'new,established', 'accept' ]);
    spawnSync('nft', [ 'add', 'rule', 'inet', 'filter', 'output', 'tcp', 'sport', '8080', 'ct', 'state', 'established', 'accept' ]);
};

export default exposePort;