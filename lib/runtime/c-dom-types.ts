import { AlignmentChoices, LayoutChoices } from '../center-console';
import Component from '../component';

export type TypeAsString = string
export type TypesAsFunction = (props?: Record<string, unknown>) => JSXConfig
export type TypesAsClass = typeof Component
export type TypeTypes = TypeAsString | TypesAsClass | TypesAsFunction
export type BuiltTypeTypes = TypeAsString | Component | TypesAsFunction

export interface JSXConfig {
  type: TypeTypes,
  props: {
    [key: string]: unknown
    width?: number
    height?: number
    alignSelf?: LayoutChoices
    alignContent?: AlignmentChoices
    children: JSXConfig[]
    self?: Component
  }
}

export interface JSXFactoryConfig {
  [key: string]: unknown
  children: JSXConfig[] | string | string[]
}

export type MaybeProp = Record<string, any>

export interface Fiber {
  type: TypeTypes
  dom: JSXConfig | null
  effectTag?: string
  props: {
    [key: string]: unknown
    children: JSXConfig[]
  },
  hooks: unknown[]
  child: FiberOrNull
  parent: FiberOrNull
  sibling: FiberOrNull
  alternate: FiberOrNull
}

export type FiberOrNull = Fiber | null;
