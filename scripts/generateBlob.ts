import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ENTRYPOINT_COMMAND = 'pkexec --keep-cwd env DISPLAY=$DISPLAY WAYLAND_DISPLAY=$WAYLAND_DISPLAY XAUTHORITY=$XAUTHORITY XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR ./dist/qode ./dist/main.js';
const DATA_STRUCT_SIZE = 25;
const DATA_HEADER_STRUCT_SIZE = 9;

type file = {
    name: string;
    data: Buffer;
    permissions: number;
};

type dependencies = Record<string, {
    version?: string;
    resolved?: string;
    overwridden?: false;
    dependencies?: dependencies;
}>;

type npmListResult = {
    version: string;
    name: string;
    dependencies: dependencies;
};

const getCertainKeys = (obj: any, ...keys: string[]) =>
    Object.entries(obj).reduce<any>((result, [ key, value ]) => {
        if (keys.includes(key))
            result[ key ] = value;
        return result;
    }, {});

const getAllFiles = (directoryName: string): string[] => {
    let files: string[] = [];

    (function traverse(directory: string) {
        fs.readdirSync(directory).forEach(file => {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) return traverse(absolute);
            else return files.push(absolute);
        });
    })(directoryName);

    return files;
};


const removeFilesWithExtension = (dir: string, ext: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory())
            removeFilesWithExtension(fullPath, ext);
        else if (entry.isFile() && fullPath.endsWith(ext))
            fs.unlinkSync(fullPath);
    }
}

const ll2arr = (n: number): Uint8Array => 
    new Uint8Array([ n >> 0, n >> 8, n >> 16, n >> 24, 0, 0, 0, 0 ]);

const str2arr = (str: string): Uint8Array =>
    new Uint8Array([ ...str ].map(c => c.charCodeAt(0)));

const getOffsetForName = (files: file[], index: number) =>
    files
        .slice(0, index)
        .reduce<number>((curr, { name }) => curr + name.length + 1, 0);

const getNameSectionSize = (files: file[]) =>
    files.reduce<number>((curr, { name }) => curr + name.length + 1, 0);

const getOffsetForData = (files: file[], index: number) =>
    files
        .slice(0, index)
        .reduce<number>((curr, { data }) => curr + data.byteLength, 0);

const headerByteLength = () =>
    DATA_HEADER_STRUCT_SIZE + ENTRYPOINT_COMMAND.length + 1;

const constructHeader = (fileCount: number): Buffer =>
    Buffer.from(new Uint8Array([
        1, // used
        ...ll2arr(fileCount), // count
        ...str2arr(ENTRYPOINT_COMMAND), // entrypoint
        0 // NUL terminator
    ]));

const constructDescriptors = (files: file[]) => {
    const headerSize = headerByteLength();
    const descriptorsSize = files.length * DATA_STRUCT_SIZE;
    const nameSectionSize = getNameSectionSize(files);

    const buffers: Buffer[] = [];

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

const constructNameSection = (files: file[]) =>
    Buffer.concat(files.map(({ name }) => Buffer.from(name + '\0')));

const constructDataSection = (files: file[]) =>
    Buffer.concat(files.map(({ data }) => data));

const copyDependencies = (dependencies: Set<string>) => {
    dependencies.forEach(dependency => {
        try {
            fs.cpSync(
                'node_modules/' + dependency,
                'dist/node_modules/' + dependency,
                { recursive: true }
            )
        } catch {
            console.warn('WARNING: Failed to copy module ' + dependency)
        };
    });
    
    if (os.platform() === 'win32')
        fs.copyFileSync('node_modules/@nodegui/qode/binaries/qode.exe', 'dist/qode.exe');
    else {
        fs.copyFileSync('node_modules/@nodegui/qode/binaries/qode', 'dist/qode');
        fs.chmodSync('dist/qode', 0o755);
    };

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

const hasPermission = (filename: string, permission: number) => {
    try {
        fs.accessSync(filename, permission);
        return true;
    } catch {
        return false;
    }
};

const getPermissions = (filename: string) => {
    const permissions = [ fs.constants.X_OK, fs.constants.W_OK, fs.constants.R_OK ];
    let flags: number = 0;
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
    const deps = JSON.parse(rawDeps) as npmListResult;

    const dependencies = new Set<string>();

    const extractDependencies = (node: dependencies, deps: Set<string>) =>
        Object.entries(node ?? {})
            .forEach(([ key, value ]) => {
                if (Object.keys(value).length === 0) return;
                if (value.dependencies)
                    extractDependencies(value.dependencies, deps);
                deps.add(key);
            });
    
    extractDependencies(deps.dependencies, dependencies);

    return dependencies;
};

const main = () => {
    copyDependencies(resolveDependencies());

    // some files are not needed. For example C headers or .d.ts files
    for (const extension of [ '.d.ts', '.map', '.h', '.cmake', '.md',  ])
        removeFilesWithExtension('./dist', extension);

    const files: file[] =
        getAllFiles('dist')
            .map(name => ({
                name,
                data: fs.readFileSync(name),
                permissions: getPermissions(name)
            }));

    const binary = Buffer.concat([
        constructHeader(files.length),
        constructDescriptors(files),
        constructNameSection(files),
        constructDataSection(files)
    ]);

    fs.writeFileSync('payload.bin', binary);

    
    const toShorten = (value: number) => {
        const units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];
        for (var i = 0; value > 1024 && i < units.length; i++)
            value /= 1024;
        return Math.floor(value) + ' ' + units[ i ];
    };

    console.log('Payload created with size: ' + toShorten(binary.byteLength));
};

main();