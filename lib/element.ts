import Component from './component';

export type SelfAlignments = 'top' | 'center' | 'bottom'
export type ContentAlignments = 'left' | 'center' | 'right'
export type ValidProperties = 'alignSelf' | 'alignContent' | 'height' | 'width'

export default class ConsoleElement {
  children: ConsoleElement[]

  alignSelf?: SelfAlignments

  alignContent?: ContentAlignments

  height?: number

  width?: number

  parent?: Component

  self?: Component

  finalRender: void

  constructor(parentComp?: Component) {
    this.children = [];
    this.parent = parentComp;
  }

  set<K extends keyof ConsoleElement>(this: ConsoleElement, property: K, value: ConsoleElement[K]) {
    if (typeof this[property] !== 'function') {
      this[property] = value;
    }
  }

  appendChild(child: ConsoleElement) {
    this.children.push(child);
  }

  removeChild(child : ConsoleElement) {
    this.children = this.children.filter((innerChild) => innerChild === child);
  }
}
