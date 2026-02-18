//@ts-check
import fs from 'node:fs';
import os from 'node:os';
import https from 'node:https';
import { spawnSync } from 'node:child_process';
import supportedPlatforms from './supportedPlatforms.js';

if (!supportedPlatforms.includes(os.platform())) throw new Error('Unsupported platform!');

const QODE_DESTINATION = os.platform() === 'win32' ? 'dist\\qode.exe' : 'dist/qode';
const OWNER = 'MomchilKalestrov';
const REPO = 'qodejs';

/**
 * @typedef { object } release
 * @property { ({ name: string; browser_download_url: string; })[] } assets
 * @property { string } tag_name 
 */

/** @returns { Promise<{ downloadUrl: string; version: number[] }> } */
const getSource = async () => {
    const response = await fetch(`https://api.github.com/repos/${ OWNER }/${ REPO }/releases/latest`, {
        headers: {
            'Accept': 'application/vnd.github+json',
        }
    });

    if (!response.ok) throw 'Failed to download the Qode.JS runtime.';

    /** @type { release } */
    const data = await response.json();
    
    // the right size of the null coalesing won't ever be reached
    // but it's required otherwise the TS checker complains :)
    const downloadUrl = data.assets.find(({ name }) => name.includes(os.platform()))?.browser_download_url ?? '';


    return {
        downloadUrl,
        version: data.tag_name.substring(1).split('-')[ 0 ].split('.').map(Number)
    };
};

/**
 * @param { string } url
 * @param { string } path
 * @returns { Promise<void> }
 */
const download = (url, path) =>
    /** @type { Promise<void> } */
    new Promise((resolve, reject) => {
        https.get(url, response => {
            if ((response.statusCode ?? 0) >= 300 && (response.statusCode ?? 0) <= 399)
                return download(response.headers.location ?? url, path)
                    .then(resolve)
                    .catch(reject);
            
            const stream = fs.createWriteStream(path);
            stream.on('finish', resolve);
            stream.on('close', resolve);
            stream.on('error', reject);
            response.pipe(stream);
        });
    });

/**
 * @param { number[] } currentVersion
 * @param { number[] } newVersion
 * @returns { boolean }
 */
const shouldFetchNewVersion = (currentVersion, newVersion) => {
    for (let i = 0; i < 3; i++)
        if (currentVersion[ i ] < newVersion[ i ])
            return true;
    return false;
};

/**
 * @param { string } path 
 */
const ensurePathExists = path => {
    const slash = QODE_DESTINATION.includes('\\') ? '\\' : '/';
    fs.mkdirSync(path.split(slash).slice(0, -1).join(slash), {
        recursive: true
    });
};

/**
 * @returns { number[] } 
 */
const getCurrentVersion = () =>
    (spawnSync(QODE_DESTINATION, [ '--version' ])
        .output
        .toString()
        .split(' ')
        .pop() ?? '')
        .substring(1)
        .split('.')
        .map(Number);

const main = async () => {
    const { downloadUrl, version: newVersion } = await getSource();

    if (
        fs.existsSync(QODE_DESTINATION) &&
        !shouldFetchNewVersion(getCurrentVersion(), newVersion)
    ) return;

    ensurePathExists(QODE_DESTINATION);

    await download(
        downloadUrl,
        QODE_DESTINATION
    );

    if (os.platform() !== 'win32')
        fs.chmodSync(QODE_DESTINATION, 0o755);

    process.exit(0);
};

main();