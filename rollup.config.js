// @ts-check
/**
 * @typedef {Pick<
 *   import('rollup').RollupOptions,
 *   "input" | "output" | "external" | "plugins"
 * >} FileEntry
 */
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const isDev = process.env.NODE_ENV !== 'production';

/** @type {FileEntry[]} */
const files = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/guidebee-next-pwa.cjs',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/guidebee-next-pwa.module.js',
        format: 'esm'
      }
    ],
    external: [
      'next',
      'semver',
      'clean-webpack-plugin',
      'terser-webpack-plugin',
      'workbox-webpack-plugin',
      'typescript',
      'webpack',
      'crypto',
      'fs',
      'path',
      'url',
      'fast-glob',
      'workbox-window'
    ]
  },
  {
    input: 'src/fallback.ts',
    output: {
      file: 'dist/fallback.js',
      format: 'cjs'
    }
  },
  {
    input: 'src/sw-entry.ts',
    output: {
      file: 'dist/sw-entry.js',
      format: 'esm'
    },
    external: ['workbox-window']
  }
];

/** @type {FileEntry[]} */
const declarations = [
  {
    input: 'dist/dts/index.d.ts',
    output: [{ format: 'es', file: 'dist/index.d.ts' }]
  },
  {
    input: 'dist/dts/sw-entry.d.ts',
    output: [{ format: 'es', file: 'dist/sw-entry.d.ts' }]
  }
];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const rollupEntries = [];

for (const { input, output, external, plugins } of files) {
  rollupEntries.push(
    defineConfig({
      input,
      output,
      external,
      watch: {
        chokidar: {
          usePolling: false
        }
      },
      plugins: [
        nodeResolve({
          exportConditions: ['node'],
          preferBuiltins: true
        }),
        typescript({
          noForceEmit: true,
          noEmitOnError: !isDev,
          outDir: 'dist',
          declaration: true,
          declarationDir: 'dts',
          noEmit: false
        }),
        json(),
        ...[process.env.NODE_ENV === 'production' ? [terser()] : []],
        ...[plugins ?? []]
      ]
    })
  );
}

for (const { input, output, external, plugins } of declarations) {
  rollupEntries.push(
    defineConfig({
      input,
      output,
      external,
      watch: {
        chokidar: {
          usePolling: false
        }
      },
      plugins: [dts(), ...[plugins ?? []]]
    })
  );
}

export default rollupEntries;
