import { DynamicModule } from '@nestjs/common'
import { AsyncParams, isAsyncParams } from './utils/AsyncParams'
import {
  setupConfigurableImport,
  setupInstanceFromConfigurableClass,
  setupInstanceFromObjectWithConfigurableClass,
} from './utils/setupConfigurableImport'
import { appendImports, createNamedClass } from './utils/helpers'
import { ConfigurableImport } from './utils/ConfigurableImport'
import { ConfigurableImportInfer } from './utils/ConfigurableImportInfer'

type ModuleOrModuleDefinitionFn<T extends ConfigurableImport[]> =
  | Partial<DynamicModule>
  | ((imports: DynamicModule[], ...configs: ConfigurableImportInfer.InferOnlyClasses<T>) => Partial<DynamicModule>)
interface ConfigurableModuleTyping {
  <T1 extends ConfigurableImport, T extends ConfigurableImport[]>(
    ...args: [T1, ...T, ModuleOrModuleDefinitionFn<[T1, ...T]>]
  ): ConfigurableImportInfer.InferCombinedFactory<[T1, ...T]>
}
interface ConfigurableModuleTyping {
  (moduleOrModuleDefinitionFn: ModuleOrModuleDefinitionFn<[]>): () => DynamicModule
}

function configurableModuleImplementation(...args) {
  const configurableImports = args.slice(0, args.length - 1) as ConfigurableImport[]
  const moduleOrModuleDefinitionFn = args[args.length - 1] as ModuleOrModuleDefinitionFn<any>

  return function (arg: object | AsyncParams<object>) {
    const module = createNamedClass((this?.name || '') + 'ConfigurableModule')
    const imports = configurableImports.map(c => setupConfigurableImport(c, arg))

    if (typeof moduleOrModuleDefinitionFn !== 'function') {
      return appendImports({ module, ...moduleOrModuleDefinitionFn }, imports)
    }

    if (isAsyncParams(arg)) {
      return appendImports(
        {
          module,
          ...moduleOrModuleDefinitionFn(imports),
        },
        imports,
      )
    }

    const initiatedConfigs = configurableImports.map(c => {
      if (ConfigurableImport.isConfigurableClass(c)) {
        return setupInstanceFromConfigurableClass(c, arg)
      } else if (ConfigurableImport.isObjectWithConfigurableClass(c)) {
        return setupInstanceFromObjectWithConfigurableClass(c, arg)
      } else {
        return null
      }
    })

    return appendImports({ module, ...moduleOrModuleDefinitionFn(imports, ...initiatedConfigs) }, imports)
  }
}
export const configurableModule = configurableModuleImplementation as ConfigurableModuleTyping
export const smartModule = configurableModuleImplementation as ConfigurableModuleTyping
