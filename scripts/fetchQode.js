//@ts-check
import fs from 'node:fs';
import os from 'node:os';
import https from 'node:https';
import supportedPlatforms from './supportedPlatforms.js';

if (!supportedPlatforms.includes(os.platform())) throw new Error('Unsupported platform!');

const OWNER = 'MomchilKalestrov';
const REPO = 'qodejs';

/** @type { () => Promise<string> } */
const getDownloadUrl = async () => {
    const response = await fetch(`https://api.github.com/repos/${ OWNER }/${ REPO }/releases/latest`, {
        headers: {
            'Accept': 'application/vnd.github+json',
        }
    });

    if (!response.ok) throw 'Failed to download the Qode.JS runtime.';

    /** @type { { assets: ({ name: string; browser_download_url: string; })[]; } } */
    const { assets } = await response.json();

    const asset = assets.find(({ name }) => name.includes(os.platform()));

    // the right size of the null coalesing won't ever be reached
    // but it's required otherwise the TS checker complains :)
    return asset?.browser_download_url ?? '';
};

/** @type { (url: string, path: string) => Promise<void> } */
const download = (url, path) =>
    /** @type {Promise<void>} */
    new Promise((resolve, reject) => {
        https.get(url, response => {
            if ((response.statusCode ?? 0) >= 300 && (response.statusCode ?? 0) <= 399)
                download(response.headers.location ?? url, path)
                    .then(resolve)
                    .catch(reject);
            
            const stream = fs.createWriteStream(path);
            stream.on('finish', resolve);
            stream.on('close', resolve);
            stream.on('error', reject);
            response.pipe(stream);
        });
    });

const main = async () => {
    fs.mkdirSync('dist', { recursive: true });

    await download(
        await getDownloadUrl(),
        os.platform() === 'win32' ? 'dist/qode.exe' : 'dist/qode'
    );

    if (os.platform() !== 'win32')
        fs.chmodSync('dist/qode', 0o755);

    process.exit(0);
};

main();