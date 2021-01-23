/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
import ConsoleElement from '../element';
import JOREL from '../scheduler';
import {
  Fiber,
  TypeTypes,
  TypesAsClass,
  JSXFactoryConfig,
  TypesAsFunction,
  MaybeProp,
  JSXConfig,
} from './c-dom-types';

type Proppy = Record<string, unknown>

const isEvent = (key : string) => key.startsWith('on');
const isProperty = (key: string) => key !== 'children' && !isEvent(key);
const isNew = (prev : Proppy, next : Proppy) => (key : string) => prev[key] !== next[key];
const isGone = (prev : Proppy, next : Proppy) => (key : string) => !(key in next);

let nextUnitOfWork : Fiber | undefined;
let currentRoot : Fiber | undefined;
let wipRoot : Fiber | undefined;
let deletions : Fiber[] = [];
let wipFiber : Fiber;

const whatTypeIsThis = (typeToCheck: TypeTypes) => {
  if (typeof typeToCheck === 'string') {
    return 'string';
  } if (typeToCheck?.prototype?.render) {
    return 'class';
  }
  return 'function';
};

const buildChildNodes = (children : JSXFactoryConfig['children'], parentProps : Proppy) => {
  if (Array.isArray(children)) {
    return (children as any[]).map((child : string | JSXConfig) : JSXConfig => {
      if (typeof child !== 'object') return createTextNode(child, parentProps);
      return child;
    });
  }
  if (typeof children === 'object') return [children];
  return [createTextNode(children, parentProps)];
};

export function createElement(type: TypeTypes, config: JSXFactoryConfig) : JSXConfig {
  const typeToHandle = whatTypeIsThis(type);
  if (typeToHandle === 'string') {
    const { children, ...props } = config;
    const textNodeOrChildNodes = buildChildNodes(children, props);
    const elementSubProps = {
      type: type as string,
      props: {
        ...props,
        children: textNodeOrChildNodes,
      },
    };
    return elementSubProps;
  }
  if (typeToHandle === 'class') {
    const { children, ...props } = config;
    const textNodeOrChildNodes = buildChildNodes(children, props);
    const baseClass = new (type as TypesAsClass)(props, textNodeOrChildNodes);
    const newJsx = { ...baseClass.renderClean() } as JSXConfig;
    newJsx.type = type;
    newJsx.props.self = baseClass;
    return newJsx;
  }
  const builtJsx = (type as TypesAsFunction)(config);
  builtJsx.type = (type as TypesAsFunction);
  return builtJsx;
}

function createTextNode(text: string, parent: Proppy) : JSXConfig {
  const castedText = text !== undefined ? `${text}` : '';
  const height = castedText.split('\n').length;
  return {
    type: 'CONSOLE_TEXT',
    parent: parent as JSXConfig['props'],
    props: {
      nodeValue: castedText,
      children: [],
      nodeLength: castedText.length,
      nodeHeight: height,
    },
  };
}

function createDom(fiber: Fiber) {
  const dom = { type: fiber.type, props: fiber.props };
  updateDom(dom, {}, fiber.props as Record<keyof ConsoleElement, any>);
  return dom;
}

function updateDom(dom : JSXConfig, prevProps : MaybeProp, nextProps : MaybeProp) {
  if (Object.keys(prevProps).length > 0 && nextProps.self?.isDirty) {
    const newProps = nextProps.self.renderClean();
    dom.props = newProps.props;
    return;
  }
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom.props[name] = null;
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom.props[name] = nextProps[name];
    });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot?.child);
  currentRoot = wipRoot;
  wipRoot = undefined;
}

function commitWork(fiber?: Fiber) {
  if (!fiber) return;

  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = (domParentFiber as Fiber).parent;
  }
  const domParent = domParentFiber.dom;
  if (
    fiber.effectTag === 'PLACEMENT'
    && fiber.dom !== undefined
  ) {
    if (domParent.props.children.length < 1 && fiber.dom) {
      domParent.props.children.push(fiber.dom);
    }
  } else if (
    fiber.effectTag === 'UPDATE'
    && fiber.dom !== undefined
  ) {
    updateDom(
      fiber.dom,
      fiber?.alternate?.props || {},
      fiber?.props || {},
    );
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: JSXConfig) {
  if (fiber.dom) {
    const childToRemove = domParent.props.children.findIndex((child) => child === fiber.dom);
    if (childToRemove >= 0) {
      domParent.props.children.splice(childToRemove, 1);
    }
  } else {
    commitDeletion(fiber.child as Fiber, domParent);
  }
}

export function render(element : JSXConfig, container: JSXConfig) {
  wipRoot = {
    type: element.type,
    hooks: [],
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
  workLoop();
}

function workLoop() {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork,
    );
    shouldYield = JOREL.shouldYield();
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  // eslint-disable-next-line no-unused-expressions
  nextUnitOfWork && setImmediate(workLoop);
}

function performUnitOfWork(fiber: Fiber) : Fiber | undefined {
  const imOfThisType = whatTypeIsThis(fiber.type);
  if (imOfThisType === 'function') {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) return fiber.child;
  let nextFiber : Fiber | undefined = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
  return undefined;
}

function updateFunctionComponent(fiber : Fiber) {
  wipFiber = fiber;
  wipFiber.hooks = [];
  const builtChild = (fiber.type as TypesAsFunction)(fiber.props);
  const children = [builtChild];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber : Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(innerFiber : Fiber, elements : JSXConfig[]) {
  let index = 0;
  let oldFiber = innerFiber.alternate && innerFiber.alternate.child;
  let prevSibling : Fiber | undefined;
  while (
    index < elements.length
    || oldFiber !== undefined
  ) {
    const element = elements[index];
    let newFiber : Fiber | undefined;

    const sameType = oldFiber
      && element
      && element.type === oldFiber.type;
    if (sameType && oldFiber) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: innerFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
        hooks: [],
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: innerFiber,
        effectTag: 'PLACEMENT',
        hooks: [],
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0 && newFiber) {
      innerFiber.child = newFiber;
    } else if (element && prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
