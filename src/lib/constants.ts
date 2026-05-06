import os from 'node:os';
import path from 'node:path';

export const DOCKER_BIN = '/usr/bin/docker';
export const DOCKER_NAME = 'seraphimcms';
export const ASSETS_PATH = path.resolve(os.homedir(), 'seraphimcms');
export const ENV_FILE = path.resolve(ASSETS_PATH, '.env');
export const CONTAINER_NAME = 'seraphimcms:latest';
export const OWNER = 'MomchilKalestrov';
export const CONTAINER_URL = 'https://gitlab.example.com/api/v4/projects/80766300/releases';
export const CONTAINER_PATH = path.resolve(ASSETS_PATH, 'seraphimcms-container.tar');