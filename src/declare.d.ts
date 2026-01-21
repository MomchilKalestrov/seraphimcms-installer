import { type Interface } from 'node:readline/promises';

declare global {
    var skipToStep: number;
    var rl: Interface;
    var envVariables: Record<string, string>;
};

export {};