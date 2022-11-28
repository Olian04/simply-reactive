import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: './src/api.web.ts',
    output: {
      file: './cdn/simply-reactive.js',
      format: 'iife',
      name: 'simplyReactive',
    },
    plugins: [typescript(), resolve(), commonjs(), terser()],
  },
  {
    input: './src/api.web.ts',
    output: {
      file: './cdn/simply-reactive.mjs',
      format: 'es',
    },
    plugins: [typescript(), resolve(), commonjs(), terser()],
  },
];
