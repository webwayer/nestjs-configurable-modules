import { configurableModuleLabeled } from './configurableModuleLabeled'
import { factoryProps, TestConfigClass, testConfigurableImportModule, uncoverModule } from './utils/spec-heplers'

describe('configurableModuleLabeled', () => {
  it('inline', () => {
    class Provider {
      static configurableModuleCustom = configurableModuleLabeled(TestConfigClass, label => ({ exports: [label] }))
    }

    const module = Provider.configurableModuleCustom('inline-label', factoryProps)

    expect(uncoverModule(module)).toMatchObject({
      module: 'ProviderConfigurableModuleProxy_inline-label',
      exports: [
        {
          module: 'ProviderConfigurableModule_inline-label',
          exports: ['inline-label'],
          imports: [testConfigurableImportModule()],
        },
      ],
      imports: [
        {
          module: 'ProviderConfigurableModule_inline-label',
          exports: ['inline-label'],
          imports: [testConfigurableImportModule()],
        },
      ],
    })
  })

  it('two-step', () => {
    class Provider {
      static configurableModuleCustom = configurableModuleLabeled(TestConfigClass, label => ({ exports: [label] }))
    }

    const module = Provider.configurableModuleCustom('inline-label')({ 'inline-label': factoryProps })

    expect(uncoverModule(module)).toMatchObject({
      module: 'ProviderConfigurableModuleProxy_inline-label',
      exports: [
        {
          module: 'ProviderConfigurableModule_inline-label',
          exports: ['inline-label'],
          imports: [testConfigurableImportModule()],
        },
      ],
      imports: [
        {
          module: 'ProviderConfigurableModule_inline-label',
          exports: ['inline-label'],
          imports: [testConfigurableImportModule()],
        },
      ],
    })
  })

  it('not on provider', () => {
    const configurableModuleCustom = configurableModuleLabeled(TestConfigClass, label => ({ exports: [label] }))
    const module = configurableModuleCustom('inline-label', factoryProps)

    expect(uncoverModule(module)).toMatchObject({
      module: 'ConfigurableModuleProxy_inline-label',
      exports: [
        {
          module: 'ConfigurableModule_inline-label',
          exports: ['inline-label'],
          imports: [testConfigurableImportModule()],
        },
      ],
      imports: [
        {
          module: 'ConfigurableModule_inline-label',
          exports: ['inline-label'],
          imports: [testConfigurableImportModule()],
        },
      ],
    })
  })
})
