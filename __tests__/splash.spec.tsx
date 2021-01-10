import {Component, ConsoleRender} from '../lib';

const multiLine = `text
and
lines`;

const MultiDiv = ({ children } : {children: any}) : ConsoleDiv => <div alignContent="center" alignSelf='center' height={50}>
  {children}
</div>;

class StatefulSplash extends Component {
  interval?: NodeJS.Timer

  startTime: number

  constructor(...props) {
    super(...props);
    this.state = {
      date: 0,
    };
    this.startTime = Date.now();
    this.interval = setInterval(() => {
      this.setState({
        date: Date.now() - this.startTime,
      });
    }, 1000);
  }

  render() {
    const { date } = this.state;
    const runTime = `running for ${date}ms`;
    return <main>
      <div alignSelf='top' height={25}>
        <span alignContent="left" width={75} color='#2832c2' background='#ffff00'>logo</span>
        <span alignContent="right" width={25} background='#ffff00'>{runTime}</span>
      </div>
      <MultiDiv>{multiLine}</MultiDiv>
      <div alignSelf="bottom" height={25}>
        <span alignContent="left" width={33}>left</span>
        <span alignContent="center" width={33}>right</span>
        <span alignContent="right" width={33}>centers</span>
      </div>
    </main>;
  }
}

describe('single layer deep render', () => {
  const logBack = console.log
  let messages = []
  const clearBack = console.clear
  beforeEach(() => {
    // console.log = jest.fn((message) => messages.push(message));

    console.clear = jest.fn();
  })
  afterEach(() => {
    messages = [];
    console.log = logBack;
    console.clear = clearBack;
  });
  test('layout of splash is computed correctly', () => {
    const logSpy = jest.spyOn(console, 'log')
    const someDom = new ConsoleRender();
    someDom.display(<StatefulSplash />);
    expect(logSpy.mock.calls).toBe('lol')
  })
})
