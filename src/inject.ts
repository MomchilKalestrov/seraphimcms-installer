import fs from 'node:fs';
import path from 'node:path';

const ENTRYPOINT_COMMAND = 'echo "hello wold"';
const POINTER_SIZE = 8;
const DATA_STRUCT_SIZE = 24;
const DATA_HEADER_STRUCT_SIZE = 9;

const directoryName: string = process.argv.pop() as string;

type file = {
    name: string;
    data: Buffer;
};

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


// I'd also add these, too, but I can't,
// since there's no integers in JS
// n >> 32, n >> 40, n >> 48, n >> 54

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

    files.forEach(({ data }, index) => {
        const nameOffsetInNameSection = getOffsetForName(files, index);
        const dataOffsetInDataSection = getOffsetForData(files, index);

        // Offsets from the start of the binary image
        const filenamePtr = headerSize + descriptorsSize + nameOffsetInNameSection;
        const dataPtr = headerSize + descriptorsSize + nameSectionSize + dataOffsetInDataSection;

        // Build descriptor as exact 24 bytes
        const descBytes = new Uint8Array([
            ...ll2arr(data.byteLength), // size
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

const main = () => {
    const files: file[] =
        getAllFiles(directoryName)
            .map(name => ({
                name,
                data: fs.readFileSync(name)
            }));

    const binary = Buffer.concat([
        constructHeader(files.length),
        constructDescriptors(files),
        constructNameSection(files),
        constructDataSection(files)
    ]);

    fs.writeFileSync('fuckassery.bin', binary);
};

main();