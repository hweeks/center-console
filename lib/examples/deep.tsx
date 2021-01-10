/* eslint-disable class-methods-use-this */
import ConsoleRender from '..';
import Component from '../component';

class Deep extends Component {
  render() {
    return <main>
      <div height={100}>
        <div alignSelf='top'>
          <span alignContent="left" width={75} color='#2832c2' background='#ffff00'>logo</span>
          <span alignContent="right" width={25} background='#ffff00'>lol</span>
        </div>
        <div>
          <span alignContent="left" width={33}>left</span>
          <span alignContent="center" width={33}>right</span>
          <span alignContent="right" width={33}>centers</span>
        </div>
      </div>
    </main>;
  }
}

const someDom = new ConsoleRender();
someDom.display(<Deep />);
