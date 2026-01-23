import os from 'node:os';

import linux from './exposePort/linux.ts';
import win32 from './exposePort/win32.ts';

const platforms: Record<string, () => void> = { linux, win32 };

const exposePort = () => platforms[ os.platform() ]!();

export default exposePort;