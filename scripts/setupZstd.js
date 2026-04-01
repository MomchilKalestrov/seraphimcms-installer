/* @ts-check */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const ZSTD_REPO = 'https://github.com/facebook/zstd.git';
const ZSTD_PATH = 'sea/lib/zstd';

const main = async () => {
    console.log('Downloading the C implementation of `zstd`.');
    fs.mkdirSync(ZSTD_PATH, { recursive: true });
    if (!fs.existsSync(ZSTD_PATH))
        spawnSync('git', [ 'clone', ZSTD_REPO, ZSTD_PATH ], { stdio: 'inherit' });
};

main();