/**
 * @window-size 40,20
 */
import { ConsoleRender } from '../lib';

const multiLine = `text
and
lines`;

const MultiDiv = () : ConsoleDiv => <div alignContent="center" height={50}>
  {multiLine}
</div>;

const MultiResponse = `



                  text
                  and
                 lines


`;

describe('simple layouts', () => {
  test('multiline centering with fractional height', () => {
    const someDom = new ConsoleRender();
    someDom.display(<MultiDiv />);
    expect(getConsoleOutput()).toHaveRenderedOutput(MultiResponse);
  });
});
