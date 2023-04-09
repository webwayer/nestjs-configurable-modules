import { configLabeledExporter } from './configLabeledExporter'
import { factoryProps, resultProps, TestConfigClass, uncoverModule } from './utils/spec-heplers'

describe('configLabeledExporter', () => {
  it('simple', () => {
    const factory = configLabeledExporter(TestConfigClass, label => label + 'XXX')
    const module = factory('inline-label', factoryProps)

    expect(uncoverModule(module)).toMatchObject({
      module: 'ConfigLabeledExporter_inline-label',
      exports: ['inline-labelXXXTestConfigClass'],
      global: true,
      imports: [
        {
          module: 'TestConfigClassConfigurableClassModule',
          providers: [
            {
              useValue: resultProps,
              provide: 'inline-labelXXXTestConfigClass',
            },
          ],
          exports: ['inline-labelXXXTestConfigClass'],
        },
      ],
    })
  })

  it('object-config', () => {
    const factory = configLabeledExporter({ config: TestConfigClass }, label => label + 'XXX')
    const module = factory('inline-label', factoryProps)

    expect(uncoverModule(module)).toMatchObject({
      module: 'ConfigLabeledExporter_inline-label',
      exports: ['inline-labelXXXTestConfigClass'],
      global: true,
      imports: [
        {
          module: 'TestConfigClassConfigurableClassModule',
          providers: [
            {
              useValue: resultProps,
              provide: 'inline-labelXXXTestConfigClass',
            },
          ],
          exports: ['inline-labelXXXTestConfigClass'],
        },
      ],
    })
  })

  it('on Provider', () => {
    class Provider {
      static factory = configLabeledExporter(TestConfigClass, label => label + 'XXX')
    }

    const module = Provider.factory('inline-label', factoryProps)

    expect(uncoverModule(module)).toMatchObject({
      module: 'ProviderConfigLabeledExporter_inline-label',
      exports: ['inline-labelXXXTestConfigClass'],
      global: true,
      imports: [
        {
          module: 'TestConfigClassConfigurableClassModule',
          providers: [
            {
              useValue: resultProps,
              provide: 'inline-labelXXXTestConfigClass',
            },
          ],
          exports: ['inline-labelXXXTestConfigClass'],
        },
      ],
    })
  })

  it('two-step', () => {
    class Provider {
      static forRootCustom = configLabeledExporter(TestConfigClass, label => label + 'XXX')
    }
    const module = Provider.forRootCustom('inline-label')({ 'inline-label': factoryProps })

    expect(uncoverModule(module)).toMatchObject({
      module: 'ProviderConfigLabeledExporter_inline-label',
      exports: ['inline-labelXXXTestConfigClass'],
      global: true,
      imports: [
        {
          module: 'TestConfigClassConfigurableClassModule',
          providers: [
            {
              useValue: resultProps,
              provide: 'inline-labelXXXTestConfigClass',
            },
          ],
          exports: ['inline-labelXXXTestConfigClass'],
        },
      ],
    })
  })
})
