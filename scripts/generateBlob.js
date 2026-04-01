//@ts-check
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { compress } from '@mongodb-js/zstd';

import supportedPlatforms from './supportedPlatforms.js';

const OS = process.argv[ 2 ] === 'windows' ? 'win32' : 'linux';
const ENTRYPOINT_COMMAND = 
    OS === 'win32'
    ?   'powershell -NoProfile -Command "try { Start-Process -FilePath \\".\\\\dist\\\\qode.exe\\" -ArgumentList \\".\\\\dist\\\\main.js\\" -Verb RunAs -WorkingDirectory \\"%CD%\\" -ErrorAction Stop } catch { exit 0 }"'
    :   'pkexec --keep-cwd env DISPLAY=$DISPLAY WAYLAND_DISPLAY=$WAYLAND_DISPLAY XAUTHORITY=$XAUTHORITY XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR ./dist/qode ./dist/main.js';

const DATA_STRUCT_SIZE = 25;
const DATA_HEADER_STRUCT_SIZE = 9;

if (!supportedPlatforms.includes(OS)) throw new Error('Unsupported platform!');

/** @typedef { { name: string; data: Buffer; permissions: number; } } file */

/** @typedef { Record<string, { version?: string; resolved?: string; overwridden?: false; dependencies?: dependencies; }> } dependencies */;

/** @typedef { { version: string; name: string; dependencies: dependencies; } } npmListResult */

/** @type { (obj: any, ...keys: string[]) => any } */
const getCertainKeys = (obj, ...keys) =>
    Object.entries(obj).reduce((result, [ key, value ]) => {
        if (keys.includes(key))
            result[ key ] = value;
        return result;
    }, /** @type { any } */({}));

/**
 * @param { string } directoryName
 * @returns { string[] }
 */
const getAllFiles = (directoryName) => {
    /** @type { string[] } */
    let files = [];

    /** @param { string } directory */
    (function traverse(directory) {
        fs.readdirSync(directory).forEach(file => {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) return traverse(absolute);
            else return files.push(absolute);
        });
    })(directoryName);

    return files;
};

/**
 * @param { string } dir
 * @param { string } ext
 */
const removeFilesWithExtension = (dir, ext) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory())
            removeFilesWithExtension(fullPath, ext);
        else if (entry.isFile() && fullPath.endsWith(ext))
            fs.unlinkSync(fullPath);
    }
}

/**
 * @param { number } n
 * @returns { Uint8Array }
 */
const ll2arr = n => 
    new Uint8Array([ n >> 0, n >> 8, n >> 16, n >> 24, 0, 0, 0, 0 ]);

/**
 * @param { string } str
 * @returns { Uint8Array }
 */
const str2arr = str =>
    new Uint8Array([ ...str ].map(c => c.charCodeAt(0)));

/**
 * @param { file[] } files
 * @param { number } index
 * @returns { number }
 */
const getOffsetForName = (files, index) =>
    files
        .slice(0, index)
        .reduce((curr, { name }) => curr + name.length + 1, 0);

/**
 * @param { file[] } files
 * @returns { number }
 */
const getNameSectionSize = files =>
    files.reduce((curr, { name }) => curr + name.length + 1, 0);

/**
 * @param { file[] } files
 * @param { number } index
 * @returns { number }
 */
const getOffsetForData = (files, index) =>
    files
        .slice(0, index)
        .reduce((curr, { data }) => curr + data.byteLength, 0);

/** @returns { number } */
const headerByteLength = () =>
    DATA_HEADER_STRUCT_SIZE + ENTRYPOINT_COMMAND.length + 1;


/**
 * @param { number } fileCount
 * @returns { Buffer }
 */
const constructHeader = fileCount =>
    Buffer.from(new Uint8Array([
        1, // used
        ...ll2arr(fileCount), // count
        ...str2arr(ENTRYPOINT_COMMAND), // entrypoint
        0 // NUL terminator
    ]));

/**
 * @param { file[] } files
 * @returns { Buffer }
 */
const constructDescriptors = files => {
    const headerSize = headerByteLength();
    const descriptorsSize = files.length * DATA_STRUCT_SIZE;
    const nameSectionSize = getNameSectionSize(files);

    /** @type { Buffer[] } */
    const buffers = [];

    files.forEach(({ data, permissions }, index) => {
        const nameOffsetInNameSection = getOffsetForName(files, index);
        const dataOffsetInDataSection = getOffsetForData(files, index);

        // Offsets from the start of the binary image
        const filenamePtr = headerSize + descriptorsSize + nameOffsetInNameSection;
        const dataPtr = headerSize + descriptorsSize + nameSectionSize + dataOffsetInDataSection;

        // Build descriptor as exact 24 bytes
        const descBytes = new Uint8Array([
            ...ll2arr(data.byteLength), // size
            permissions,                // permissions
            ...ll2arr(filenamePtr),     // filename pointer (offset in image)
            ...ll2arr(dataPtr)          // data pointer (offset in image)
        ]);

        buffers.push(Buffer.from(descBytes));
    });

    return Buffer.concat(buffers);
};

/**
 * @param { file[] } files
 * @returns { Buffer }
 */
const constructNameSection = files =>
    Buffer.concat(files.map(({ name }) => Buffer.from(name + '\0')));

/**
 * @param { file[] } files
 * @returns { Buffer }
 */
const constructDataSection = files =>
    Buffer.concat(files.map(({ data }) => data));

/** @param { Set<string> } dependencies */
const copyDependencies = dependencies => {
    dependencies.forEach(dependency => {
        try {
            fs.cpSync(
                'node_modules/' + dependency,
                'dist/node_modules/' + dependency,
                { recursive: true }
            )
        } catch (error) {
            console.warn('WARNING: Failed to copy module ' + dependency);
            console.warn('Reason: ' + (error instanceof Error ? error.message : error));
        };
    });

    // nodejs/ qodejs throws if we don't specifically have a package.json with "type": "module"
    const packageJson = JSON.parse(fs.readFileSync('package.json').toString());
    fs.writeFileSync(
        'dist/package.json',
        JSON.stringify(
            getCertainKeys(packageJson, 'name', 'author', 'license', 'version', 'main', 'type'),
            null,
            '\t'
        )
    );
};

/**
 * @param { string } filename 
 * @param { number } permission 
 * @returns { boolean }
 */
const hasPermission = (filename, permission) => {
    try {
        fs.accessSync(filename, permission);
        return true;
    } catch {
        return false;
    };
};

/**
 * @param { string } filename 
 * @returns { number } 
 */
const getPermissions = filename => {
    const permissions = [ fs.constants.X_OK, fs.constants.W_OK, fs.constants.R_OK ];
    let flags = 0;
    permissions.forEach((permission, index) => {
        if (hasPermission(filename, permission))
            flags |= 1 << index;
        else
            flags &= 0xff ^ 1 << index;
    });
    return flags;
};

const resolveDependencies = () => {
    const rawDeps = spawnSync('npm', [ 'list', '--omit=dev', '--json', '--all' ]).stdout.toString();
    /** @type { npmListResult } */
    const deps = JSON.parse(rawDeps);

    /** @type { Set<string> } */
    const dependenciesToIgnore = new Set([ '@nodegui/qode', 'cmake-js' ]);

    /** @type { Set<string> } */
    const dependencies = new Set();

    /**
     * @param { dependencies } node 
     * @param { Set<string> } deps 
     * @returns 
     */
    const extractDependencies = (node, deps) =>
        Object.entries(node ?? {})
            .forEach(([ key, value ]) => {
                if (
                    Object.keys(value).length === 0 ||
                    dependenciesToIgnore.has(key)
                ) return;
                if (value.dependencies)
                    extractDependencies(value.dependencies, deps);
                deps.add(key);
            });
    
    extractDependencies(deps.dependencies, dependencies);

    return dependencies;
};

const main = async () => {
    copyDependencies(resolveDependencies());

    // some files are not needed. For example C headers or .d.ts files
    /** @type { string[] } */
    const extensionsToOmit = [
        '.d.ts',
        '.d.mts',
        '.map',
        '.cmake',
        '.h',
        '.c',
        '.hpp',
        '.cpp',
        '.cc',
        '.md',
        '.markdown',
        '.txt',
        '.yml',
        '.sh',
        'BSD',
        'MIT',
        'LICENSE',
        'APACHE2',
        'AUTHORTS'
    ];

    for (const extension of extensionsToOmit)
        removeFilesWithExtension('./dist', extension);

    /** @type { file[] } */
    const files =
        getAllFiles('dist')
            .map(name => ({
                name,
                data: fs.readFileSync(name),
                permissions: getPermissions(name)
            }));

    const uncompressedBinary = Buffer.concat([
        constructHeader(files.length),
        constructDescriptors(files),
        constructNameSection(files),
        constructDataSection(files)
    ]);
    const uncompressedSize = uncompressedBinary.length;
    
    const compressedBinary = await compress(uncompressedBinary);
    const compressedSize = compressedBinary.length;

    fs.writeFileSync('payload.bin', Buffer.concat([
        ll2arr(uncompressedSize),
        ll2arr(compressedSize),
        compressedBinary
    ]));

    /**
     * @param { number } value
     * @returns { string }
     */
    const toShorten = value => {
        /** @type { string[] } */
        const units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];
        for (var i = 0; value > 1024 && i < units.length; i++)
            value /= 1024;
        return Math.floor(value) + ' ' + units[ i ];
    };

    console.log('Payload created with size: ' + toShorten(compressedBinary.byteLength));
};

main();