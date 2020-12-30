import ConsoleRender from '../';
import Component from '../component'

const multiLine = `text
and
lines`;

const MultiDiv = ({children} : {children: string}) => <div alignContent="center" alignSelf='center' height={50}>
  {children}
</div>

class StatefulSplash extends Component {
  interval?: NodeJS.Timer

  startTime: number

  constructor(...props) {
    super(...props)
    this.interval = null
    this.state = {
      date: 0
    }
    this.startTime = Date.now()
    this.interval = setInterval(() => {
      this.setState({
        date: Date.now() - this.startTime
      })
    },1000)
  }

  render() {
    const {date} = this.state
    return <main>
      <div alignSelf='top' height={25}>
        <span alignContent="left" width={75}>logo</span>
        <span alignContent="right" width={25}>running for {date}ms</span>
      </div>
      <MultiDiv>{multiLine}</MultiDiv>
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
