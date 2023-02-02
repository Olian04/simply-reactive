import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

/** @type {import('rollup').RollupOptions[]} */
const es6Composites = [
  {
    input: './src/api.composites.ts',
    output: {
      file: './cdn/simply-reactive.composites.mjs',
      format: 'es',
    },
    plugins: [
      typescript({
        target: 'es6',
        module: 'esnext',
        compilerOptions: {
          declaration: false,
          sourceMap: false,
        },
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
];

/** @type {import('rollup').RollupOptions[]} */
const es6Core = [
  {
    input: './src/api.core.ts',
    output: {
      file: './cdn/simply-reactive.core.mjs',
      format: 'es',
    },
    plugins: [
      typescript({
        target: 'es6',
        module: 'esnext',
        compilerOptions: {
          declaration: false,
          sourceMap: false,
        },
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
];

/** @type {import('rollup').RollupOptions[]} */
const es6Utils = [
  {
    input: './src/api.utils.ts',
    output: {
      file: './cdn/simply-reactive.utils.mjs',
      format: 'es',
    },
    plugins: [
      typescript({
        target: 'es6',
        module: 'esnext',
        compilerOptions: {
          declaration: false,
          sourceMap: false,
        },
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
];

/** @type {import('rollup').RollupOptions[]} */
const es6Full = [
  {
    input: './src/api.ts',
    output: {
      file: './cdn/simply-reactive.mjs',
      format: 'es',
    },
    plugins: [
      typescript({
        target: 'es6',
        module: 'esnext',
        compilerOptions: {
          declaration: false,
          sourceMap: false,
        },
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
];

/** @type {import('rollup').RollupOptions[]} */
const es6 = [...es6Full, ...es6Composites, ...es6Core, ...es6Utils];

/** @type {import('rollup').RollupOptions[]} */
const es5 = [
  {
    input: './src/api.ts',
    output: {
      file: './cdn/simply-reactive.cjs',
      format: 'iife',
      name: 'simplyReactive',
    },
    plugins: [
      typescript({
        target: 'es5',
        module: 'esnext',
        compilerOptions: {
          declaration: false,
          sourceMap: false,
        },
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
  {
    input: './src/api.ts',
    output: {
      file: './cdn/simply-reactive.js',
      format: 'iife',
      name: 'simplyReactive',
    },
    plugins: [
      typescript({
        target: 'es5',
        module: 'esnext',
        compilerOptions: {
          declaration: false,
          sourceMap: false,
        },
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
];

/** @type {import('rollup').RollupOptions[]} */
export default [...es5, ...es6];
