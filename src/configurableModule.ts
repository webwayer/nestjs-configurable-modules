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
import { ConfigurableModuleDefinitionFnOrModuleDefinition } from './utils/ConfigurableModuleDefinition'

interface ConfigurableModuleTyping {
  <T extends ConfigurableImport[] = [], TC extends ConfigurableImport[] = [], TS extends ConfigurableImport[] = []>(
    ...args: [...T, ConfigurableModuleDefinitionFnOrModuleDefinition<[...T], [...TC], [...TS]>]
  ): ConfigurableImportInfer.InferCombinedFactory<[...T, ...TC, ...TS]>
}
interface ConfigurableModuleTyping {
  (moduleOrModuleDefinitionFn: ConfigurableModuleDefinitionFnOrModuleDefinition<[], [], []>): () => DynamicModule
}

function configurableModuleImplementation(...args) {
  const configurableImports = args.slice(0, args.length - 1) as ConfigurableImport[]
  const moduleOrModuleDefinitionFn = args[args.length - 1] as ConfigurableModuleDefinitionFnOrModuleDefinition<
    any,
    any,
    any
  >

  return function (arg: object | AsyncParams<object>) {
    const module = createNamedClass((this?.name || '') + 'ConfigurableModule')
    const imports = configurableImports.map(c => setupConfigurableImport(c, arg))

    if (typeof moduleOrModuleDefinitionFn !== 'function') {
      const moduleDefinition = moduleOrModuleDefinitionFn

      const internalConfigurableImports = (moduleDefinition.configurableImports || []).map(c =>
        setupConfigurableImport(c, arg),
      )
      const internalSmartImports = (moduleDefinition.smartImports || []).map(c => setupConfigurableImport(c, arg))

      return appendImports({ module, ...moduleDefinition }, [
        ...imports,
        ...internalConfigurableImports,
        ...internalSmartImports,
      ])
    }

    if (isAsyncParams(arg)) {
      const moduleDefinition = moduleOrModuleDefinitionFn(imports)

      const internalConfigurableImports = (moduleDefinition.configurableImports || []).map(c =>
        setupConfigurableImport(c, arg),
      )
      const internalSmartImports = (moduleDefinition.smartImports || []).map(c => setupConfigurableImport(c, arg))

      return appendImports(
        {
          module,
          ...moduleOrModuleDefinitionFn(imports),
        },
        [...imports, ...internalConfigurableImports, ...internalSmartImports],
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

    const moduleDefinition = moduleOrModuleDefinitionFn(imports, ...initiatedConfigs)

    const internalConfigurableImports = (moduleDefinition.configurableImports || []).map(c =>
      setupConfigurableImport(c, arg),
    )
    const internalSmartImports = (moduleDefinition.smartImports || []).map(c => setupConfigurableImport(c, arg))

    return appendImports({ module, ...moduleOrModuleDefinitionFn(imports, ...initiatedConfigs) }, [
      ...imports,
      ...internalConfigurableImports,
      ...internalSmartImports,
    ])
  }
}
export const configurableModule = configurableModuleImplementation as ConfigurableModuleTyping
export const smartModule = configurableModuleImplementation as ConfigurableModuleTyping
