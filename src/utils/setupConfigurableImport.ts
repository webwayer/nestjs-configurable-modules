import { pickLabeledAndPrefixed, setupConfigurableClass, createNamedClass } from './helpers'
import { AsyncParams, isAsyncParams } from './AsyncParams'
import { ConfigurableImport } from './ConfigurableImport'

export function setupConfigurableImport(configurableImport: ConfigurableImport, arg: AsyncParams<object> | object) {
  if (ConfigurableImport.isConfigurableModule(configurableImport)) {
    return configurableImport(arg)
  }

  if (ConfigurableImport.isConfigurableClass(configurableImport)) {
    if (isAsyncParams(arg)) {
      return {
        module: createNamedClass(configurableImport.name + 'ConfigurableClassModule'),
        providers: [
          {
            imports: arg.imports,
            inject: arg.inject,
            async useFactory(...args) {
              return setupInstanceFromConfigurableClass(configurableImport, await arg.useFactory(...args))
            },
            provide: configurableImport.token || configurableImport,
          },
        ],
        exports: [configurableImport.token || configurableImport],
      }
    } else {
      return {
        module: createNamedClass(configurableImport.name + 'ConfigurableClassModule'),
        providers: [
          {
            useValue: setupInstanceFromConfigurableClass(configurableImport, arg),
            provide: configurableImport.token || configurableImport,
          },
        ],
        exports: [configurableImport.token || configurableImport],
      }
    }
  }

  if (ConfigurableImport.isObjectWithConfigurableModule(configurableImport)) {
    if (isAsyncParams(arg)) {
      return configurableImport.config({
        imports: arg.imports,
        inject: arg.inject,
        async useFactory(...args) {
          return pickLabeledAndPrefixed(
            await arg.useFactory(...args),
            configurableImport.label,
            configurableImport.prefix,
          )
        },
      })
    } else {
      return configurableImport.config(pickLabeledAndPrefixed(arg, configurableImport.label, configurableImport.prefix))
    }
  }

  if (ConfigurableImport.isObjectWithConfigurableClass(configurableImport)) {
    if (isAsyncParams(arg)) {
      return {
        module: createNamedClass(configurableImport.config.name + 'ConfigurableClassModule'),
        providers: [
          {
            imports: arg.imports,
            inject: arg.inject,
            async useFactory(...args) {
              return setupInstanceFromObjectWithConfigurableClass(configurableImport, await arg.useFactory(...args))
            },
            provide: configurableImport.token || configurableImport.config,
          },
        ],
        exports: [configurableImport.token || configurableImport.config],
      }
    } else {
      return {
        module: createNamedClass(configurableImport.config.name + 'ConfigurableClassModule'),
        providers: [
          {
            useValue: setupInstanceFromObjectWithConfigurableClass(configurableImport, arg),
            provide: configurableImport.token || configurableImport.config,
          },
        ],
        exports: [configurableImport.token || configurableImport.config],
      }
    }
  }

  throw new Error(
    `ConfigurableModule: ${JSON.stringify(configurableImport)} of [${typeof configurableImport}], ${JSON.stringify(
      arg,
    )} is not valid config base for module`,
  )
}

export function setupInstanceFromConfigurableClass(config: ConfigurableImport.ConfigurableClass, arg?: object) {
  return setupConfigurableClass(config, pickLabeledAndPrefixed(arg, config.label, config.prefix))
}

export function setupInstanceFromObjectWithConfigurableClass(
  config: ConfigurableImport.ObjectWithConfigurableClass,
  arg?: object,
) {
  return setupConfigurableClass(
    config.config,
    pickLabeledAndPrefixed(
      arg,
      typeof config.label === 'string' ? config.label : config.config.label,
      typeof config.prefix === 'string' ? config.prefix : config.config.prefix,
    ),
  )
}
