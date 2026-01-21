import fs from 'node:fs';
import crypto from 'node:crypto';

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
    global.envVariables = {};

    global.envVariables.MONGODB_URI = await rl.question('What is your connection string?\n> ');
    global.envVariables.NEXTAUTH_URL = await rl.question('What will be your domain?\n> ');
    global.envVariables.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('base64');
    global.envVariables.BLOB_READ_WRITE_TOKEN = await rl.question('What is your Vercel Blob read/ write token?\n> ');
    global.envVariables.NEXT_PUBLIC_BLOB_URL = await rl.question('What is your Vercel Blob URL?\n> ');

    const file = Object
        .entries(global.envVariables)
        .map(([ key, value ]) => `${ key }=${ toEscapedValue(value) }`)
        .join('\n');


    fs.mkdirSync('/etc/seraphimcms', { recursive: true });
    fs.writeFileSync('/etc/seraphimcms/.env', file);
};

export default setupEnv;