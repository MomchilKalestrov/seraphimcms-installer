//@ts-check
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TARGET_PLATFORM = fs.readFileSync(path.resolve(import.meta.dirname, '__targetPlatform')).toString();
const SLASH = os.platform() === 'win32' ? '\\' : '/';

export { TARGET_PLATFORM, SLASH };