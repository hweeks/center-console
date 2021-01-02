/* eslint-disable no-unused-vars */
import CenterConsole from './center-console';
import Component from './component';
import { ConsoleRender } from './render';

export default ConsoleRender;

export { CenterConsole, ConsoleRender, Component };

declare global {
  interface ConsoleDiv {
    alignSelf?: 'top' | 'center' | 'bottom'
    alignContent?: 'left' | 'center' | 'right'
    height?: number
    color?: string
    background?: string
  }
  interface ConsoleSpan extends ConsoleDiv{
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
