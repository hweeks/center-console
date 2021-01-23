const { matcherHint} = require('jest-matcher-utils');
const diffDefault = require('jest-diff').default;

const logBack = console.log;
let messages = [];
const clearBack = console.clear;
global.beforeEach(() => {
  console.log = jest.fn((message) => messages.push(message.trimEnd()));
  console.clear = jest.fn();
});
global.afterEach(() => {
  messages = [];
  console.log = logBack;
  console.clear = clearBack;
});

global.getConsoleOutput = () => messages;

const isRoughlyTheSame = (inputLayout, builtLayout) => {
  const builtInput = inputLayout.split('\n');
  return builtLayout.every((row, index) => row.trimEnd() === builtInput[index].trimEnd());
};

const passMessage = (actual, expected) => () => `${matcherHint('.not.toHaveRenderedOutput')
}\n\n`
  + `Expected rendered message to mostly match:\n${
    diffDefault(expected.split('\n'), actual)}`;

const failMessage = (actual, expected) => () => `${matcherHint('.toHaveRenderedOutput')
}\n\n`
+ `Expected rendered message to mostly match:\n${
  diffDefault(expected.split('\n'), actual)}`;

expect.extend({
  toHaveRenderedOutput: (actual, expected) => {
    const pass = isRoughlyTheSame(expected, actual);
    if (pass) {
      return { pass: true, message: passMessage(actual, expected) };
    }
    return { pass: false, message: failMessage(actual, expected) };
  },
});
