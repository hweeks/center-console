/* eslint-disable prefer-object-spread */

class ConsoleElement {
  internalDom: any

  constructor() {
    this.internalDom = [];
  }

  appendChild(child: any) {
    this.internalDom.push(child);
  }
}

function createTextNode(text: string) {
  const castedText = `${text}`
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: castedText,
      children: [],
      nodeLength: castedText.length
    },
  };
}

function jsx(type: unknown, config: {props:unknown, children?:never[]}) {
  if (typeof type === 'function') {
    return type(config);
  }
  const { children = [], ...props } = config;
  const childrenProps = [].concat(children);
  return {
    type,
    props: {
      ...props,
      children: childrenProps.map((child) => (typeof child === 'object' ? child : createTextNode(child))),
    },
  };
}

function render(element: any, container: any) {
  const innerContainer = new ConsoleElement() as any;
  const isProperty = (key: string) => key !== 'children';
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      innerContainer[name] = element.props[name];
    });
  element.props.children.forEach((child: any) => render(child, innerContainer));
  container.appendChild(innerContainer);
  if (container.finalRender) container.finalRender();
}

export { jsx as jsxs, render, jsx };
