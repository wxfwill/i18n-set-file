import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default defineConfig([
    // ESM 构建
    {
        input: 'src/index.js',
        output: {
            dir: 'dist/esm',
            entryFileNames: 'index.js', // 主入口文件名
            format: 'es',
            exports: 'named',
            chunkFileNames: '[name].js', // 使用原始的模块名称，避免添加哈希
            // manualChunks: undefined, // 禁用 Rollup 的默认 chunk 分割逻辑（如需要）
            //   sourcemap: true,
        },
        external: [
            'fs-extra',
            'path',
            'url',
            'node-fetch',
            'abort-controller'
        ],
        plugins: [
            resolve(),
            commonjs(),
            copy({
                targets: [
                    { src: 'src/mock.json', dest: 'dist/esm' },
                ]
            })
        ]
    },
    // CJS 构建
    {
        input: 'src/index.js',
        output: {
            dir: 'dist/cjs',
            entryFileNames: 'index.cjs', // 主入口文件名
            format: 'cjs',
            exports: 'named',
            chunkFileNames: '[name].js', // 使用原始的模块名称，避免添加哈希
             manualChunks: undefined
            //   sourcemap: true,
        },
        external: [
            'fs-extra',
            'path',
            'url',
            'node-fetch',
            'abort-controller'
        ],
        plugins: [
            resolve(),
            commonjs(),
            copy({
                targets: [
                    { src: 'src/mock.json', dest: 'dist/cjs' },
                ]
            })
        ]
    }
]);