import fs from 'node:fs';
import https from 'node:https';

function download(url: string, path: string, onProgress?: (progress: number) => void): Promise<void>;
function download(url: string, onProgress?: (progress: number) => void): Promise<Buffer>;

function download(
    arg1: string,
    arg2?: string | ((progress: number) => void),
    arg3?: (progress: number) => void 
): Promise<Buffer> | Promise<void> {
    if (typeof arg2 === 'function')
        return downloadInMemory(arg1, arg2);
    else
        return downloadToFile(arg1, arg2!, arg3);
}

const downloadInMemory = (url: string, onProgress?: (progress: number) => void): Promise<Buffer> =>
    new Promise(async (resolve, reject) => {
        https.get(url, res => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode <= 399)
                return resolve(downloadInMemory(res.headers.location!, onProgress));

            const chunks: Buffer[] = [];
            const totalLength = Number(res.headers[ 'content-length' ]);
            let currentLength = 0;

            res.on('data', (data: Buffer) => {
                chunks.push(data);
                currentLength += data.byteLength;
                onProgress?.(Math.round(currentLength / totalLength * 100));
            });

            res.on('error', reject);

            res.on('end', () => resolve(Buffer.concat(chunks)));
        });
    });

const downloadToFile = (url: string, path: string, onProgress?: (progress: number) => void): Promise<void> =>
    new Promise(async (resolve, reject) => {
        https.get(url, res => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode <= 399)
                return resolve(downloadToFile(res.headers.location!, path, onProgress));

            const writeStream = fs.createWriteStream(path);
            res.pipe(writeStream);

            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    });

export default download;