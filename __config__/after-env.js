/* eslint-disable import/no-extraneous-dependencies */
const { matcherHint } = require('jest-matcher-utils');
const diffDefault = require('jest-diff').default;
const JOREL = require('../lib/renderer/scheduler').default;

const logBack = process.stdout.write;
let messages = [];
const clearBack = console.clear;
beforeEach(() => {
  process.stdout.write = jest.fn((message) => messages.push(message.trimEnd()));
  console.clear = jest.fn();
});
afterEach(() => {
  messages = [];
  process.stdout.write = logBack;
  console.clear = clearBack;
  JOREL.emit('TEST_CLEAR');
});

global.getConsoleOutput = () => messages;

const isRoughlyTheSame = (inputLayout, builtLayout) => {
  const builtInput = inputLayout.split('\n');
  const sameLength = builtInput.length === builtLayout.length;
  const sameLayout = builtLayout.every((row, ind) => row.trimEnd() === builtInput[ind].trimEnd());
  return sameLength && sameLayout;
};

const passMessage = (actual, expected) => () => `${matcherHint('.not.toHaveRenderedOutput')
}\n\n`
  + `Expected rendered message to mostly match:\n${
    diffDefault(expected, actual.join('\n'))}`;

const failMessage = (actual, expected) => () => `${matcherHint('.toHaveRenderedOutput')
}\n\n`
+ `Expected rendered message to mostly match:\n${
  diffDefault(expected, actual.join('\n'))}`;

expect.extend({
  toHaveRenderedOutput: (actual, expected) => {
    const pass = isRoughlyTheSame(expected, actual);
    if (pass) {
      return { pass: true, message: passMessage(actual, expected) };
    }
    return { pass: false, message: failMessage(actual, expected) };
  },
});
