# nestjs-configurable-modules
Enables the creation of highly configurable modules for your NestJS applications with ease.

## Table of Contents
* [Configuration philosophy](#configuration-philosophy)
* [Installation](#installation)
* [API](#api)
  + [configurableModule](#configurablemodule)
    - [Configurable Imports](#configurable-imports)
      * [Configurable Classes](#configurable-classes)
      * [Configurable Modules](#configurable-modules)
    - [Module Definition](#module-definition)
      * [Module Definition Object](#module-definition-object)
      * [Module Definition Factory](#module-definition-factory)
    - [Create Module Function](#create-module-function)
      * [Synchronous](#synchronous)
      * [Asynchronous](#asynchronous)
  + [configurableModuleLabeled](#configurablemodulelabeled)
  + [moduleLabeled](#modulelabeled)
  + [config](#config)
  + [configLabeledExporter](#configlabeledexporter)
  + [configLabeledImporter](#configlabeledimporter)

## Configuration philosophy
Configuration management is a crucial aspect of any application, as it allows customization of a module or the entire application's behavior. Configurations typically include credentials for external services, internal defaults/constants, feature flags, and more. Configurations should be set once during the app's startup and remain unchanged during runtime.

**NodeJS-style**  
Using `process.env` to access environment variables is a common method for managing configurations in Node.js applications. However, this approach has several drawbacks: 
- The entire codebase must be examined to identify all possible configuration settings.
- Default values, required/optional settings, and typings must also be determined by searching the codebase.
- The configuration is global, which can lead to issues with code maintainability and flexibility.

**NestJS-style**  
NestJS improves upon the Node.js approach by providing a `ConfigService` for managing app-global, rather than process-global, configurations. This allows for greater control over injection, mocking, and overriding settings. However, the configuration is still semi-global in nature.  
- Using `.forRoot()`-style setup  
  **\+** Configuration becomes self-decribing by using types.  
  **\-** It's still not clear which modules require it without going through the codebase.  
- Using `.register()`-style module factories  
  **\+** Allows creating multiple instances of the same module with different configurations.  
  **\+** It's self-describing, typed, tied to the specific module.  
  **\-** You have to pass configuration each time you import the module instead of just one global thing. This makes you repeat yourself.  
  **\-** Configuration process is distributed across the app.  

**`nestjs-configurable-modules`-style**  
The `nestjs-configurable-modules` package aims to address these issues and simplify the configuration management process.  
Imagine you have one function (of course typed) that accepts a combined configuration for every module in your app and return a fully configured copy of app. And imagine that every module has such type of function but for itself only.  
This approach is fully compatible with NestJS and Dependency Injection (DI).

Key Features:
- Support for required, optional, and default configuration settings
- Use a single, strongly-typed function to configure the entire app or specific module
- Create multiple instances of the same module with distinct configurations in the same app
- Add NestJS-style `.forRoot()` and `.register()` configurations for your modules easily

## Installation
1. Install the package from `npm` registry
```bash
npm i nestjs-configurable-modules
```
2. Import it into your app
```typescript
import { 
  configurableModule, 
  configurableModuleLabeled, 
  moduleLabeled, 
  config, 
  configLabeledExporter, 
  configLabeledImporter,
} from 'nestjs-configurable-modules'
```
3. Use to create your modules
```typescript
class DatabaseConfig {
  url: string
}

@Injectable()
class DatabaseService {
  constructor(private config: DatabaseConfig) {}

  getData() {
    // uses this.config to connect to the Database
  }
}

class DatabaseModule {
  static createModule = configurableModule(DatabaseConfig, {
    providers: [DatabaseService],
    exports: [DatabaseService],
  })
}

class UsersModule {
  static createModule = configurableModule(DatabaseModule.createModule, {
    providers: [...],
    exports: [...],
  })
}
// const usersModule = UsersModule.createModule({ url: '...' })

class AppModule {
  static createModule = configurableModule(UsersModule.createModule)
}

const app = await NestFactory.create(AppModule.createModule({ url: '...' }))
```

## API
### configurableModule
`configurableModule` function replaces the NestJS `@Module` decorator and makes creating a module a two-step process.  
1. Use `configurableModule` with `configurableImports` (classes/modules that before importing needs to be configured), and `moduleDefinition` (object of same format than you would pass into NestJS `@Module` decorator).  
The result is function that creates module applying configuration (see [Create Module Function](#create-module-function)).
2. Use result function from the step #1 with combined configuration for all `configurableImports`.  
The result is module based on `moduleDefinition` with auto-imported and configured `configurableImports`.

<pre>
configurableModule(<a href="#configurable-imports">...configurableImports</a>, <a href="#module-definition">moduleDefinition</a>) => <a href="#create-module-function">createModuleFunction</a>
</pre>

#### Configurable Imports
Configurable imports can be 2 types: Configurable classes or Configurable modules.

##### Configurable Classes
Configurable classes (e.g., `DatabaseConfig`) are simple TypeScript classees.  
**for each Configurable class `configurableModule` creates module with only one exports, instance of this class with properties set**

```typescript
class MyConfig {
  static token = 'custom_token'
  static label = 'static_label' as const
  static prefix = 'static_prefix_' as const

  propertyRequired: string
  propertyOptional?: string
  propertyDefault? = 'default'
}
```

`token`, `label` and `prefix` are optional
- `token` makes instance of `MyConfig` available via custom token `constructor(@Inject('custom_token') myConfig: MyConfig) {}`
- `label` adds additional nesting level to combined config `const module = configurableModuleFactory({ static_label: { propertyRequired: 'value' } })`
- `prefix` adds prefix to all properties `const module = configurableModuleFactory({ static_prefix_propertyRequied: 'value })`

It's useful for grouping settings from the same module and avoiding conflicts if different configs in the same app have the same setting names, like `connection_url` for different network-related modules when combining configs in the app-level `configurableModule`.

*Note: `as const` is essential for the right typing of the resulting function*

They can be overriden/set on directly by
```typescript
const createModule = configurableModule({
  config: MyConfig,
  token: 'other_custom_token',
  label: 'inline_label' as const,
  prefix: 'inline_prefix_' as const,
})
```

##### Configurable Modules
Modules creates by `configurableModule` can be used as configurable imports in other configurable modules.  
```typescript
const createModule0 = configurableModule(MyConfig, {})
const createModule = configurableModule(createModule0, {})

const module = createModule({ propertyRequired: 'value' })
```

As a configurable classes they can use `label` and `prefix` options (but not `token`)
```typescript
const createModule0 = configurableModule(MyConfig, {})
const createModule = configurableModule(
  { config: createModule0, label: 'label' as const, prefix: 'prefix_' as const },
  {},
)

const module = createModule({ label: { prefix_propertyRequired: 'value' } })
```

This feature allows you to import configurable modules into one another. The resulting configurable module factory will accept combined configuration options from all configurable modules, maintaining TypeScript type checking to prevent missing required settings or typos and provide hints.

It's also safe to import a configurable module into multiple others, allowing you to configure modules like `Database` once at the top level and use them in various modules.

The module tree can be any depth, enabling the entire app to be configured at the top level (usually `AppModule`) or any intermediate level. It's useful for testing when you need to instantiate only part of the app for a test or if you want to divide your app into smaller apps and run them separately.

**`configurableModule` always auto-import provided configurableImports in newly created modules so that you can inject their exports**

#### Module Definition
You can pass a module definition object function to `configurableModule` as a last argument.
It'll be a base for the resulting module.

##### Module Definition Object
```typescript
class DatabaseModule {
  static createModule = configurableModule(DatabaseConfig, {
    providers: [DatabaseService],
    exports: [DatabaseService],
  })
}
```

Also you can pass a function that returns a module definition
##### Module Definition Factory
```typescript
class DatabaseModule {
  static createModule = configurableModule(DatabaseConfig, (imports, databaseConfig) => ({
    providers: [DatabaseService],
    exports: [DatabaseService],
  }))
}
```

Format of this function is:
<pre>
(imports: DynamicModule[], ...instantiatedClasses: object[]) => <a href="#module-definition-object">ModuleDefinitionObject</a>
</pre>

- `imports` argument contains all auto-imported modules  
- `instantiatedClasses` argument contains all instantiated config classes  
**`instantiatedClasses` only exist when the factory is called synchronously and contains instantiated configs. When not relying on NestJS async providers, all config instances can be created before module creation and used at this point.

#### Create Module Function
That's a module factory function returned by `configurableModule`.  
It accepts a single argument - combined configuration for all `configurableImports` and returns a NestJS DynamicModule.  
It can be called synchronously or asynchronously.  

##### Synchronous
```typescript
const module = createModule({ url: 'http://example.com' })
```
##### Asynchronous
```typescript
const module = await createModule({
  // imports: [...],
  // inject: [...],
  useFactory: async () => ({ url: 'http://example.com' }),
})
```

It makes the function similar to `.register()` or `.registerAsync()` in NestJS core modules, combining both in one.
### configurableModuleLabeled
This function adds another level of configuration to smart modules. It enables the creation of multiple different modules from a single module and config definition, such as creating two connections to two different databases using one database module.

Example:
```typescript
class DatabaseConfig {
  url: string
  username: string
  password: string
}

function getDatabaseToken(label: string) {
  return `Database${label}`
}

function InjectDatabase(label: string) {
  return Inject(getDatabaseToken(label))
}

@Injectable()
class Database {
  static createModule = configurableModule(DatabaseConfig, {
    providers: [Database],
    exports: [Database],
  })
  static createModuleCustom = configurableModuleLabeled(DatabaseConfig, label => ({
    providers: [{ provide: getDatabaseToken(label), useClass: Database }],
    exports: [getDatabaseToken(label)],
  }))

  constructor(private config: DatabaseConfig) {}

  getData() {
    // uses this.config to connect to the Database
  }
}

@Injectable()
class Users {
  static createModule = configurableModule(
    Database.createModule,
    Database.createModuleCustom('database1'),
    Database.createModuleCustom('database2'),
    {
      providers: [Users],
      exports: [Users],
    },
  )

  constructor(
    private defaultDatabase: Database,
    @InjectDatabase('database1') private database1: Database,
    @InjectDatabase('database2') private database2: Database,
  ) {}

  getUsers() {
    // uses all Database to get computed data
  }
}

const usersModule = Users.createModule({
  url: 'http://defaultdatabase.com',
  username: 'username',
  password: 'password',
  database1: {
    url: 'http://database1.com',
    username: 'username',
    password: 'password',
  },
  database2: {
    URL: 'http://database2.com',
    username: 'username',
    password: 'password',
  },
})
```

As shown in the example, when using `configurableModuleLabeled`, an additional property is added to the base config object for each config to avoid conflicts.

The `configurableModuleLabeled` function accepts only a **ModuleDefinitionFactory** as the last argument (not a **ModuleDefinitionObject**) with the same format as in `configurableModule`. However, an additional first argument will contain the label.

Additionally, a module can be instantiated as shown below if you want to instantiate the module immediately:

```typescript
@Module({
  imports: [
    Database.createModuleCustom('database1', {
      URL: 'http://database1.com',
      username: 'username',
      password: 'password',
    }),
  ],
  providers: [Users],
  exports: [Users],
})
@Injectable()
class Users {
  constructor(@InjectDatabase('database1') private database1: Database) {}
}
```

*Note: The examples may follow a one-module, one-provider pattern.*
### moduleLabeled
The `moduleLabeled` helper creates a module from the factory using only a label (no configuration)
```typescript
@Injectable()
class Module {
  static registerCustom = moduleLabeled(label => ({
    imports: [...],
    providers: [...],
    exports: [...],
  }))
}
```

### config
```typescript
class DatabaseConfig {
  url: string
}

@Module({
  providers: [Database],
  exports: [Database],
})
@Injectable()
class Database {
  static forRoot = configurableModule(DatabaseConfig, imports => ({ exports: imports, global: true }))
  // static forRoot = config(DatabaseConfig, true)

  constructor(private config: DatabaseConfig) {}
}

@Module({
  imports: [
    Database.forRoot({
      url: 'example.com',
    }),
  ],
})
class App {}
```

The code above creates a global config that can be instantiated once at the top level and made available throughout the entire app.  
You can also use the helper function `config` that accepts one or more config classes or smart module factories and returns a factory that instantiates all config classes and smart modules and exports them. The last argument determines whether these exports should be global or not, with the default being `false`.

`configLabeledExporter`: This function accepts one or more Config Classes and a function that transforms the label to an injection token. It produces a global config module.
### configLabeledExporter
If you need to create a global config module for a database with two simultaneous connections, you can create a module that meets these requirements:

```typescript
function getDatabaseToken(label: string) {
  return `Database${label}`
}

function InjectDatabase(label: string) {
  return Inject(getDatabaseToken(label))
}

class DatabaseConfig {
  url: string
}

@Injectable()
class Database {
  static forRootCustom = configurableModuleLabeled(
    { config: DatabaseConfig, token: 'DatabaseConfigInternal' },
    label => ({
      providers: [{ provide: getDatabaseToken(label) + DatabaseConfig.name, useExisting: 'DatabaseConfigInternal' }],
      exports: [getDatabaseToken(label) + DatabaseConfig.name],
      global: true,
    }),
  )
  // static forRootCustom = configLabeledExporter(DatabaseConfig, getDatabaseToken)

  constructor(private config: DatabaseConfig) {}

  getData() {
    // uses this.config
  }
}

@Module({
  imports: [
    Database.forRootCustom('database1', {
      url: 'example.com',
    }),
  ],
})
class App {}
```

This code will produce a global config module. Still, since it's labeled - it can't export the `DatabaseConfig` class directly to avoid conflicts.
So `DatabaseConfig` will be exported with the `Database{label}DatabaseConfig` token and can be injected everywhere.
### configLabeledImporter
The next thing is `registerCustom` - a function that, if called with the same label as `forRootCustom` creates a `Database` module that is tied to `DatabaseConfig` (auto injects `Database{label}DatabaseConfig` and provides it as `DatabaseConfig` locally for providers) with the same label, and can be injected via `@InjectDatabase` decorator with the same label.

```typescript
@Injectable()
class Database {
  static registerCustom = moduleLabeled(label => ({
    imports: [
      {
        module: class DatabaseConfigurableImport {},
        providers: [{ provide: DatabaseConfig, useExisting: getDatabaseToken(label) + DatabaseConfig.name }],
        exports: [DatabaseConfig],
      },
    ],
    providers: [{ provide: getDatabaseToken(label), useClass: Database }],
    exports: [getDatabaseToken(label)],
  }))
  // static registerCustom = moduleLabeled(label => ({
  //   imports: [configLabeledImporter(DatabaseConfig, getDatabaseToken)(label)],
  //   providers: [{ provide: getDatabaseToken(label), useClass: Database }],
  //   exports: [getDatabaseToken(label)],
  // }))

  constructor(private config: DatabaseConfig) {}

  getData() {
    // uses this.config
  }
}

@Module({
  imports: [Database.registerCustom('database1')],
  providers: [Users],
  exports: [Users],
})
class Users {
  constructor(@InjectDatabase('database1') private database: Database) {}

  getUsers() {
    // uses this.database
  }
}
```

`configLabeledImporter`: This function accepts the same arguments as `configLabeledExporter` and returns a factory that, based on a label, produces a module that imports the global config created by `configLabeledExporter` and exports these configs with their usual names, such as `DatabaseConfig` in this case.