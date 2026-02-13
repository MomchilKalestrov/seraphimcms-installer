//@ts-check
import fs from 'node:fs';
import ts from 'typescript';

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

    diagnostics.forEach(diagnostic => {
        if (diagnostic.file && diagnostic.start !== undefined) {
            const { line, character } =
                diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)

            const message = ts.flattenDiagnosticMessageText(
                diagnostic.messageText,
                '\n'
            );

            console.error(`${ diagnostic.file.fileName } (${ line + 1 },${ character + 1 }): ${ message }`);
        };
    });

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

const main = () => {
    if (!buildProject()) process.exit(1);
    copyAssets();
};

main();