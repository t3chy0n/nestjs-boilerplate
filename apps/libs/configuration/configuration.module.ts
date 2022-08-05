import { DynamicModule, Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EnvDriver } from './drivers/env.driver';
import { YamlDriver } from './drivers/yaml.driver';
import { ConfigServerDriver } from './drivers/config-server.driver';
import {
  IBootstrapConfiguration,
  IConfiguration,
} from './interfaces/configuration.interface';
import { ConfigurationAdapter } from './configuration.adapter';
import { IExceptionMapper } from '../exceptions/interfaces/exception-mapper.interface';
import { ConfigurationExceptionMapper } from './exception-mapper';
import {
  IConfigServerClient,
  IConfigServerConfiguration,
} from './drivers/config-server/config-server.interfaces';
import { ConfigServerConfiguration } from './drivers/config-server/config-server.configuration';
import { ConfigServerClient } from './drivers/config-server/config-server.client';
import { IConfigurationFactory } from './interfaces/configuration-factory.interface';
import { ConfigurationFactory } from './configuration.factory';
import { BootstrapConfigurationFactory } from './bootsrap-configuration.factory';
import { IBootstrapConfigurationFactory } from './interfaces/bootstrap-configuration-factory.interface';
import { ConfigurationInstaller } from '@libs/configuration/installer/configuration.installer';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 1000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    {
      provide: IConfigServerConfiguration,
      useClass: ConfigServerConfiguration,
    },
    ConfigurationInstaller,
    YamlDriver,
    EnvDriver,
    ConfigServerDriver,
    {
      provide: 'RUNTIME_CONFIG_DRIVERS',
      useFactory: (...drivers) => drivers,
      inject: [ConfigServerDriver, EnvDriver, YamlDriver],
    },
    {
      provide: 'BOOTSTRAP_CONFIG_DRIVERS',
      useFactory: (...drivers) => drivers,
      inject: [EnvDriver, YamlDriver],
    },
    {
      provide: IExceptionMapper,
      useClass: ConfigurationExceptionMapper,
    },
    {
      provide: IBootstrapConfiguration,
      useFactory: (factory: IBootstrapConfigurationFactory) => factory.create(),
      inject: [IBootstrapConfigurationFactory],
    },

    {
      provide: IConfigServerClient,
      useClass: ConfigServerClient,
    },
    {
      provide: IConfigurationFactory,
      useClass: ConfigurationFactory,
    },
    {
      provide: IBootstrapConfigurationFactory,
      useClass: BootstrapConfigurationFactory,
    },
    {
      provide: IConfiguration,
      useFactory: async (factory: IConfigurationFactory) =>
        await factory.create(),
      inject: [IConfigurationFactory],
    },
  ],
  exports: [IConfiguration, IBootstrapConfiguration],
})
export class ConfigurationModule {
  static forTests(entities = [], options?): DynamicModule {
    return {
      module: ConfigurationModule,
      imports: [
        HttpModule.register({
          timeout: 1000,
          maxRedirects: 5,
        }),
      ],
      providers: [
        YamlDriver,
        EnvDriver,
        {
          provide: 'RUNTIME_CONFIG_DRIVERS',
          useFactory: (...drivers) => drivers,
          inject: [EnvDriver, YamlDriver],
        },
        {
          provide: 'BOOTSTRAP_CONFIG_DRIVERS',
          useFactory: (...drivers) => drivers,
          inject: [YamlDriver, EnvDriver],
        },
        {
          provide: IExceptionMapper,
          useClass: ConfigurationExceptionMapper,
        },
        {
          provide: IBootstrapConfiguration,
          useFactory: async (factory: IConfigurationFactory) =>
            await factory.create(),
          inject: [IBootstrapConfigurationFactory],
        },

        {
          provide: IConfigServerClient,
          useClass: ConfigServerClient,
        },
        {
          provide: IConfiguration,
          useClass: ConfigurationAdapter,
        },

        {
          provide: IConfiguration,
          useFactory: async (factory: IConfigurationFactory) =>
            await factory.create(),
          inject: [IConfigurationFactory],
        },
      ],
      exports: [IConfiguration, IBootstrapConfiguration],
    };
  }
}
