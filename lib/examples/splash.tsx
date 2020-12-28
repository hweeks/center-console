import ConsoleRender from '../';
import { useState } from '../runtime/c-dom';

const multiLine = `text
and
lines`;

const Splash = () => {
  const [time, setTime] = useState(Date.now());
  setInterval(() => {
    setTime(Date.now())
  }, 120);
  debugger
  return <main>
  <div alignSelf='top' height={25}>
    <span alignContent="left" width={75}>logo</span>
    <span alignContent="right" width={25}>{time}</span>
  </div>
  <div alignContent="center" alignSelf='center' height={50}>
    {multiLine}
  </div>
  <div alignSelf="bottom" height={25}>
    <span alignContent="left" width={33}>left</span>
    <span alignContent="center" width={33}>right</span>
    <span alignContent="right" width={33}>centers</span>
  </div>
</main>
};

const someDom = new ConsoleRender();
someDom.display(<Splash />);
