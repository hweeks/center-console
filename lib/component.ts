import ConsoleRender from "."

class Component {
  computedValue: string

  isDirty: boolean

  state?: Record<string, unknown>

  props?: Record<string, unknown>

  parent?: any | null

  children?: JSX.IntrinsicElements[]

  constructor(props?: Component['props'], children?: Component['children']) {
    this.computedValue = '';
    this.isDirty = true;
    this.props = props || {};
    this.children = children
  }

  setState(stateUpdate: Partial<Component['state']>) {
    const newState = {...this.state, ...stateUpdate}
    if (stateUpdate) {
      this.state = newState;
      this.isDirty = true;
      this.parent?.display(this.render());
    }
  }

  setParent(parent?: Component['parent']) {
    this.parent = parent
  }

  render() : any | null {
    return null;
  }
}

export default Component;
