import { spawnSync } from 'node:child_process';

const exposePort = () =>
    spawnSync('netsh', [ 'advfirewall', 'firewall', 'add', 'rule', 'name="TCP Port 8080 (SeraphimCMS)"', 'dir=in', 'action=allow', 'protocol=TCP', 'localport=8080' ])

export default exposePort;