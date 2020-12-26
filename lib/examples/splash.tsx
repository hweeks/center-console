import ConsoleRender from '../';

const multiLine = `text
and
lines`;

const Splash = ({ date }: {date: any}) => <main>
  <div alignSelf='top' height={25}>
    <span alignContent="left" width={75}>logo</span>
    <span alignContent="right" width={25}>{date}</span>
  </div>
  <div alignContent="center" alignSelf='center' height={50}>
    {multiLine}
  </div>
  <div alignSelf="bottom" height={25}>
    <span alignContent="left" width={33}>left</span>
    <span alignContent="center" width={33}>right</span>
    <span alignContent="right" width={33}>centers</span>
  </div>
</main>;

const someDom = new ConsoleRender();

setInterval(() => {
  someDom.display(<Splash date={Date.now()}/>);
}, 120);
