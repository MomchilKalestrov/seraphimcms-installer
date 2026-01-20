import fs from 'node:fs';
import http from 'node:https';
import { spawnSync } from 'node:child_process';

import enableAutoStartService from './enableAutoStartService.ts';

const OWNER = 'MomchilKalestrov';
const REPO = 'will-power';
const FILENAME = 'seraphimcms-container.tar';

type assets = {
    assets: {
        name: string;
        browser_download_url: string;
    }[];
};

const getDownloadUrl = async () => {
    const response = await fetch(`https://api.github.com/repos/${ OWNER }/${ REPO }/releases/latest`, {
        headers: {
          'Accept': 'application/vnd.github+json',
        }
    });

    if (!response.ok) {
        console.error('Failed to download SeraphimCMS Docker container.');
        process.exit(0);
    };

    const { assets } = await response.json() as assets;

    const { browser_download_url } = assets.find(({ name }) => name.endsWith('.tar'))!;

    return browser_download_url;
};

const downloadContainer = () =>
    new Promise(async resolve => {
        const url = await getDownloadUrl();
        http.get(url, response => {
            const writeStream = fs.createWriteStream(FILENAME);
            writeStream.on('finish', resolve);
            response.pipe(writeStream);
        });
    });

const setupContainer = async () => {
    await downloadContainer();

    spawnSync('docker', [ 'load', '-i', FILENAME ]);
    
    spawnSync('docker', [ 'run', '-d', '--env-file=/etc/seraphimcms/.env', '--restart', 'unless-stopped', 'seraphimcms:latest' ]);

    await enableAutoStartService();
};

export default setupContainer;