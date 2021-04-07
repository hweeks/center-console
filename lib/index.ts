/* eslint-disable no-unused-vars */
import CenterConsole from './renderer/base';
import Component from './runtime/component';
import { ConsoleRender } from './renderer/console';

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
