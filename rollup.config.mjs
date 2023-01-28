import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

/** @type {import('rollup').RollupOptions[]} */
export default [
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
      }),
      resolve(),
      commonjs(),
    ],
  },
  {
    input: './src/api.ts',
    output: {
      file: './cdn/simply-reactive.min.js',
      format: 'iife',
      name: 'simplyReactive',
    },
    plugins: [
      typescript({
        target: 'es5',
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
  {
    input: './src/api.ts',
    output: {
      file: './cdn/simply-reactive.mjs',
      format: 'es',
    },
    plugins: [
      typescript({
        target: 'es6',
      }),
      resolve(),
      commonjs(),
    ],
  },
  {
    input: './src/api.ts',
    output: {
      file: './cdn/simply-reactive.min.mjs',
      format: 'es',
    },
    plugins: [
      typescript({
        target: 'es6',
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
];
