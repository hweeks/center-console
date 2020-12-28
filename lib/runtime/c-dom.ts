import ConsoleRender from "..";
import ConsoleElement, { ValidProperties } from "../element";
import { ElementInput } from "./jsx-runtime";

const isEvent = (key) => key.startsWith('on');
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;
let wipFiber = null;
let hookIndex = null;

export function createElement(type: unknown, config: {props:unknown, children?:never[]}) {
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

function createTextNode(text: string) : ElementInput {
  const castedText = `${text}`;
  return {
    props: {
      nodeValue: castedText,
      children: [],
      nodeLength: castedText.length,
    },
  };
}

function createDom(fiber) {
  const dom = new ConsoleElement();
  updateDom(dom, {}, fiber.props);
  return dom;
}

function updateDom(dom, prevProps, nextProps) {
  // Remove old or changed event listeners
  // Object.keys(prevProps)
  //   .filter(isEvent)
  //   .filter(
  //     (key) => !(key in nextProps)
  //       || isNew(prevProps, nextProps)(key),
  //   )
  //   .forEach((name) => {
  //     const eventType = name
  //       .toLowerCase()
  //       .substring(2);
  //     dom.removeEventListener(
  //       eventType,
  //       prevProps[name],
  //     );
  //   });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      debugger
      dom.set(name as ValidProperties, null);
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom.set(name as ValidProperties, nextProps[name]);
    });

  // Add event listeners
  // Object.keys(nextProps)
  //   .filter(isEvent)
  //   .filter(isNew(prevProps, nextProps))
  //   .forEach((name) => {
  //     const eventType = name
  //       .toLowerCase()
  //       .substring(2);
  //     dom.addEventListener(
  //       eventType,
  //       nextProps[name],
  //     );
  //   });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  if (
    fiber.effectTag === 'PLACEMENT'
    && fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom);
  } else if (
    fiber.effectTag === 'UPDATE'
    && fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props,
    );
    debugger
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

export function render(element : ElementInput, container: ConsoleElement | ConsoleRender) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
  workLoop()
}

function workLoop() {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork,
    );
    shouldYield = !nextUnitOfWork
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  setImmediate(workLoop);
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

export function useState(initial) {
  const oldHook = wipFiber && wipFiber.alternate
    && wipFiber.alternate.hooks
    && wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(innerFiber, elements) {
  let index = 0;
  let oldFiber = innerFiber.alternate && innerFiber.alternate.child;
  let prevSibling = null;
  while (
    index < elements.length
    || oldFiber != null
  ) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber
      && element
      && element.type == oldFiber.type;
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: innerFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
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
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
