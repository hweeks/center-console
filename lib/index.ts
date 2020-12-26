/* eslint-disable no-unused-vars */
import CenterConsole from './center-console';
import { ConsoleRender } from './render';

export default ConsoleRender;

export { CenterConsole, ConsoleRender };

declare global {
  interface ConsoleDiv {
    alignSelf?: 'top' | 'center' | 'bottom'
    alignContent?: 'left' | 'center' | 'right'
    height?: number
  }
  interface ConsoleSpan {
    alignSelf?: 'top' | 'center' | 'bottom'
    alignContent?: 'left' | 'center' | 'right'
    height?: number
    width?: number
  }
  namespace JSX {
    interface IntrinsicElements {
      main: {}
      div: ConsoleDiv
      span: ConsoleSpan
    }
  }
}
