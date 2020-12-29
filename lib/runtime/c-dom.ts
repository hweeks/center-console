import ConsoleRender from "..";
import Component from "../component";
import ConsoleElement, { ValidProperties } from "../element";
import { ElementInput } from "./jsx-runtime";

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

export function createElement(type: string | typeof Component, config: {props:Record<string, unknown>, children?:JSX.IntrinsicElements[]}) {
  debugger
  if (typeof type === 'string') {
    const { children = [], ...props } = config;
    const childrenProps = [].concat(children as any);
    return {
      type,
      props: {
        ...props,
        children: childrenProps.map((child) => (typeof child === 'object' ? child : createTextNode(child))),
      },
    };
  } else {
    const baseClass = new type(config.props, config.children)
    const newJsx = {...baseClass.render()};
    newJsx.props.self = baseClass;
    return newJsx;
  }
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

function createDom(fiber: Fiber) {
  const dom = new ConsoleElement();
  updateDom(dom, {}, fiber.props as Record<keyof ConsoleElement, any>);
  return dom;
}

type MaybeProp = Record<keyof ConsoleElement, any> | Record<string, unknown>

function updateDom(dom : ConsoleElement, prevProps : MaybeProp, nextProps : MaybeProp) {

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom.set(name as ValidProperties, null as any);
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom.set(name as ValidProperties, nextProps[name as ValidProperties]);
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
    domParentFiber = domParentFiber?.parent;
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
      fiber?.alternate?.props || {},
      fiber?.props || {},
    );
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child || null);
  commitWork(fiber.sibling || null);
}

function commitDeletion(fiber: Fiber, domParent: ConsoleElement) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child as Fiber, domParent);
  }
}

interface Fiber {
  type: (props: unknown) => ConsoleElement | string
  dom: ConsoleElement
  effectTag?: string
  props: {
    [key: string]: unknown,
    children?: [ElementInput]
  },
  child?: Fiber,
  parent?: Fiber
  sibling?: Fiber
  alternate: FiberOrNull,
}

type FiberOrNull = Fiber | null;

export function render(element : ElementInput, container: ConsoleElement) {
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
    ) as FiberOrNull;
    shouldYield = !nextUnitOfWork
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  setImmediate(workLoop);
}

function performUnitOfWork(fiber: Fiber) {
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
    nextFiber = nextFiber.parent as Fiber;
  }
}

function updateFunctionComponent(fiber : Fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
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

function reconcileChildren(innerFiber : Fiber, elements : ConsoleElement[]) {
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
        type: oldFiber?.type,
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
