import { DynamicModule, Type } from '@nestjs/common'
import { AsyncParams } from './AsyncParams'
import { CleanRecursively, Spread } from './helpers.types'
import { ConfigurableImport } from './ConfigurableImport'

export namespace ConfigurableImportInfer {
  interface Class<T = any> extends Type<T> {
    token?: string
  }
  interface Object {
    token?: string
  }

  interface Labeled<L extends string> {
    label: L
  }
  interface Prefixed<P extends string> {
    prefix: P
  }

  export type PrefixedProps<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : never]: T[K]
  }
  export type LabeledProps<T, L extends string> = Record<L, T>
  export type LabeledPrefixedProps<T, L extends string, P extends string> = LabeledProps<PrefixedProps<T, P>, L>

  type InferClass<T extends Class> = T extends Class<infer U> & Labeled<infer L> & Prefixed<infer P>
    ? LabeledPrefixedProps<U, L, P>
    : T extends Class<infer U> & Labeled<infer L>
    ? LabeledProps<U, L>
    : T extends Class<infer U> & Prefixed<infer P>
    ? PrefixedProps<U, P>
    : T extends Class<infer U>
    ? U
    : never
  type InferFactory<T extends Function> = T extends (arg: AsyncParams<infer U>) => DynamicModule
    ? U extends object
      ? U
      : null
    : null
  type InferObjectWithClass<T extends Object & { config: Class }> = T extends Object & {
    config: Class<infer U>
  } & Labeled<infer L> &
    Prefixed<infer P>
    ? LabeledPrefixedProps<U, L, P>
    : T extends Object & { config: Class<infer U> & Prefixed<infer P> } & Labeled<infer L>
    ? LabeledPrefixedProps<U, L, P>
    : T extends Object & { config: Class<infer U> } & Labeled<infer L>
    ? LabeledProps<U, L>
    : T extends Object & { config: Class<infer U> & Labeled<infer L> } & Prefixed<infer P>
    ? LabeledPrefixedProps<U, L, P>
    : T extends Object & { config: Class<infer U> } & Prefixed<infer P>
    ? PrefixedProps<U, P>
    : T extends Object & { config: Class }
    ? InferClass<T['config']>
    : never
  type InferObjectWithFactory<T extends Object & { config: Function }> = T extends Object & {
    config: Function
  } & Labeled<infer L> &
    Prefixed<infer P>
    ? LabeledPrefixedProps<InferFactory<T['config']>, L, P>
    : T extends Object & { config: Function } & Labeled<infer L>
    ? LabeledProps<InferFactory<T['config']>, L>
    : T extends Object & { config: Function } & Prefixed<infer P>
    ? PrefixedProps<InferFactory<T['config']>, P>
    : T extends Object & { config: Function }
    ? InferFactory<T['config']>
    : never

  type InferOne<T> = T extends Class
    ? InferClass<T>
    : T extends () => DynamicModule
    ? {}
    : T extends Function
    ? InferFactory<T>
    : T extends Object & { config: Class }
    ? InferObjectWithClass<T>
    : T extends Object & { config: Function }
    ? InferObjectWithFactory<T>
    : T
  type InferMultiple<A extends any[]> = A extends [infer L, ...infer R] ? [InferOne<L>, ...InferMultiple<R>] : A

  type InferOnlyClass<T> = T extends Class<infer U> | (Object & { config: Class<infer U> }) ? CleanRecursively<U> : null
  type InferOnlyClassesArray<A extends any[]> = A extends [infer L, ...infer R]
    ? [InferOnlyClass<L>, ...InferOnlyClassesArray<R>]
    : A
  export type InferOnlyClasses<T extends ConfigurableImport[]> = InferOnlyClassesArray<T>

  export type InferConfigurableImport<T extends ConfigurableImport> = InferOne<T>
  export type InferConfigurableImports<T extends ConfigurableImport[]> = InferMultiple<T>
  export type InferCombinedProps<T extends ConfigurableImport[]> = CleanRecursively<Spread<InferConfigurableImports<T>>>
  export type InferCombinedFactory<T extends ConfigurableImport[]> = T extends Array<() => DynamicModule>
    ? () => DynamicModule
    : (arg: InferCombinedProps<T> | AsyncParams<InferCombinedProps<T>>) => DynamicModule
}
