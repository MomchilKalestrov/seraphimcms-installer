import { spawn } from 'node:child_process';

type RunOptions = {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    input?: string | Buffer;
};

const capture = (command: string, args: string[] = [], options: Omit<RunOptions, 'input'> = {}): Promise<string> =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: options.cwd,
            env: options.env,
            stdio: [ 'ignore', 'pipe', 'pipe' ],
        });

        const stdoutChunks: Buffer[] = [];
        const stderrChunks: Buffer[] = [];

        child.on('error', reject);

        child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
        child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

        child.on('close', (code: number | null) => {
            if (code === 0) {
                resolve(Buffer.concat(stdoutChunks).toString('utf8'));
                return;
            };

            const stderr = Buffer.concat(stderrChunks).toString('utf8');
            reject(new Error(`Command failed (${code ?? 'null'}): ${command} ${args.join(' ')}\n${stderr}`));
        });
    });

export { capture };
