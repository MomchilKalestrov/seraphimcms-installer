import https from 'node:https';

const download = (
    url: string,
    onProgress: (progress: number) => void
): Promise<Buffer> =>
    new Promise(async (resolve, reject) => {
        https.get(url, res => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode <= 399)
                return resolve(download(res.headers.location!, onProgress));

            const chunks: Buffer[] = [];
            const totalLength = Number(res.headers[ 'content-length' ]);
            let currentLength = 0;

            res.on('data', (data: Buffer) => {
                chunks.push(data);
                currentLength += data.byteLength;
                onProgress(Math.round(currentLength / totalLength * 100));
            });

            res.on('error', reject);

            res.on('end', () => resolve(Buffer.concat(chunks)));
        });
    });

export default download;