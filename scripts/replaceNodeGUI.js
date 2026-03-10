//@ts-check
import fs from 'node:fs';
import path from 'node:path';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline/promises';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

import tar from 'tar-stream';

import download from './download.js';
import supportedPlatforms from './supportedPlatforms.js';
import { stdin, stdout } from 'node:process';

let OS = '';

while (!supportedPlatforms.includes(OS))
    OS = await new Promise(resolve => {
        /** @param { string } line */
        const lineHandler = (line) => {
            rl.off('line', lineHandler);
            resolve(line);
        };

        // console.log adds a new line at the end of the string,
        // which makes the prompt look like:
        // > 
        // [user input]

        const manualStdoutSuccess = stdout.write(
            'NodeGUI includes OS dependent binaries.\n' +
            `What OS will you be compiling for? (${ supportedPlatforms.toString() })\n` +
            '> '
        );
        
        if (!manualStdoutSuccess)
            console.log(
                'NodeGUI includes OS dependent binaries.\n' +
                `What OS will you be compiling for? (${ supportedPlatforms.toString() })`
            );

        rl.on('line', lineHandler);
    });

const DOWNLOAD_DESTINATION = `./nodegui-${ OS }.tar.gz`;
const NODEGUI_GYP_PATH = path.resolve(process.cwd(), 'node_modules/@nodegui/nodegui/build/Release');
const OWNER = 'nodegui';
const REPO = 'nodegui';

/**
 * @typedef { object } release
 * @property { ({ name: string; browser_download_url: string; })[] } assets
 * @property { string } tag_name 
 */

/** @returns { Promise<string> } */
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
    const downloadUrl = data.assets.find(({ name }) => name.includes(OS))?.browser_download_url ?? '';

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
    console.log(`Downloading NodeGUI for ${ OS }.`);
    await download(await getSource(), DOWNLOAD_DESTINATION);
    console.log('Downloaded NodeGUI.');
    console.log('Extracting tarball.');
    await copyGYP();
    console.log('Extracted tarball.');
    console.log('Setup complete. You can select a different OS by running `npm install` again.');
};

main();