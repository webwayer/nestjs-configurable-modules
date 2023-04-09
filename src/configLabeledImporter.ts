import { DynamicModule } from '@nestjs/common'
import { createNamedClass } from './utils/helpers'
import { ConfigurableClass, ConfigurableImport } from './utils/ConfigurableImport'

interface CreateConfigLabeledImporterTyping {
  <T1 extends ConfigurableClass, T extends ConfigurableClass[]>(...args: [T1, ...T, (label: string) => string]): (
    label: string,
  ) => DynamicModule
}

export function configLabeledImporterImplementation(...args) {
  const configurableClasses = args.slice(0, args.length - 1) as ConfigurableClass[]
  const tokenFn = args[args.length - 1] as (label: string) => string

  return function (label: string) {
    const module = createNamedClass((this?.name || '') + 'ConfigLabeledImporter_' + label)

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

    return {
      module,
      providers: updatedConfigs.map(c => ({ provide: c.config, useExisting: c.token })),
      exports: updatedConfigs.map(c => c.config),
    }
  }
}

export const configLabeledImporter = configLabeledImporterImplementation as CreateConfigLabeledImporterTyping
