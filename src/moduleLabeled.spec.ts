import { moduleLabeled } from './moduleLabeled'
import { uncoverModule } from './utils/spec-heplers'

describe('moduleLabeled', () => {
  it('simple', () => {
    const factory = moduleLabeled(label => ({ exports: [label] }))
    const module = factory('inline-label')

    expect(uncoverModule(module)).toMatchObject({
      module: 'Module_inline-label',
      exports: ['inline-label'],
    })
  })

  it('on Provider', () => {
    class Provider {
      static moduleCustom = moduleLabeled(label => ({ exports: [label] }))
    }

    const module = Provider.moduleCustom('inline-label')

    expect(uncoverModule(module)).toMatchObject({
      module: 'ProviderModule_inline-label',
      exports: ['inline-label'],
    })
  })
})
