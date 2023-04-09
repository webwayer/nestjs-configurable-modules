import type { DynamicModule, Type } from '@nestjs/common'
import { AsyncParams } from './AsyncParams'

export namespace ConfigurableImport {
  export interface ConfigurableClass extends Type {
    prefix?: string
    label?: string
    token?: string
  }
  export type ConfigurableModule = (arg: AsyncParams<any>) => DynamicModule
  export interface ObjectWithConfigurableClass {
    prefix?: string
    label?: string
    token?: string
    config: ConfigurableClass
  }
  export interface ObjectWithConfigurableModule {
    prefix?: string
    label?: string
    config: ConfigurableModule
  }

  export type FlexibleArgConfigurableModule = (arg: object | AsyncParams<object>) => DynamicModule

  export function isConfigurableClass(c: ConfigurableImport): c is ConfigurableClass {
    return typeof c === 'function' && /^class\s/.test(Function.prototype.toString.call(c))
  }
  export function isConfigurableModule(c: ConfigurableImport): c is FlexibleArgConfigurableModule {
    return typeof c === 'function' && !/^class\s/.test(Function.prototype.toString.call(c))
  }
  export function isObjectWithConfigurableClass(c: ConfigurableImport): c is ObjectWithConfigurableClass {
    return typeof c !== 'function' && isConfigurableClass(c.config)
  }
  export function isObjectWithConfigurableModule(c: ConfigurableImport): c is {
    prefix?: string
    label?: string
    config: FlexibleArgConfigurableModule
  } {
    return typeof c !== 'function' && isConfigurableModule(c.config)
  }
}

export type ConfigurableModule = ConfigurableImport.ConfigurableModule | ConfigurableImport.ObjectWithConfigurableModule
export type ConfigurableClass = ConfigurableImport.ConfigurableClass | ConfigurableImport.ObjectWithConfigurableClass

export type ConfigurableImport = ConfigurableClass | ConfigurableModule
