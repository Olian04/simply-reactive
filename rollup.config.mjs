import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input: './src/api.ts',
    output: [
      {
        file: './legacy/umd.js',
        format: 'umd',
        name: 'simplyReactive',
        sourcemap: true,
      },
      {
        file: './legacy/umd.cjs',
        format: 'umd',
        name: 'simplyReactive',
        sourcemap: true,
      }
    ],
    plugins: [
      typescript({
        target: 'es5',
        module: 'es6',
        compilerOptions: {
          declaration: false,
          sourceMap: true,
        },
        exclude: ['tests/**/*.ts'],
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  }
];
