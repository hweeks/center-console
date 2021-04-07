/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
import { AlignmentChoices, LayoutChoices } from '../renderer/base';
import Component from './component';

export type TypeAsString = string
export type TypesAsFunction = (props?: Record<string, unknown>) => JSXConfig
export type TypesAsClass = typeof Component
export type TypeTypes = TypeAsString | TypesAsClass | TypesAsFunction
export type BuiltTypeTypes = TypeAsString | Component | TypesAsFunction

export interface JSXConfigGeneric<InstanceProps> {
  type: TypeTypes,
  props: InstanceProps
}

export interface JSXFactoryConfigGeneric<InstanceProps> {
  [key: string]: unknown
  children: JSXConfigGeneric<InstanceProps>[] | string | string[]
}

export type FiberOrNullGeneic<InstanceProps> = FiberGeneric<InstanceProps> | null;

export interface FiberGeneric<InstanceProps> {
  type: TypeTypes
  dom: JSXConfigGeneric<InstanceProps> | null
  effectTag?: string
  props: InstanceProps,
  hooks: unknown[]
  child: FiberGeneric<InstanceProps> | null
  parent: FiberGeneric<InstanceProps> | null
  sibling: FiberGeneric<InstanceProps> | null
  alternate: FiberGeneric<InstanceProps> | null
}

export type MaybePropGeneric<InstanceProps> = Record<keyof InstanceProps, unknown>

export interface JSXConfig {
  type: TypeTypes,
  parent?: JSXConfig['props']
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

export type FiberOrNull = Fiber | null;

export interface Fiber {
  type: TypeTypes
  dom?: JSXConfig
  effectTag?: string
  props: {
    [key: string]: unknown
    children: JSXConfig[]
  },
  hooks: unknown[]
  child?: Fiber
  parent?: Fiber
  sibling?: Fiber
  alternate?: Fiber
}
