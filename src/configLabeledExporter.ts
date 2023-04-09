import { configurableModule } from './configurableModule'
import { CreateModuleLabeled } from './configurableModuleLabeled'
import { AsyncParams } from './utils/AsyncParams'
import { createNamedClass } from './utils/helpers'
import { ConfigurableClass, ConfigurableImport } from './utils/ConfigurableImport'

interface ConfigLabeledExporterTyping {
  <T1 extends ConfigurableClass, T extends ConfigurableClass[]>(
    ...args: [T1, ...T, (label: string) => string]
  ): CreateModuleLabeled<[T1, ...T]>
}

function configLabeledExporterImplementation(...args) {
  const configurableClasses = args.slice(0, args.length - 1) as ConfigurableClass[]
  const tokenFn = args[args.length - 1] as (label: string) => string

  return function (label: string, arg?: object | AsyncParams<object>) {
    const module = createNamedClass((this?.name || '') + 'ConfigLabeledExporter_' + label)

    const updatedConfigs = configurableClasses.map(configurableClass => {
      if (ConfigurableImport.isConfigurableClass(configurableClass)) {
        return {
          config: configurableClass,
          token: tokenFn(label) + (configurableClass.token || configurableClass.name),
        }
      } else {
        return {
          ...configurableClass,
          token:
            tokenFn(label) +
            (configurableClass.token || configurableClass.config.token || configurableClass.config.name),
        }
      }
    })

    const configurableModuleFactory = (<any>configurableModule)(...updatedConfigs, {
      module,
      exports: updatedConfigs.map(c => c.token),
      global: true,
    })

    if (typeof arg === 'object') {
      return configurableModuleFactory(arg)
    } else {
      return function (arg: object) {
        return configurableModuleFactory(arg[label])
      }
    }
  }
}

export const configLabeledExporter = configLabeledExporterImplementation as ConfigLabeledExporterTyping
