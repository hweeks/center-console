/* eslint-disable import/no-extraneous-dependencies */
const NodeEnvironment = require('jest-environment-node');

const defaultWindowSize = [40, 20];

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.testPath = context.testPath;
    this.docblockPragmas = context.docblockPragmas;
  }

  async setup() {
    await super.setup();
    this.originalStdout = process.stdout.getWindowSize;
    this.global.changeWindowSize = (size = defaultWindowSize) => {
      process.stdout.getWindowSize = () => size;
    };
    if (this.docblockPragmas['window-size']) {
      const possibleSize = this.docblockPragmas['window-size'].split(',').map((val) => parseInt(val, 10));
      if (possibleSize.every((val) => !Number.isNaN(val)) && possibleSize.length === 2) {
        this.global.changeWindowSize(possibleSize);
      } else {
        this.global.changeWindowSize();
      }
    } else {
      this.global.changeWindowSize();
    }
  }

  async teardown() {
    process.stdout.getWindowSize = this.originalStdout;
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = CustomEnvironment;
