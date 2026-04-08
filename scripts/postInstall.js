//@ts-check
import fs from 'node:fs';
import path from 'node:path';
import { stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const SUPPORTED_PLATFORMS = [ 'linux', 'win32' ];

let OS = '';

while (!SUPPORTED_PLATFORMS.includes(OS))
    OS = await new Promise(resolve => {
        /** @param { string } line */
        const lineHandler = line => {
            rl.off('line', lineHandler);
            resolve(line);
        };

        // console.log adds a new line at the end of the string,
        // which makes the prompt look like:
        // > 
        // [user input]

        const manualStdoutSuccess = stdout.write(
            'NodeGUI includes OS dependent binaries.\n' +
            `What OS will you be compiling for? (${ SUPPORTED_PLATFORMS.toString() })\n` +
            '> '
        );
        
        if (!manualStdoutSuccess)
            console.log(
                'NodeGUI includes OS dependent binaries.\n' +
                `What OS will you be compiling for? (${ SUPPORTED_PLATFORMS.toString() })`
            );

        rl.on('line', lineHandler);
    });

fs.writeFileSync(path.resolve(import.meta.dirname, '__targetPlatform'), OS);
await import(path.resolve(import.meta.dirname, 'replaceNodeGUI.js'));
process.exit(0);