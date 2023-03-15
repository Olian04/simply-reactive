import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input: './src/api.ts',
    output: {
      file: './cdn/umd.js',
      format: 'umd',
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
      file: './cdn/esm.mjs',
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
