/**
 * @window-size 40,20
 */
import { ConsoleRender } from '../lib';

const multiLine = `text
and
lines`;

const output1 = `



                  text
                  and
                 lines


`;

const helloOutput = `








                                   hello








`;

const variousTests : [string, ()=> ConsoleDiv, string][] = [
  [
    'half height centered text',
    () : ConsoleDiv => <div alignContent="center" height={50}>
      {multiLine}
    </div>,
    output1,
  ],
  [
    'full height centered text',
    () : ConsoleDiv => <div alignContent="right">
      hello
    </div>,
    helloOutput,
  ],
];

describe('simple layouts', () => {
  test.each(variousTests)('%s', (desc, Comp, response) => {
    const someDom = new ConsoleRender();
    someDom.display(<Comp />);
    expect(global.getConsoleOutput()).toHaveRenderedOutput(response);
  });
});
