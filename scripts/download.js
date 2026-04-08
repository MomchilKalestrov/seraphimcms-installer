//@ts-check
import fs from 'node:fs';
import https from 'node:https';

/**
 * @param { number } progress
 */
const printProgressBar = progress => {
    // 100 / 100% [  ]
    const totalWidth = process.stdout.columns - 15;
    const progressWidth = Math.ceil(totalWidth * progress);

    const stringProgress = Math.ceil(progress * 100).toString().padStart(3, ' ');
    process.stdout.write(
        '\x1b[2k\r' +
        `${ stringProgress } / 100% [ ` +
        ''.padStart(progressWidth, '#') +
        ''.padStart(totalWidth - progressWidth, '-') +
        ' ]'
    );
};

/**
 * @param { string } url
 * @param { string } path
 * @param { boolean } print
 * @returns { Promise<void> }
 */
const download = (url, path, print = true) =>
    /** @type { Promise<void | > } */
    new Promise((resolve, reject) => {
        if (print) console.log('Downloading ' + url + ' => ' + path);
        https.get(url, response => {
            if ((response.statusCode ?? 0) >= 300 && (response.statusCode ?? 0) <= 399)
                return download(response.headers.location ?? url, path, false)
                    .then(resolve)
                    .catch(reject);

            const total = Number(response.headers[ 'content-length' ]);
            let progress = 0;

            response.on('data', chunk => {
                fs.appendFileSync(path, chunk);
                progress += chunk.length;
                printProgressBar(progress / total);
            });
            response.on('close', resolve);
            response.on('end', resolve);
            response.on('error', reject);
            response.on('aborted', reject);
        });
    });

export default download;