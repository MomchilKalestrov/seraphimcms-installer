//@ts-check
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const main = () => {
    spawnSync('tsc');
    fs.rmSync('dist/assets', {
        recursive: true,
        force: true
    });
    fs.cpSync('src/assets', 'dist/assets', {
        recursive: true
    });
};

main();