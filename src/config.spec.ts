import { config } from './config'
import { factoryProps, TestConfigClass, testConfigurableImportModule, uncoverModule } from './utils/spec-heplers'

describe('config', () => {
  it('simple', () => {
    const forRoot = config(TestConfigClass)
    const module = forRoot(factoryProps)

    expect(uncoverModule(module)).toMatchObject({
      module: 'Config',
      exports: [testConfigurableImportModule()],
      imports: [testConfigurableImportModule()],
    })
  })

  it('on Provider', () => {
    class Provider {
      static forRoot = config(TestConfigClass)
    }

    const module = Provider.forRoot(factoryProps)

    expect(uncoverModule(module)).toMatchObject({
      module: 'ProviderConfig',
      exports: [testConfigurableImportModule()],
      imports: [testConfigurableImportModule()],
    })
  })

  it('global', () => {
    const forRoot = config(TestConfigClass, true)
    const module = forRoot(factoryProps)

    expect(uncoverModule(module)).toMatchObject({
      module: 'Config',
      exports: [testConfigurableImportModule()],
      imports: [testConfigurableImportModule()],
      global: true,
    })
  })
})
