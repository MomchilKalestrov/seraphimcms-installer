//@ts-check
import fs from 'node:fs';
import path from 'node:path';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

import tar from 'tar-stream';

import download from './download.js';
import { TARGET_PLATFORM } from './constants.js';

const DOWNLOAD_DESTINATION = `./nodegui-${ TARGET_PLATFORM }.tar.gz`;
const NODEGUI_GYP_PATH = path.resolve(process.cwd(), 'node_modules/@nodegui/nodegui/build/Release');
const OWNER = 'nodegui';
const REPO = 'nodegui';

/**
 * @typedef { object } release
 * @property { ({ name: string; browser_download_url: string; })[] } assets
 * @property { string } tag_name 
 */

const getSource = async () => {
    const response = await fetch(`https://api.github.com/repos/${ OWNER }/${ REPO }/releases/tags/v0.74.0`, {
        headers: {
            'Accept': 'application/vnd.github+json',
        }
    });

    if (!response.ok) throw 'Failed to download the Qode.JS runtime.';

    /** @type { release } */
    const data = await response.json();
    
    // the right side of the null coalesing won't ever be reached
    // but it's required otherwise the TS checker complains :)
    const downloadUrl = data.assets.find(({ name }) => name.includes(TARGET_PLATFORM))?.browser_download_url ?? '';

    return downloadUrl;
};

const copyGYP = async () => {
    const compressedFileStream = fs.createReadStream(DOWNLOAD_DESTINATION);
    const gunZip = createGunzip();
    const extractStream = tar.extract();
    pipeline(compressedFileStream, gunZip, extractStream);
    
    // clear previous contents (maybe if `npm i` is ran twice)
    fs.rmSync(NODEGUI_GYP_PATH, { recursive: true, force: true });
    fs.mkdirSync(NODEGUI_GYP_PATH, { recursive: true });

    for await (const entry of extractStream) {
        const stream = fs.createWriteStream(path.resolve(NODEGUI_GYP_PATH, entry.header.name));
        entry.pipe(stream);
        entry.resume();
    };
};

const main = async () => {
    console.log(`Downloading NodeGUI for ${ TARGET_PLATFORM }.`);
    await download(await getSource(), DOWNLOAD_DESTINATION);
    console.log('Downloaded NodeGUI.');
    console.log('Extracting tarball.');
    await copyGYP();
    console.log('Extracted tarball.');
    console.log('Setup complete. You can select a different OS by running `npm install` again.');
};

await main();