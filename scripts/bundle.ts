import { build } from 'esbuild';

await build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile: 'dist/bundled.js',

    loader: {
        '.node': 'file',
    },

    external: ['*.node'],
})
