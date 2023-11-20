import { DynamicModule } from '@nestjs/common'

import { ConfigurableImport } from './ConfigurableImport'
import { ConfigurableImportInfer } from './ConfigurableImportInfer'

export type ConfigurableModuleDefinition<
  TC extends ConfigurableImport[],
  TS extends ConfigurableImport[],
> = Partial<DynamicModule> & {
  configurableImports?: [...TC]
  smartImports?: [...TS]
}

export type ConfigurableModuleDefinitionFn<
  T extends ConfigurableImport[],
  TC extends ConfigurableImport[],
  TS extends ConfigurableImport[],
> = (
  imports: DynamicModule[],
  ...configs: ConfigurableImportInfer.InferOnlyClasses<T>
) => ConfigurableModuleDefinition<TC, TS>

export type ConfigurableModuleDefinitionFnOrModuleDefinition<
  T extends ConfigurableImport[],
  TC extends ConfigurableImport[],
  TS extends ConfigurableImport[],
> = ConfigurableModuleDefinitionFn<T, TC, TS> | ConfigurableModuleDefinition<TC, TS>
