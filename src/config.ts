import { configurableModule } from './configurableModule'
import { createNamedClass } from './utils/helpers'
import { ConfigurableImport } from './utils/ConfigurableImport'
import { ConfigurableImportInfer } from './utils/ConfigurableImportInfer'

interface ConfigTyping {
  <T1 extends ConfigurableImport, T extends ConfigurableImport[]>(
    ...args: [T1, ...T]
  ): ConfigurableImportInfer.InferCombinedFactory<[T1, ...T]>
  <T1 extends ConfigurableImport, T extends ConfigurableImport[]>(
    ...args: [T1, ...T, boolean]
  ): ConfigurableImportInfer.InferCombinedFactory<[T1, ...T]>
}

function configImplementation(...args) {
  const configurableImports = args.filter(c => typeof c !== 'boolean') as ConfigurableImport[]
  const global = typeof args[args.length - 1] === 'boolean' ? args[args.length - 1] : false

  return function (...args) {
    const module = createNamedClass((this?.name || '') + 'Config')

    return (<any>configurableModule)(...configurableImports, imports => ({
      module,
      exports: imports,
      global,
    }))(...args)
  }
}

export const config = configImplementation as ConfigTyping
