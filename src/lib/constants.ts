import os from 'node:os';
import path from 'node:path';

export const DOCKER_BIN = '/usr/bin/docker';
export const CONTAINER_NAME = 'seraphimcms';
export const ENV_PATH = path.resolve(os.homedir(), 'seraphimcms');
export const ENV_FILE = `${ ENV_PATH }/.env`;
export const IMAGE_NAME = 'seraphimcms:latest';
export const OWNER = 'MomchilKalestrov';
export const REPO = 'will-power';
export const IMAGE_FILENAME = 'seraphimcms-container.tar';