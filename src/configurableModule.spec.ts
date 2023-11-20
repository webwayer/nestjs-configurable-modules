import { configurableModule, smartModule } from './configurableModule'
import {
  asyncFactoryArg,
  factoryProps,
  prefixProps,
  resultProps,
  testAsyncConfigurableImportModule,
  TestConfigClass,
  TestConfigClassLabeled,
  TestConfigClassPrefixed,
  testConfigurableImportModule,
  testConfigurableModule,
  testConfigurableModuleComplete,
  uncoverModule,
} from './utils/spec-heplers'

describe('configurableModule', () => {
  it('error', () => {
    const factory = configurableModule('' as any, {})
    expect(() => (factory as any)('')).toThrowError(
      'ConfigurableModule: "" of [string], "" is not valid config base for module',
    )
  })

  describe('all types of configs together', () => {
    class TestConfigCLassInline {
      inline_requiredProp: string
      inline_optionalProp?: string
      inline_defaultProp? = 'default'
    }

    class TestConfigClassInModuleConfigurableImports {
      inModuleConfigurableImports_requiredProp: string
      inModuleConfigurableImports_optionalProp?: string
      inModuleConfigurableImports_defaultProp? = 'default'
    }

    class TestConfigClassInModuleSmartImports {
      inModuleSmartImports_requiredProp: string
      inModuleSmartImports_optionalProp?: string
      inModuleSmartImports_defaultProp? = 'default'
    }

    it('sync', () => {
      const factory = smartModule(TestConfigCLassInline, {
        smartImports: [TestConfigClassInModuleSmartImports],
        configurableImports: [TestConfigClassInModuleConfigurableImports],
      })
      const module = factory({
        inline_requiredProp: 'inline_required',
        inModuleConfigurableImports_requiredProp: 'inModuleConfigurableImports_required',
        inModuleSmartImports_requiredProp: 'inModuleSmartImports_required',
      })

      expect(uncoverModule(module)).toMatchObject(
        testConfigurableModule(
          testConfigurableImportModule('TestConfigCLassInline', { inline_requiredProp: 'inline_required' }),
          testConfigurableImportModule('TestConfigClassInModuleConfigurableImports', {
            inModuleConfigurableImports_requiredProp: 'inModuleConfigurableImports_required',
          }),
          testConfigurableImportModule('TestConfigClassInModuleSmartImports', {
            inModuleSmartImports_requiredProp: 'inModuleSmartImports_required',
          }),
        ),
      )
    })

    it('async', () => {
      const factory = smartModule(TestConfigCLassInline, {
        smartImports: [TestConfigClassInModuleSmartImports],
        configurableImports: [TestConfigClassInModuleConfigurableImports],
      })
      const module = factory(
        asyncFactoryArg({
          inline_requiredProp: 'inline_required',
          inModuleConfigurableImports_requiredProp: 'inModuleConfigurableImports_required',
          inModuleSmartImports_requiredProp: 'inModuleSmartImports_required',
        }),
      )

      expect(uncoverModule(module)).toMatchObject(
        testConfigurableModule(
          testAsyncConfigurableImportModule('TestConfigCLassInline'),
          testAsyncConfigurableImportModule('TestConfigClassInModuleConfigurableImports'),
          testAsyncConfigurableImportModule('TestConfigClassInModuleSmartImports'),
        ),
      )
    })

    it('module factory', () => {
      class Provider {
        static smartModule = smartModule(TestConfigCLassInline, () => ({
          smartImports: [TestConfigClassInModuleSmartImports],
          configurableImports: [TestConfigClassInModuleConfigurableImports],
          imports: [{ module: class SomeImportModule {} }],
          providers: [Provider],
          exports: [Provider],
        }))
      }

      const module = Provider.smartModule({
        inline_requiredProp: 'inline_required',
        inModuleConfigurableImports_requiredProp: 'inModuleConfigurableImports_required',
        inModuleSmartImports_requiredProp: 'inModuleSmartImports_required',
      })

      expect(uncoverModule(module)).toMatchObject(
        testConfigurableModuleComplete(
          [
            { module: 'SomeImportModule' },
            testConfigurableImportModule('TestConfigCLassInline', { inline_requiredProp: 'inline_required' }),
            testConfigurableImportModule('TestConfigClassInModuleConfigurableImports', {
              inModuleConfigurableImports_requiredProp: 'inModuleConfigurableImports_required',
            }),
            testConfigurableImportModule('TestConfigClassInModuleSmartImports', {
              inModuleSmartImports_requiredProp: 'inModuleSmartImports_required',
            }),
          ],
          {
            providers: ['Provider'],
            exports: ['Provider'],
          },
        ),
      )
    })

    it('module factory async', async () => {
      class Provider {
        static smartModule = smartModule(TestConfigCLassInline, () => ({
          smartImports: [TestConfigClassInModuleSmartImports],
          configurableImports: [TestConfigClassInModuleConfigurableImports],
          imports: [{ module: class SomeImportModule {} }],
          providers: [Provider],
          exports: [Provider],
        }))
      }

      const module = Provider.smartModule(
        asyncFactoryArg({
          inline_requiredProp: 'inline_required',
          inModuleConfigurableImports_requiredProp: 'inModuleConfigurableImports_required',
          inModuleSmartImports_requiredProp: 'inModuleSmartImports_required',
        }),
      )

      expect(uncoverModule(module)).toMatchObject(
        testConfigurableModuleComplete(
          [
            { module: 'SomeImportModule' },
            testAsyncConfigurableImportModule('TestConfigCLassInline'),
            testAsyncConfigurableImportModule('TestConfigClassInModuleConfigurableImports'),
            testAsyncConfigurableImportModule('TestConfigClassInModuleSmartImports'),
          ],
          {
            providers: ['Provider'],
            exports: ['Provider'],
          },
        ),
      )
    })
  })

  describe('in-module config (smartModule & smartImports prop)', () => {
    it('sync', () => {
      const factory = smartModule({ smartImports: [TestConfigClass] })
      const module = factory(factoryProps)

      expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testConfigurableImportModule()))
    })

    it('async', async () => {
      const factory = smartModule({ smartImports: [TestConfigClass] })
      const module = factory(asyncFactoryArg(factoryProps))

      expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testAsyncConfigurableImportModule()))

      expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
    })

    it('module factory', () => {
      class Provider {
        static smartModule = smartModule(() => ({
          smartImports: [TestConfigClass],
          imports: [{ module: class SomeImportModule {} }],
          providers: [Provider],
          exports: [Provider],
        }))
      }

      const module = Provider.smartModule(factoryProps)

      expect(uncoverModule(module)).toMatchObject(
        testConfigurableModuleComplete([{ module: 'SomeImportModule' }, testConfigurableImportModule()], {
          providers: ['Provider'],
          exports: ['Provider'],
        }),
      )
    })

    it('module factory async', async () => {
      class Provider {
        static smartModule = smartModule(() => ({
          smartImports: [TestConfigClass],
          imports: [{ module: class SomeImportModule {} }],
          providers: [Provider],
          exports: [Provider],
        }))
      }

      const module = Provider.smartModule(asyncFactoryArg(factoryProps))

      expect(uncoverModule(module)).toMatchObject(
        testConfigurableModuleComplete([{ module: 'SomeImportModule' }, testAsyncConfigurableImportModule()], {
          providers: ['Provider'],
          exports: ['Provider'],
        }),
      )

      expect(await (module['imports']?.[1]['providers'][0].useFactory as any)()).toMatchObject(resultProps)
    })
  })

  describe('in-module config (configurableImports prop)', () => {
    it('token', () => {
      const factory = configurableModule({ config: TestConfigClass, token: 'TestToken' }, {})
      const module = factory(factoryProps)

      expect(uncoverModule(module)).toMatchObject(
        testConfigurableModule({
          module: 'TestConfigClassConfigurableClassModule',
          providers: [
            {
              useValue: resultProps,
              provide: 'TestToken',
            },
          ],
          exports: ['TestToken'],
        }),
      )
    })

    describe('empty configs', () => {
      it('empty', () => {
        const factory = configurableModule({
          imports: [{ module: class SomeImportModule {} }],
        })
        const module = factory()

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule({ module: 'SomeImportModule' }))
      })

      it('empty in empty', () => {
        const factory = configurableModule({
          imports: [{ module: class SomeImportModule {} }],
        })

        const factory2 = configurableModule({ configurableImports: [factory] })
        const module = factory2()

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule({ module: 'SomeImportModule' })),
        )
      })

      it('empty inside other configurableModule', () => {
        const factory = configurableModule({
          imports: [{ module: class SomeImportModule {} }],
        })

        const factory2 = configurableModule({
          configurableImports: [TestConfigClass, factory],
        })
        const module = factory2(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(
            testConfigurableImportModule(),
            testConfigurableModule({ module: 'SomeImportModule' }),
          ),
        )
      })
    })

    describe('configs', () => {
      it('sync', () => {
        const factory = configurableModule({ configurableImports: [TestConfigClass] })
        const module = factory(factoryProps)

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testConfigurableImportModule()))
      })

      it('async', async () => {
        const factory = configurableModule({ configurableImports: [TestConfigClass] })
        const module = factory(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testAsyncConfigurableImportModule()))

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('object-config async', async () => {
        const factory = configurableModule({ configurableImports: [{ config: TestConfigClass }] })
        const module = factory(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testAsyncConfigurableImportModule()))

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('two configs with same props', () => {
        class TestConfigClassCopy extends TestConfigClass {}

        const factory = configurableModule({ configurableImports: [TestConfigClass, TestConfigClassCopy] })
        const module = factory(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule(), testConfigurableImportModule('TestConfigClassCopy')),
        )
      })

      it('two configs', () => {
        class TestConfigClassOther {
          other_requiredProp: string
          other_optionalProp?: string
          other_defaultProp? = 'other_default'
        }

        const factory = configurableModule({ configurableImports: [TestConfigClass, TestConfigClassOther] })
        const module = factory({ requiredProp: 'required', other_requiredProp: 'other_required' })

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(
            testConfigurableImportModule('TestConfigClass', {
              defaultProp: 'default',
              other_requiredProp: 'other_required', // cause we can't know class' props for sure we're passing all props to all classes
              requiredProp: 'required',
            }),
            testConfigurableImportModule('TestConfigClassOther', {
              other_defaultProp: 'other_default',
              other_requiredProp: 'other_required', // cause we can't know class' props for sure we're passing all props to all classes
              requiredProp: 'required',
            }),
          ),
        )
      })
    })

    describe('factories as configs', () => {
      it('factory in factory', () => {
        const factory = configurableModule({ configurableImports: [TestConfigClass] })
        const factory2 = configurableModule({ configurableImports: [factory] })

        const module = factory2(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testConfigurableImportModule())),
        )
      })

      it('factory in factory async', async () => {
        const factory = configurableModule({ configurableImports: [TestConfigClass] })
        const factory2 = configurableModule({ configurableImports: [factory] })

        const module = factory2(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testAsyncConfigurableImportModule())),
        )

        expect(await module.imports?.[0]['imports'][0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('object-factory in factory async', async () => {
        const factory = configurableModule({ configurableImports: [TestConfigClass] })
        const factory2 = configurableModule({ configurableImports: [{ config: factory }] })

        const module = factory2(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testAsyncConfigurableImportModule())),
        )

        expect(await module.imports?.[0]['imports'][0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('two factories in factory', () => {
        const factory_0 = configurableModule({ configurableImports: [TestConfigClass] })
        const factory_1 = configurableModule({ configurableImports: [TestConfigClass] })
        const factory2 = configurableModule(factory_0, factory_1, {})

        const module = factory2(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(
            testConfigurableModule(testConfigurableImportModule()),
            testConfigurableModule(testConfigurableImportModule()),
          ),
        )
      })

      it('factory and config in factory', () => {
        const factory = configurableModule({ configurableImports: [TestConfigClass] })
        const factory2 = configurableModule({ configurableImports: [factory, TestConfigClass] })

        const module = factory2(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(
            testConfigurableModule(testConfigurableImportModule()),
            testConfigurableImportModule(),
          ),
        )
      })
    })

    describe('labeled configs', () => {
      it('labeled config (static prop)', () => {
        const factory = configurableModule({ configurableImports: [TestConfigClassLabeled] })
        const module = factory({ static_label: factoryProps })

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule('TestConfigClassLabeled')),
        )
      })

      it('labeled config (static prop) async', async () => {
        const factory = configurableModule({ configurableImports: [TestConfigClassLabeled] })
        const module = factory(asyncFactoryArg({ static_label: factoryProps }))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassLabeled')),
        )

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('labeled config (inline label)', () => {
        const factory = configurableModule({
          configurableImports: [{ label: 'label' as const, config: TestConfigClass }],
        })
        const module = factory({ label: factoryProps })

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testConfigurableImportModule()))
      })

      it('labeled config (inline label) async', async () => {
        const factory = configurableModule({
          configurableImports: [{ label: 'label' as const, config: TestConfigClass }],
        })
        const module = factory(asyncFactoryArg({ label: factoryProps }))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testAsyncConfigurableImportModule()))

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('labeled config (static prop and inline label)', () => {
        const factory = configurableModule({
          configurableImports: [{ label: 'inline_label' as const, config: TestConfigClassLabeled }],
        })
        const module = factory({ inline_label: factoryProps })

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule('TestConfigClassLabeled')),
        )
      })

      it('labeled config (static prop and inline label) async', async () => {
        const factory = configurableModule({
          configurableImports: [{ label: 'inline_label' as const, config: TestConfigClassLabeled }],
        })
        const module = factory(asyncFactoryArg({ inline_label: factoryProps }))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassLabeled')),
        )

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('labeled factory', () => {
        const factory = configurableModule({ configurableImports: [TestConfigClassLabeled] })
        const factory2 = configurableModule({
          configurableImports: [{ label: 'inline_label' as const, config: factory }],
        })

        const module = factory2({ inline_label: { static_label: factoryProps } })

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testConfigurableImportModule('TestConfigClassLabeled'))),
        )
      })

      it('labeled factory async', async () => {
        const factory = configurableModule({ configurableImports: [TestConfigClassLabeled] })
        const factory2 = configurableModule({
          configurableImports: [{ label: 'inline_label' as const, config: factory }],
        })

        const module = factory2(asyncFactoryArg({ inline_label: { static_label: factoryProps } }))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassLabeled'))),
        )

        expect(await (module.imports?.[0]['imports'][0]['providers'][0].useFactory as any)()).toMatchObject(resultProps)
      })
    })

    describe('prefixed configs', () => {
      it('prefixed config (static prop)', () => {
        const factory = configurableModule({ configurableImports: [TestConfigClassPrefixed] })
        const module = factory(prefixProps(factoryProps, 'static_prefix_'))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule('TestConfigClassPrefixed')),
        )
      })

      it('prefixed config (static prop) async', () => {
        const factory = configurableModule({ configurableImports: [TestConfigClassPrefixed] })
        const module = factory(asyncFactoryArg(prefixProps(factoryProps, 'static_prefix_')))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassPrefixed')),
        )
      })

      it('prefixed config (inline prefix)', () => {
        const factory = configurableModule({
          configurableImports: [{ prefix: 'inline_prefix_' as const, config: TestConfigClass }],
        })
        const module = factory(prefixProps(factoryProps, 'inline_prefix_'))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testConfigurableImportModule()))
      })

      it('prefixed config (inline prefix) async', () => {
        const factory = configurableModule({
          configurableImports: [{ prefix: 'inline_prefix_' as const, config: TestConfigClass }],
        })
        const module = factory(asyncFactoryArg(prefixProps(factoryProps, 'inline_prefix_')))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testAsyncConfigurableImportModule()))
      })

      it('prefixed config (static prop and inline prefix)', () => {
        const factory = configurableModule({
          configurableImports: [{ prefix: 'inline_prefix_' as const, config: TestConfigClassPrefixed }],
        })
        const module = factory(prefixProps(factoryProps, 'inline_prefix_'))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule('TestConfigClassPrefixed')),
        )
      })

      it('prefixed config (static prop and inline prefix) async', () => {
        const factory = configurableModule({
          configurableImports: [{ prefix: 'inline_prefix_' as const, config: TestConfigClassPrefixed }],
        })
        const module = factory(asyncFactoryArg(prefixProps(factoryProps, 'inline_prefix_')))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassPrefixed')),
        )
      })

      it('prefixed factory', () => {
        const factory = configurableModule({ configurableImports: [TestConfigClassPrefixed] })
        const factory2 = configurableModule({
          configurableImports: [{ prefix: 'inline_prefix_' as const, config: factory }],
        })
        const module = factory2(prefixProps(factoryProps, 'inline_prefix_static_prefix_'))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testConfigurableImportModule('TestConfigClassPrefixed'))),
        )
      })

      it('prefixed factory async', () => {
        const factory = configurableModule({ configurableImports: [TestConfigClassPrefixed] })
        const factory2 = configurableModule({
          configurableImports: [{ prefix: 'inline_prefix_' as const, config: factory }],
        })
        const module = factory2(asyncFactoryArg(prefixProps(factoryProps, 'inline_prefix_static_prefix_')))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassPrefixed'))),
        )
      })
    })

    describe('module', () => {
      it('module', () => {
        class Provider {
          static configurableModule = configurableModule({
            configurableImports: [TestConfigClass],
            providers: [Provider],
            exports: [Provider],
          })
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([testConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider'],
          }),
        )
      })

      it('module factory', () => {
        class Provider {
          static configurableModule = configurableModule(() => ({
            configurableImports: [TestConfigClass],
            imports: [{ module: class SomeImportModule {} }],
            providers: [Provider],
            exports: [Provider],
          }))
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([{ module: 'SomeImportModule' }, testConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider'],
          }),
        )
      })

      it('module factory async', async () => {
        class Provider {
          static configurableModule = configurableModule(() => ({
            configurableImports: [TestConfigClass],
            imports: [{ module: class SomeImportModule {} }],
            providers: [Provider],
            exports: [Provider],
          }))
        }

        const module = Provider.configurableModule(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([{ module: 'SomeImportModule' }, testAsyncConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider'],
          }),
        )

        expect(await (module['imports']?.[1]['providers'][0].useFactory as any)()).toMatchObject(resultProps)
      })

      it('module factory with imports (imports wont be available inside module definition factory)', () => {
        class Provider {
          static configurableModule = configurableModule(imports => ({
            configurableImports: [TestConfigClass],
            providers: [Provider],
            exports: [Provider, ...imports],
          }))
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([testConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider'],
          }),
        )
      })
    })
  })

  describe('inline config', () => {
    it('token', () => {
      const factory = configurableModule({ config: TestConfigClass, token: 'TestToken' }, {})
      const module = factory(factoryProps)

      expect(uncoverModule(module)).toMatchObject(
        testConfigurableModule({
          module: 'TestConfigClassConfigurableClassModule',
          providers: [
            {
              useValue: resultProps,
              provide: 'TestToken',
            },
          ],
          exports: ['TestToken'],
        }),
      )
    })

    describe('empty configs', () => {
      it('empty', () => {
        const factory = configurableModule({
          imports: [{ module: class SomeImportModule {} }],
        })
        const module = factory()

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule({ module: 'SomeImportModule' }))
      })

      it('empty in empty', () => {
        const factory = configurableModule({
          imports: [{ module: class SomeImportModule {} }],
        })

        const factory2 = configurableModule(factory, {})
        const module = factory2()

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule({ module: 'SomeImportModule' })),
        )
      })

      it('empty inside other configurableModule', () => {
        const factory = configurableModule({
          imports: [{ module: class SomeImportModule {} }],
        })

        const factory2 = configurableModule(TestConfigClass, factory, {})
        const module = factory2(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(
            testConfigurableImportModule(),
            testConfigurableModule({ module: 'SomeImportModule' }),
          ),
        )
      })
    })

    describe('configs', () => {
      it('sync', () => {
        const factory = configurableModule(TestConfigClass, {})
        const module = factory(factoryProps)

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testConfigurableImportModule()))
      })

      it('async', async () => {
        const factory = configurableModule(TestConfigClass, {})
        const module = factory(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testAsyncConfigurableImportModule()))

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('object-config async', async () => {
        const factory = configurableModule({ config: TestConfigClass }, {})
        const module = factory(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testAsyncConfigurableImportModule()))

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('two configs with same props', () => {
        class TestConfigClassCopy extends TestConfigClass {}

        const factory = configurableModule(TestConfigClass, TestConfigClassCopy, {})
        const module = factory(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule(), testConfigurableImportModule('TestConfigClassCopy')),
        )
      })

      it('two configs', () => {
        class TestConfigClassOther {
          other_requiredProp: string
          other_optionalProp?: string
          other_defaultProp? = 'other_default'
        }

        const factory = configurableModule(TestConfigClass, TestConfigClassOther, {})
        const module = factory({ requiredProp: 'required', other_requiredProp: 'other_required' })

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(
            testConfigurableImportModule('TestConfigClass', {
              defaultProp: 'default',
              other_requiredProp: 'other_required', // cause we can't know class' props for sure we're passing all props to all classes
              requiredProp: 'required',
            }),
            testConfigurableImportModule('TestConfigClassOther', {
              other_defaultProp: 'other_default',
              other_requiredProp: 'other_required', // cause we can't know class' props for sure we're passing all props to all classes
              requiredProp: 'required',
            }),
          ),
        )
      })
    })

    describe('factories as configs', () => {
      it('factory in factory', () => {
        const factory = configurableModule(TestConfigClass, {})
        const factory2 = configurableModule(factory, {})

        const module = factory2(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testConfigurableImportModule())),
        )
      })

      it('factory in factory async', async () => {
        const factory = configurableModule(TestConfigClass, {})
        const factory2 = configurableModule(factory, {})

        const module = factory2(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testAsyncConfigurableImportModule())),
        )

        expect(await module.imports?.[0]['imports'][0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('object-factory in factory async', async () => {
        const factory = configurableModule(TestConfigClass, {})
        const factory2 = configurableModule({ config: factory }, {})

        const module = factory2(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testAsyncConfigurableImportModule())),
        )

        expect(await module.imports?.[0]['imports'][0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('two factories in factory', () => {
        const factory_0 = configurableModule(TestConfigClass, {})
        const factory_1 = configurableModule(TestConfigClass, {})
        const factory2 = configurableModule(factory_0, factory_1, {})

        const module = factory2(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(
            testConfigurableModule(testConfigurableImportModule()),
            testConfigurableModule(testConfigurableImportModule()),
          ),
        )
      })

      it('factory and config in factory', () => {
        const factory = configurableModule(TestConfigClass, {})
        const factory2 = configurableModule(factory, TestConfigClass, {})

        const module = factory2(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(
            testConfigurableModule(testConfigurableImportModule()),
            testConfigurableImportModule(),
          ),
        )
      })
    })

    describe('labeled configs', () => {
      it('labeled config (static prop)', () => {
        const factory = configurableModule(TestConfigClassLabeled, {})
        const module = factory({ static_label: factoryProps })

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule('TestConfigClassLabeled')),
        )
      })

      it('labeled config (static prop) async', async () => {
        const factory = configurableModule(TestConfigClassLabeled, {})
        const module = factory(asyncFactoryArg({ static_label: factoryProps }))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassLabeled')),
        )

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('labeled config (inline label)', () => {
        const factory = configurableModule({ label: 'label' as const, config: TestConfigClass }, {})
        const module = factory({ label: factoryProps })

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testConfigurableImportModule()))
      })

      it('labeled config (inline label) async', async () => {
        const factory = configurableModule({ label: 'label' as const, config: TestConfigClass }, {})
        const module = factory(asyncFactoryArg({ label: factoryProps }))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testAsyncConfigurableImportModule()))

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('labeled config (static prop and inline label)', () => {
        const factory = configurableModule({ label: 'inline_label' as const, config: TestConfigClassLabeled }, {})
        const module = factory({ inline_label: factoryProps })

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule('TestConfigClassLabeled')),
        )
      })

      it('labeled config (static prop and inline label) async', async () => {
        const factory = configurableModule({ label: 'inline_label' as const, config: TestConfigClassLabeled }, {})
        const module = factory(asyncFactoryArg({ inline_label: factoryProps }))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassLabeled')),
        )

        expect(await module.imports?.[0]['providers'][0].useFactory()).toMatchObject(resultProps)
      })

      it('labeled factory', () => {
        const factory = configurableModule(TestConfigClassLabeled, {})
        const factory2 = configurableModule({ label: 'inline_label' as const, config: factory }, {})

        const module = factory2({ inline_label: { static_label: factoryProps } })

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testConfigurableImportModule('TestConfigClassLabeled'))),
        )
      })

      it('labeled factory async', async () => {
        const factory = configurableModule(TestConfigClassLabeled, {})
        const factory2 = configurableModule({ label: 'inline_label' as const, config: factory }, {})

        const module = factory2(asyncFactoryArg({ inline_label: { static_label: factoryProps } }))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassLabeled'))),
        )

        expect(await (module.imports?.[0]['imports'][0]['providers'][0].useFactory as any)()).toMatchObject(resultProps)
      })
    })

    describe('prefixed configs', () => {
      it('prefixed config (static prop)', () => {
        const factory = configurableModule(TestConfigClassPrefixed, {})
        const module = factory(prefixProps(factoryProps, 'static_prefix_'))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule('TestConfigClassPrefixed')),
        )
      })

      it('prefixed config (static prop) async', () => {
        const factory = configurableModule(TestConfigClassPrefixed, {})
        const module = factory(asyncFactoryArg(prefixProps(factoryProps, 'static_prefix_')))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassPrefixed')),
        )
      })

      it('prefixed config (inline prefix)', () => {
        const factory = configurableModule({ prefix: 'inline_prefix_' as const, config: TestConfigClass }, {})
        const module = factory(prefixProps(factoryProps, 'inline_prefix_'))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testConfigurableImportModule()))
      })

      it('prefixed config (inline prefix) async', () => {
        const factory = configurableModule({ prefix: 'inline_prefix_' as const, config: TestConfigClass }, {})
        const module = factory(asyncFactoryArg(prefixProps(factoryProps, 'inline_prefix_')))

        expect(uncoverModule(module)).toMatchObject(testConfigurableModule(testAsyncConfigurableImportModule()))
      })

      it('prefixed config (static prop and inline prefix)', () => {
        const factory = configurableModule({ prefix: 'inline_prefix_' as const, config: TestConfigClassPrefixed }, {})
        const module = factory(prefixProps(factoryProps, 'inline_prefix_'))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableImportModule('TestConfigClassPrefixed')),
        )
      })

      it('prefixed config (static prop and inline prefix) async', () => {
        const factory = configurableModule({ prefix: 'inline_prefix_' as const, config: TestConfigClassPrefixed }, {})
        const module = factory(asyncFactoryArg(prefixProps(factoryProps, 'inline_prefix_')))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassPrefixed')),
        )
      })

      it('prefixed factory', () => {
        const factory = configurableModule(TestConfigClassPrefixed, {})
        const factory2 = configurableModule({ prefix: 'inline_prefix_' as const, config: factory }, {})
        const module = factory2(prefixProps(factoryProps, 'inline_prefix_static_prefix_'))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testConfigurableImportModule('TestConfigClassPrefixed'))),
        )
      })

      it('prefixed factory async', () => {
        const factory = configurableModule(TestConfigClassPrefixed, {})
        const factory2 = configurableModule({ prefix: 'inline_prefix_' as const, config: factory }, {})
        const module = factory2(asyncFactoryArg(prefixProps(factoryProps, 'inline_prefix_static_prefix_')))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModule(testConfigurableModule(testAsyncConfigurableImportModule('TestConfigClassPrefixed'))),
        )
      })
    })

    describe('module', () => {
      it('module', () => {
        class Provider {
          static configurableModule = configurableModule(TestConfigClass, {
            providers: [Provider],
            exports: [Provider],
          })
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([testConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider'],
          }),
        )
      })

      it('module factory', () => {
        class Provider {
          static configurableModule = configurableModule(TestConfigClass, () => ({
            imports: [{ module: class SomeImportModule {} }],
            providers: [Provider],
            exports: [Provider],
          }))
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([{ module: 'SomeImportModule' }, testConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider'],
          }),
        )
      })

      it('module factory async', async () => {
        class Provider {
          static configurableModule = configurableModule(TestConfigClass, () => ({
            imports: [{ module: class SomeImportModule {} }],
            providers: [Provider],
            exports: [Provider],
          }))
        }

        const module = Provider.configurableModule(asyncFactoryArg(factoryProps))

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([{ module: 'SomeImportModule' }, testAsyncConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider'],
          }),
        )

        expect(await (module['imports']?.[1]['providers'][0].useFactory as any)()).toMatchObject(resultProps)
      })

      it('module factory with imports', () => {
        class Provider {
          static configurableModule = configurableModule(TestConfigClass, imports => ({
            providers: [Provider],
            exports: [Provider, ...imports],
          }))
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([testConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider', testConfigurableImportModule()],
          }),
        )
      })

      it('module factory with config in module factory', () => {
        class Provider {
          static configurableModule = configurableModule(TestConfigClass, (_, testConfigClass) => ({
            providers: [Provider],
            exports: [Provider, { provide: 'config', useValue: testConfigClass }],
          }))
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([testConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider', { provide: 'config', useValue: resultProps }],
          }),
        )
      })

      it('module factory with object-config in module factory', () => {
        class Provider {
          static configurableModule = configurableModule({ config: TestConfigClass }, (_, testConfigClass) => ({
            providers: [Provider],
            exports: [Provider, { provide: 'config', useValue: testConfigClass }],
          }))
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([testConfigurableImportModule()], {
            providers: ['Provider'],
            exports: ['Provider', { provide: 'config', useValue: resultProps }],
          }),
        )
      })

      it('module factory with factory-config in module factory', () => {
        class Provider {
          static configurableModule0 = configurableModule(TestConfigClass, {})
          static configurableModule = configurableModule(Provider.configurableModule0, (_, shouldBeNull) => ({
            providers: [Provider],
            exports: [Provider, { provide: 'config', useValue: shouldBeNull }],
          }))
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([testConfigurableModule(testConfigurableImportModule())], {
            providers: ['Provider'],
            exports: ['Provider', { provide: 'config', useValue: null }],
          }),
        )
      })

      it('module factory with object-factory-config in module factory', () => {
        class Provider {
          static configurableModule0 = configurableModule(TestConfigClass, {})
          static configurableModule = configurableModule(
            { config: Provider.configurableModule0 },
            (_, shouldBeNull) => ({
              providers: [Provider],
              exports: [Provider, { provide: 'config', useValue: shouldBeNull }],
            }),
          )
        }

        const module = Provider.configurableModule(factoryProps)

        expect(uncoverModule(module)).toMatchObject(
          testConfigurableModuleComplete([testConfigurableModule(testConfigurableImportModule())], {
            providers: ['Provider'],
            exports: ['Provider', { provide: 'config', useValue: null }],
          }),
        )
      })
    })
  })
})
