/* eslint-disable prefer-object-spread */

import { ConsoleRender } from '../render';
import ConsoleElement, { ValidProperties } from '../element';
import {createElement, render} from "./c-dom";

export interface ElementInput {
  props: {
    [value: string]: any
    children: ElementInput[]
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

function render2(element: ElementInput, container: ConsoleElement | ConsoleRender) {
  const innerContainer = new ConsoleElement();
  const isProperty = (key: string) => key !== 'children';
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      innerContainer.set(name as ValidProperties, element.props[name]);
    });
  element.props.children.forEach((child) => render(child, innerContainer));
  container.appendChild(innerContainer);
  if (container.finalRender) container.finalRender();
}

export { createElement as jsxs, render, createElement as jsx };
