import { JSXConfig } from './runtime/c-dom-types';
import { ElementInput } from './runtime/jsx-runtime';
import JOREL from './scheduler'

class Component {
  computedValue: JSXConfig | null

  isDirty: boolean

  state?: Record<string, unknown>

  props?: Record<string, unknown>

  children?: ElementInput[]

  constructor(props?: Component['props'], children?: Component['children']) {
    this.computedValue = null;
    this.isDirty = true;
    this.props = props || {};
    this.children = children;
  }

  setState(stateUpdate: Partial<Component['state']>) {
    const newState = { ...this.state, ...stateUpdate };
    if (stateUpdate) {
      this.state = newState;
      this.isDirty = true;
      JOREL.emit('update')
    }
  }

  renderClean() : JSXConfig | null {
    if (!this.isDirty) {
      return this.computedValue;
    }
    this.isDirty = false;
    this.computedValue = this.render();
    return this.computedValue;
  }

  render() : JSXConfig | null {
    return null;
  }
}

export default Component;
