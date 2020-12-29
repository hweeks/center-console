import ConsoleRender from '../';
import Component from '../component'

const multiLine = `text
and
lines`;

class StatefulSplash extends Component {
  interval?: NodeJS.Timer

  constructor(...props) {
    super(...props)
    this.interval = null
    this.state = {
      date: Date.now()
    }
    this.interval = setInterval(() => {
      this.setState({
        date: Date.now()
      })
    },1000)
  }

  render() {
    const {date} = this.state
    return <main>
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
    </main>
  }
}

const someDom = new ConsoleRender();
someDom.display(<StatefulSplash />);
