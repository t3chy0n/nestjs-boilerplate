import { Test, TestingModule } from '@nestjs/testing';

import { EnvDriver } from './drivers/env.driver';
import { YamlDriver } from './drivers/yaml.driver';
import { IExceptionMapper } from '../exceptions/interfaces/exception-mapper.interface';
import { ConfigServerDriver } from './drivers/config-server.driver';
import {
  IConfigServerClient,
  IConfigServerConfiguration,
} from './drivers/config-server/config-server.interfaces';
import { ConfigurationExceptionMapper } from './exception-mapper';
import {
  IBootstrapConfiguration,
  IConfiguration,
} from './interfaces/configuration.interface';
import { ConfigServerClient } from './drivers/config-server/config-server.client';

import { HttpModule, HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigServerConfiguration } from './drivers/config-server/config-server.configuration';
import * as yaml from 'yaml';
import { ConfigValueNotFoundException } from './exceptions/config-not-found.exception';
import { IConfigurationFactory } from './interfaces/configuration-factory.interface';
import { ConfigurationFactory } from './configuration.factory';
import { IBootstrapConfigurationFactory } from './interfaces/bootstrap-configuration-factory.interface';
import { BootstrapConfigurationFactory } from './bootsrap-configuration.factory';
import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  BootstrapConfig,
  Config,
  ConfigProperty,
} from '@libs/configuration/decorators/config.decorators';
import { ConfigurationInstaller } from '@libs/configuration/installer/configuration.installer';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';

class Inner {
  @IsDefined()
  a: string;
  @IsDefined()
  b: string;
}
class Nested {
  a: string;
  @IsDefined()
  b: string;
  @Type(() => Inner)
  @ValidateNested({ each: true })
  arr: Inner[];
  @Type(() => Inner)
  @ValidateNested({ each: true })
  arr2: Map<string, Inner>;
}

@BootstrapConfig()
export class BootstrapTestConfig {
  @ConfigProperty()
  fromServer = false;
  @ConfigProperty('fromYaml')
  fromYaml = false;
}

@Config()
export class TestConfig {
  @ConfigProperty('fromServer')
  fromServer = false;
  @ConfigProperty('fromYaml')
  fromYaml = false;
}

describe('Configuration Drivers', () => {
  let http: HttpService;

  let client: IConfigServerClient;
  let config: IConfiguration;
  let clientConfig: IConfigServerConfiguration;
  let bootstrapConfig: IBootstrapConfiguration;

  let envDriver: EnvDriver;
  let yamlDriver: YamlDriver;
  let configServerDriver: ConfigServerDriver;

  const originalEnv = process.env;

  let bootstrapTestConfig: BootstrapTestConfig;
  let testConfig: BootstrapTestConfig;

  const configServerYaml = `
  config-server:
    url: "http://localhost:8888"
    appName: "api"
    enabled: true
  db:
    host: "TestDbHost"
  mt:
    host: test
    port: test-port
    
  fromServer: true
    
  "%production":
    mt:
      host: test-prod
      port: test-port-prod
  `;

  const yamlDriverConfig = yaml.parse(`
  config-server:
    url: "http://localhost:8888"
    appName: "api"
    enabled: true
  mt:
    host: yaml-test
    port: yaml-test-port
    
  fromYaml: true

  "%development":
    mt:
      host: yaml-test-dev
      port: yaml-test-port-dev
  `);

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, DiscoveryModule],
      providers: [
        YamlDriver,
        EnvDriver,
        ConfigServerDriver,
        BootstrapTestConfig,
        TestConfig,
        {
          provide: 'RUNTIME_CONFIG_DRIVERS',
          useFactory: (...drivers) => drivers,
          inject: [ConfigServerDriver, EnvDriver, YamlDriver],
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
          provide: IConfigServerConfiguration,
          useClass: ConfigServerConfiguration,
        },

        {
          provide: IConfigServerClient,
          useClass: ConfigServerClient,
        },
        {
          provide: IBootstrapConfigurationFactory,
          useClass: BootstrapConfigurationFactory,
        },
        {
          provide: IConfigurationFactory,
          useClass: ConfigurationFactory,
        },
        {
          provide: IConfiguration,
          useFactory: async (factory) => await factory.create(),
          inject: [IConfigurationFactory],
        },
        ConfigurationInstaller,
      ],
    }).compile();

    http = app.get<HttpService>(HttpService);
    jest.spyOn(http, 'get').mockImplementation(() =>
      of({
        data: configServerYaml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }),
    );

    config = app.get<IConfiguration>(IConfiguration);

    client = app.get<IConfigServerClient>(IConfigServerClient);

    bootstrapConfig = app.get<IBootstrapConfiguration>(IBootstrapConfiguration);
    envDriver = app.get<EnvDriver>(EnvDriver);
    yamlDriver = app.get<YamlDriver>(YamlDriver);
    clientConfig = app.get<IConfigServerConfiguration>(
      IConfigServerConfiguration,
    );

    testConfig = app.get<TestConfig>(TestConfig);
    bootstrapTestConfig = app.get<BootstrapTestConfig>(BootstrapTestConfig);

    jest.spyOn(clientConfig, 'isEnabled').mockReturnValue(true);
    jest.spyOn(client, 'fetchConfiguration');

    jest.spyOn(envDriver, 'getEnv').mockImplementation(() => ({
      app_mt_host: 'env-host',
      app_mt_port: 'env-port',
      app_db_runMigrations: true,
      app_fromEnv: true,
    }));

    jest
      .spyOn(yamlDriver, 'getConfig')
      .mockImplementation(() => yamlDriverConfig);

    await config.load();
    await app.init();

    configServerDriver = app.get<ConfigServerDriver>(ConfigServerDriver);
  });
  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('config server', () => {
    it('should resolve config value from server', () => {
      const { host, port } = configServerDriver.config.mt;

      expect(configServerDriver.config.mt.host).toEqual('test');
      expect(configServerDriver.config.mt.port).toEqual('test-port');
      expect(client.fetchConfiguration).toHaveBeenCalledTimes(1);
    });
    it('should return  profile value if its present in config', () => {});
  });

  describe('env driver', () => {
    it('should read variables properly from env"', () => {
      expect(envDriver.config.mt?.host).toEqual('env-host');
      expect(envDriver.config.mt?.port).toEqual('env-port');
    });

    it('should return  profile value if its present in config', () => {});
  });

  describe('yaml', () => {
    it('should resolve config value from server', () => {
      const { host, port } = yamlDriver.config.mt;

      expect(yamlDriver.config.mt.host).toEqual('yaml-test');
      expect(yamlDriver.config.mt.port).toEqual('yaml-test-port');
      expect(client.fetchConfiguration).toHaveBeenCalledTimes(1);
    });
  });

  describe('confuguration adapter', () => {
    it('should resolve config looking through different of configuration drivers', async () => {
      expect(config.get('fromServer')).toEqual(true);
      expect(config.get('fromYaml')).toEqual(true);
      expect(config.get('fromEnv')).toEqual(true);
    });

    it('should throw when no configurtion was found', async () => {
      try {
        await config.get('asd.asd.asd.asd');
      } catch (e) {
        expect(e instanceof ConfigValueNotFoundException).toBeTruthy();
      }
    });

    it('should prefer value from a profile from development', async () => {
      jest.spyOn(config, 'getProfile').mockReturnValue('development');

      expect(config.get('mt.host')).toEqual('yaml-test-dev');
    });

    it('should prefer value from a profile from production', async () => {
      jest.spyOn(config, 'getProfile').mockReturnValue('production');

      expect(config.get('mt.host')).toEqual('test-prod');
      expect(config.get('mt.port')).toEqual('test-port-prod');
    });
  });

  describe('Shared parent node', () => {
    it('should resolve configurations when parent node is shared between drivers', async () => {
      expect(config.get('db.runMigrations')).toEqual(true);
      expect(config.get('db.host')).toEqual('TestDbHost');
    });
  });

  describe('Test configuration assembled through deorators', () => {
    it('should use bootstrap drivers when decorated with @BootstrapConfig', async () => {
      expect(bootstrapTestConfig.fromServer).toEqual(false);
      expect(bootstrapTestConfig.fromYaml).toEqual(true);
    });
    it('should use all drivers when decorated with @Config', async () => {
      expect(testConfig.fromServer).toEqual(true);
      expect(testConfig.fromYaml).toEqual(true);
    });
  });
});
