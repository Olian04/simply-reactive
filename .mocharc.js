const { MochaOptions } = require('mocha');

/** @type {MochaOptions} */
module.exports = {
  spec: ['./tests/**/*.test.ts'],
  require: 'ts-node/register',
  recursive: true,
};
