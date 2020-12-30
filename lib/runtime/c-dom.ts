import ConsoleElement from '../element';
import {
  FiberOrNull, TypeTypes, TypesAsClass, Fiber, JSXFactoryConfig, TypesAsFunction, MaybeProp, JSXConfig,
} from './c-dom-types';

const isEvent = (key : string) => key.startsWith('on');
const isProperty = (key: string) => key !== 'children' && !isEvent(key);
const isNew = (prev : Record<string, unknown>, next : Record<string, unknown>) => (key : string) => prev[key] !== next[key];
const isGone = (prev : Record<string, unknown>, next : Record<string, unknown>) => (key : string) => !(key in next);

let nextUnitOfWork : FiberOrNull = null;
let currentRoot : FiberOrNull = null;
let wipRoot : FiberOrNull = null;
let deletions : FiberOrNull[] = [];
let wipFiber : FiberOrNull = null;
let hookIndex = 0;

const whatTypeIsThis = (typeToCheck: TypeTypes) => {
  if (typeof typeToCheck === 'string') {
    return 'string';
  } if (typeToCheck?.prototype?.render) {
    return 'class';
  }
  return 'function';
};

export function createElement(type: TypeTypes, config: JSXFactoryConfig) : JSXConfig {
  const typeToHandle = whatTypeIsThis(type);
  if (typeToHandle === 'string') {
    const { children, ...props } = config;
    const textNodeOrChildNodes = !Array.isArray(children) ? [createTextNode(children)] : children;
    const elementSubProps = {
      type: type as string,
      props: {
        ...props,
        children: textNodeOrChildNodes,
      },
    };
    return elementSubProps;
  } if (typeToHandle === 'class') {
    const { children, ...props } = config;
    const textNodeOrChildNodes = !Array.isArray(children) ? [createTextNode(children)] : children;
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

function createTextNode(text: string) : JSXConfig {
  const castedText = `${text}`;
  const height = castedText.split('\n').length;
  return {
    type: 'CONSOLE_TEXT',
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
  commitWork(wipRoot?.child || null);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber: FiberOrNull) {
  if (!fiber) return;

  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = (domParentFiber as Fiber).parent;
  }
  const domParent = domParentFiber.dom;
  if (
    fiber.effectTag === 'PLACEMENT'
    && fiber.dom != null
  ) {
    if (domParent.props.children.length < 1) {
      domParent.props.children.push(fiber.dom);
    }
  } else if (
    fiber.effectTag === 'UPDATE'
    && fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber?.alternate?.props || {},
      fiber?.props || {},
    );
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child || null);
  commitWork(fiber.sibling || null);
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
    child: null,
    parent: null,
    sibling: null,
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
    shouldYield = !nextUnitOfWork;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  setImmediate(workLoop);
}

function performUnitOfWork(fiber: Fiber) : FiberOrNull {
  const imOfThisType = whatTypeIsThis(fiber.type);
  if (imOfThisType === 'function') {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) return fiber.child;
  let nextFiber : FiberOrNull = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
  return null;
}

function updateFunctionComponent(fiber : Fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const builtChild = (fiber.type as TypesAsFunction)(fiber.props);
  const children = [builtChild];
  reconcileChildren(fiber, children);
}

// export function useState(initial) {
//   const oldHook = wipFiber && wipFiber.alternate
//     && wipFiber.alternate.hooks
//     && wipFiber.alternate.hooks[hookIndex];
//   const hook = {
//     state: oldHook ? oldHook.state : initial,
//     queue: [],
//   };

//   const actions = oldHook ? oldHook.queue : [];
//   actions.forEach((action) => {
//     hook.state = action(hook.state);
//   });

//   const setState = (action) => {
//     hook.queue.push(action);
//     wipRoot = {
//       dom: currentRoot.dom,
//       props: currentRoot.props,
//       alternate: currentRoot,
//     };
//     nextUnitOfWork = wipRoot;
//     deletions : FiberOrNull[] = [];
//   };

//   wipFiber.hooks.push(hook);
//   hookIndex++;
//   return [hook.state, setState];
// }

function updateHostComponent(fiber : Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(innerFiber : Fiber, elements : JSXConfig[]) {
  let index = 0;
  let oldFiber = innerFiber.alternate && innerFiber.alternate.child;
  let prevSibling = null;
  while (
    index < elements.length
    || oldFiber != null
  ) {
    const element = elements[index];
    let newFiber : FiberOrNull = null;

    const sameType = oldFiber
      && element
      && element.type == oldFiber.type;
    if (sameType) {
      newFiber = {
        type: (oldFiber as Fiber).type,
        props: element.props,
        dom: (oldFiber as Fiber).dom,
        parent: innerFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
        child: null,
        sibling: null,
        hooks: [],
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: innerFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
        child: null,
        sibling: null,
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

    if (index === 0) {
      innerFiber.child = newFiber;
    } else if (element) {
      (prevSibling as Fiber).sibling = newFiber as Fiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
