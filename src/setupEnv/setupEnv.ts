import fs from 'node:fs';
import crypto from 'node:crypto';
import readline from 'node:readline/promises';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const toEscapedValue = (value: string): string => {
    let out = '';

    for (const ch of value) {
        switch (ch) {
            case '\\':
                out += '\\\\';
                break;
            case ' ':
                out += '\\ ';
                break;
            case '\n':
                out += '\\n';
                break;
            case '\r':
                out += '\\r';
                break;
            case '\t':
                out += '\\t';
                break;
            default: {
                if (/^[A-Za-z0-9_./:@%+=,-]$/.test(ch)) {
                    out += ch;
                } else {
                    out += `\\${ch}`;
                };
            };
        };
    };

    return out;
};

const setupEnv = async () => {
    let env: Record<string, string> = {};

    env.MONGODB_URI = await rl.question('What is your connection string?');
    env.NEXTAUTH_URL = await rl.question('What will be your domain?');
    env.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('base64');
    env.BLOB_READ_WRITE_TOKEN = await rl.question('What is your Vercel Blob read/ write token?');
    env.NEXT_PUBLIC_BLOB_URL = await rl.question('What is your Vercel Blob URL?');

    const file = Object
        .entries(env)
        .map(([ key, value ]) => `${ key }=${ toEscapedValue(value) }`)
        .join('\n');

    fs.writeFileSync('/etc/seraphimcms/.env', file);
};

export default setupEnv;