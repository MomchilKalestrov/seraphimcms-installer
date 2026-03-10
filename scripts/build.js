//@ts-check
import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';
import { minify_sync } from 'terser';

/**
 * @param { ts.Diagnostic } diagnostic
 */
const printIssues = diagnostic => {
    if (!diagnostic.file || diagnostic.start === undefined) return;
    
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

    const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
    );

    console.error(
        `\x1b[36m${ (diagnostic.file.fileName.split(process.cwd()).pop() ?? '').substring(1) }\x1b[37m:\x1b[33m${ line + 1 }\x1b[37m:\x1b[33m${ character + 1 }\x1b[37m - \x1b[31m${ ts.DiagnosticCategory[ diagnostic.category ].toLowerCase() } \x1b[90mTS${ diagnostic.code }: \x1b[37m${ message }\n` +
        `\n` +
        `\x1b[30m\x1b[47m${ line + 1 }\x1b[0m${ fs.readFileSync(diagnostic.file.fileName).toString().split('\n')[ line ] }\n` +
        `\x1b[30m\x1b[47m${ ''.padStart((line + 1).toString().length, ' ') }\x1b[0m${ ''.padStart(character, ' ') }\x1b[31m${ ''.padStart(diagnostic.length ?? 0, '~') }\x1b[0m\n`
    );
};

const buildProject = () => {
    const configPath = ts.findConfigFile(
        './',
        ts.sys.fileExists,
        'tsconfig.json'
    );

    if (!configPath) throw new Error('tsconfig.json is missing? How the f*** did this happen?');

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

    const parsedConfig = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        './'
    );

    const program = ts.createProgram({
        rootNames: parsedConfig.fileNames,
        options: parsedConfig.options
    });

    const emitResult = program.emit();

    const diagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    diagnostics.forEach(printIssues);

    return !emitResult.emitSkipped;
};

const copyAssets = () => {
    fs.rmSync('dist/assets', {
        recursive: true,
        force: true
    });
    fs.cpSync('src/assets', 'dist/assets', {
        recursive: true
    });
};

/**
 * 
 * @param { string } directoryName
 * @param { string } extension
 * @returns 
 */
const getAllFiles = (directoryName, extension) => {
    /** @type { string[] } */
    let files = [];

    /** @param { string } directory */
    (function traverse(directory) {
        fs.readdirSync(directory).forEach(file => {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) return traverse(absolute);
            else if (absolute.endsWith(extension)) return files.push(absolute);
        });
    })(directoryName);

    return files;
};

const minifyProject = () => {
    const files = getAllFiles('dist', '.js').filter(path => !path.includes('node_modules'));
    /** @type { import('terser').MinifyOptions } */
    const options = {
        mangle: {
            keep_fnames: true,
            keep_classnames: true
        },
        sourceMap: false,
        nameCache: {}
    };

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        try {
            const result = minify_sync(content, options);
            if (result.code) fs.writeFileSync(file, result.code);
        } catch {
            console.log('couldn\'t compress file', file)
        };
    };
};

const main = async () => {
    if (!buildProject()) process.exit(1);
    copyAssets();
    minifyProject();
};

main();