//@ts-check
import fs from 'node:fs';
import path from 'node:path';

const TARGET_PLATFORM = fs.readFileSync(path.resolve(import.meta.dirname, '__targetPlatform')).toString();

export { TARGET_PLATFORM };