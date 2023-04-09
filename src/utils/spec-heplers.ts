import { ConfigurableImportInfer } from './ConfigurableImportInfer'

export function uncoverModule(value) {
  if (typeof value === 'function') {
    if (Function.prototype.toString.call(value).startsWith('class')) {
      return value.name
    } else {
      return value
    }
  }

  if (Array.isArray(value)) {
    return value.map(uncoverModule)
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    typeof value !== 'undefined' &&
    Object.keys(value).length > 0 &&
    value.constructor === Object
  ) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, uncoverModule(v)]))
  }

  return value
}

export class TestConfigClass {
  requiredProp: string
  optionalProp?: string
  defaultProp? = 'default'
}

export class TestConfigClassLabeled extends TestConfigClass {
  static label = 'static_label' as const
}

export class TestConfigClassPrefixed extends TestConfigClass {
  static prefix = 'static_prefix_' as const
}

export const factoryProps = {
  requiredProp: 'required',
}

export const resultProps = {
  requiredProp: 'required',
  defaultProp: 'default',
}

export function prefixProps<T, P extends string>(props: T, prefix: P): ConfigurableImportInfer.PrefixedProps<T, P> {
  return Object.fromEntries(Object.entries(props).map(([k, v]) => [`${prefix}${k}`, v])) as any
}

export function asyncFactoryArg(props) {
  return {
    imports: [{ module: class SomeImportModule {} }],
    inject: [class SomeImportModule {}],
    useFactory: () => props,
  }
}

export function testConfigurableModule(...imports: object[]) {
  return {
    module: 'ConfigurableModule',
    imports,
  }
}

export function testConfigurableModuleComplete(imports: object[], module: object, name = 'Provider') {
  return {
    module: name + 'ConfigurableModule',
    imports,
    ...module,
  }
}

export function testConfigurableImportModule(name?: string, useValue: object = resultProps) {
  return {
    module: (name || 'TestConfigClass') + 'ConfigurableClassModule',
    providers: [
      {
        useValue,
        provide: name || 'TestConfigClass',
      },
    ],
    exports: [name || 'TestConfigClass'],
  }
}

export function testAsyncConfigurableImportModule(name?: string) {
  return {
    module: (name || 'TestConfigClass') + 'ConfigurableClassModule',
    providers: [
      {
        imports: [{ module: 'SomeImportModule' }],
        inject: ['SomeImportModule'],
        useFactory: expect.any(Function),
        provide: name || 'TestConfigClass',
      },
    ],
    exports: [name || 'TestConfigClass'],
  }
}
