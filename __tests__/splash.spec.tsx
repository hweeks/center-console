import { ConsoleRender } from '../lib';
import StatefulSplash from '../lib/examples/splash';

describe('single layer deep render', () => {
  const logBack = console.log;
  let messages = [];
  const clearBack = console.clear;
  beforeEach(() => {
    console.log = jest.fn((message) => messages.push(message));
    console.clear = jest.fn();
  });
  afterEach(() => {
    messages = [];
    console.log = logBack;
    console.clear = clearBack;
  });
  test('layout of splash is computed correctly', () => {
    const logSpy = jest.spyOn(console, 'log');
    const someDom = new ConsoleRender();
    someDom.display(<StatefulSplash />);
    expect(logSpy.mock.calls).toBe('lol');
  });
});
