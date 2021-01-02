/* eslint-disable prefer-object-spread */
import { createElement, render } from './c-dom';

export interface ElementInput {
  props?: {
    [value: string]: any
    children: ElementInput[]
  }
}

export { createElement as jsxs, render, createElement as jsx };
