//@ts-check
import fs from 'node:fs';
import https from 'node:https';

/**
 * @param { string } url
 * @param { string } path
 * @returns { Promise<void> }
 */
const download = (url, path) =>
    /** @type { Promise<void | > } */
    new Promise((resolve, reject) => {
        console.log('Downloading ' + url + ' => ' + path);
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

export default download;