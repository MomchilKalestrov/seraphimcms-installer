import os from 'node:os';
import fs from 'node:fs';

const isRoot = (): boolean => {
    switch (os.platform()) {
        case 'linux':
            return process.geteuid!() === 0;
        case 'win32':
            try {
                fs.accessSync('C:\\Windows\\System32\\config', fs.constants.W_OK);
                return true;
            } catch {
                return false;
            };
    };
    
    throw Error('Unsupported platform');
};

export default isRoot;