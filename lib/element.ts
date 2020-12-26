export type SelfAlignments = 'top' | 'center' | 'bottom'
export type ContentAlignments = 'left' | 'center' | 'right'
export type ValidProperties = 'alignSelf' | 'alignContent' | 'height' | 'width'

export default class ConsoleElement {
  children: ConsoleElement[]

  'alignSelf'?: SelfAlignments

  alignContent?: ContentAlignments

  height?: number

  width?: number

  finalRender: void

  constructor() {
    this.children = [];
  }

  set<K extends keyof ConsoleElement>(this: ConsoleElement, property: K, value: ConsoleElement[K]) {
    if (typeof this[property] !== 'function') {
      this[property] = value;
    }
  }

  appendChild(child: any) {
    this.children.push(child);
  }
}
