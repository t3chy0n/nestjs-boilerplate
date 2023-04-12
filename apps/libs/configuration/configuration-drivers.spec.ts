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

import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { expect, sharedSandbox } from '@utils/test-utils';

describe('Configuration Drivers', () => {
  const sandbox = sharedSandbox();

  let http: HttpService;

  let client: IConfigServerClient;
  let config: IConfiguration;
  let fetchConfigurationSpy;

  let clientConfig: IConfigServerConfiguration;
  let bootstrapConfig: IBootstrapConfiguration;

  let envDriver: EnvDriver;
  let yamlDriver: YamlDriver;
  let configServerDriver: ConfigServerDriver;

  const originalEnv = process.env;

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
    sandbox
      .stub(ConfigServerConfiguration.prototype, 'isEnabled')
      .returns(true);

    sandbox.stub(HttpService.prototype, 'get').callsFake(() =>
      of({
        data: configServerYaml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }),
    );

    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, DiscoveryModule],
      providers: [
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
      ],
    }).compile();

    config = app.get<IConfiguration>(IConfiguration);

    client = app.get<IConfigServerClient>(IConfigServerClient);

    bootstrapConfig = app.get<IBootstrapConfiguration>(IBootstrapConfiguration);
    envDriver = app.get<EnvDriver>(EnvDriver);
    yamlDriver = app.get<YamlDriver>(YamlDriver);
    clientConfig = app.get<IConfigServerConfiguration>(
      IConfigServerConfiguration,
    );

    fetchConfigurationSpy = sandbox.spy(client, 'fetchConfiguration');

    sandbox.stub(envDriver, 'getEnv').callsFake(() => ({
      app_mt_host: 'env-host',
      app_mt_port: 'env-port',
      app_db_runMigrations: true,
      app_fromEnv: true,
    }));

    sandbox.stub(yamlDriver, 'getConfig').callsFake(() => yamlDriverConfig);

    await config.load();
    await app.init();

    configServerDriver = app.get<ConfigServerDriver>(ConfigServerDriver);
  });
  afterEach(() => {
    process.env = originalEnv;
  });

  describe('config server', () => {
    it('should resolve config value from server', () => {
      const { host, port } = configServerDriver.config.mt;

      expect(configServerDriver.config.mt.host).to.equal('test');
      expect(configServerDriver.config.mt.port).to.equal('test-port');
      expect(fetchConfigurationSpy.callCount).to.equal(1);
    });
    it('should return  profile value if its present in config', () => {});
  });

  describe('env driver', () => {
    it('should read variables properly from env"', () => {
      expect(envDriver.config.mt?.host).to.equal('env-host');
      expect(envDriver.config.mt?.port).to.equal('env-port');
    });

    it('should return  profile value if its present in config', () => {});
  });

  describe('yaml', () => {
    it('should resolve config value from server', () => {
      const { host, port } = yamlDriver.config.mt;

      expect(yamlDriver.config.mt.host).to.equal('yaml-test');
      expect(yamlDriver.config.mt.port).to.equal('yaml-test-port');
      expect(fetchConfigurationSpy.callCount).to.equal(1);
    });
  });

  describe('confuguration adapter', () => {
    it('should resolve config looking through different of configuration drivers', async () => {
      expect(config.get('fromServer')).to.equal(true);
      expect(config.get('fromYaml')).to.equal(true);
      expect(config.get('fromEnv')).to.equal(true);
    });

    it('should throw when no configurtion was found', async () => {
      try {
        await config.get('asd.asd.asd.asd');
      } catch (e) {
        expect(e).to.be.instanceof(ConfigValueNotFoundException);
      }
    });

    it('should prefer value from a profile from development', async () => {
      sandbox.stub(config, 'getProfile').returns('development');

      expect(config.get('mt.host')).to.equal('yaml-test-dev');
    });

    it('should prefer value from a profile from production', async () => {
      sandbox.stub(config, 'getProfile').returns('production');

      expect(config.get('mt.host')).to.equal('test-prod');
      expect(config.get('mt.port')).to.equal('test-port-prod');
    });
  });

  describe('Shared parent node', () => {
    it('should resolve configurations when parent node is shared between drivers', async () => {
      expect(config.get('db.runMigrations')).to.equal(true);
      expect(config.get('db.host')).to.equal('TestDbHost');
    });
  });
});
