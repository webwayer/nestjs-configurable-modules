import { configLabeledImporter } from './configLabeledImporter'
import { TestConfigClass, uncoverModule } from './utils/spec-heplers'

describe('configLabeledImporter', () => {
  it('simple', () => {
    const factory = configLabeledImporter(TestConfigClass, label => label + 'XXX')
    const module = factory('inline-label')

    expect(uncoverModule(module)).toMatchObject({
      module: 'ConfigLabeledImporter_inline-label',
      providers: [
        {
          provide: 'TestConfigClass',
          useExisting: 'inline-labelXXXTestConfigClass',
        },
      ],
      exports: ['TestConfigClass'],
    })
  })

  it('object-config', () => {
    const factory = configLabeledImporter({ config: TestConfigClass }, label => label + 'XXX')
    const module = factory('inline-label')

    expect(uncoverModule(module)).toMatchObject({
      module: 'ConfigLabeledImporter_inline-label',
      providers: [
        {
          provide: 'TestConfigClass',
          useExisting: 'inline-labelXXXTestConfigClass',
        },
      ],
      exports: ['TestConfigClass'],
    })
  })

  it('on Provider', () => {
    class Provider {
      static factory = configLabeledImporter(TestConfigClass, label => label + 'XXX')
    }

    const module = Provider.factory('inline-label')

    expect(uncoverModule(module)).toMatchObject({
      module: 'ProviderConfigLabeledImporter_inline-label',
      providers: [
        {
          provide: 'TestConfigClass',
          useExisting: 'inline-labelXXXTestConfigClass',
        },
      ],
      exports: ['TestConfigClass'],
    })
  })
})
