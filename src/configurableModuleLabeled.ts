import { DynamicModule } from '@nestjs/common'
import { configurableModule } from './configurableModule'
import { AsyncParams } from './utils/AsyncParams'
import { createNamedClass } from './utils/helpers'
import { ConfigurableImport } from './utils/ConfigurableImport'
import { ConfigurableImportInfer } from './utils/ConfigurableImportInfer'

type ModuleFnLabeled<T extends ConfigurableImport[]> = (
  label: string,
  imports: DynamicModule[],
  ...configs: ConfigurableImportInfer.InferOnlyClasses<T>
) => Partial<DynamicModule>
export interface CreateModuleLabeled<T extends ConfigurableImport[]> {
  <L extends string>(
    label: L,
    arg: ConfigurableImportInfer.InferCombinedProps<T> | AsyncParams<ConfigurableImportInfer.InferCombinedProps<T>>,
  ): DynamicModule
  <L extends string>(label: L): ConfigurableImportInfer.InferCombinedFactory<
    [{ config: ConfigurableImportInfer.InferCombinedFactory<T>; label: L }]
  >
}
interface ConfigurableModuleLabeledTyping {
  <T1 extends ConfigurableImport, T extends ConfigurableImport[]>(
    ...args: [T1, ...T, ModuleFnLabeled<[T1, ...T]>]
  ): CreateModuleLabeled<[T1, ...T]>
}

function configurableModuleLabeledImplementation(...args) {
  const configurableImports = args.slice(0, args.length - 1) as ConfigurableImport[]
  const moduleFnLabeled = args[args.length - 1] as (...args) => ModuleFnLabeled<any>

  return function (label: string, arg?: object | AsyncParams<object>) {
    const module = createNamedClass((this?.name || '') + 'ConfigurableModule_' + label)
    const proxyModule = createNamedClass((this?.name || '') + 'ConfigurableModuleProxy_' + label)

    const configurableModuleFactory = (<any>configurableModule)(
      {
        label,
        config: (<any>configurableModule)(...configurableImports, (...args) => ({
          module,
          ...moduleFnLabeled(label, ...args),
        })),
      },
      imports => ({ module: proxyModule, exports: imports }),
    )

    if (typeof arg === 'object') {
      return configurableModuleFactory({ [label]: arg })
    } else {
      return configurableModuleFactory
    }
  }
}
export const configurableModuleLabeled = configurableModuleLabeledImplementation as ConfigurableModuleLabeledTyping
