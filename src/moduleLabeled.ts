import { DynamicModule } from '@nestjs/common'
import { createNamedClass } from './utils/helpers'

export function moduleLabeled(moduleFactory: (label: string) => Partial<DynamicModule>) {
  return function (label: string) {
    const module = createNamedClass((this?.name || '') + 'Module_' + label)

    return { module, ...moduleFactory(label) }
  }
}
