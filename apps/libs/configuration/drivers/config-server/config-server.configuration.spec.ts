import { Test, TestingModule } from '@nestjs/testing';
import { IConfigServerConfiguration } from './config-server.interfaces';
import { IBootstrapConfiguration } from '../../interfaces/configuration.interface';
import { BootstrapConfigurationAdapter } from '../../bootstrap-configuration.adapter';
import { ConfigServerConfiguration } from './config-server.configuration';
import { EnvDriver } from '../env.driver';
import { expect, sharedSandbox } from '@utils/test-utils';

describe('config-server Configuration', () => {
  let config: IBootstrapConfiguration;
  let subject: IConfigServerConfiguration;

  const sandbox = sharedSandbox();

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        EnvDriver,
        {
          provide: 'BOOTSTRAP_CONFIG_DRIVERS',
          useFactory: (...drivers) => drivers,
          inject: [EnvDriver],
        },
        {
          provide: IBootstrapConfiguration,
          useClass: BootstrapConfigurationAdapter,
        },
        {
          provide: IConfigServerConfiguration,
          useClass: ConfigServerConfiguration,
        },
      ],
    }).compile();

    config = app.get<IBootstrapConfiguration>(IBootstrapConfiguration);
    await config.load();

    subject = app.get<IConfigServerConfiguration>(IConfigServerConfiguration);
  });

  describe('should return proper config file url', () => {
    it('when only appName and url are defined', async () => {
      sandbox.stub(subject, 'getUrl').returns('http://mocked');
      sandbox.stub(subject, 'getAppName').returns('app');
      sandbox.stub(subject, 'getLabel').returns(null);
      sandbox.stub(subject, 'getProfile').returns(null);

      const result = await subject.getConfigurationUrl();
      expect(result[0]).to.be.equal('http://mocked/app.json');
    });

    it('when  appName, url, and profile and url are defined', async () => {
      sandbox.stub(subject, 'getUrl').returns('http://mocked');
      sandbox.stub(subject, 'getAppName').returns('app');
      sandbox.stub(subject, 'getLabel').returns(null);
      sandbox.stub(subject, 'getProfile').returns('profile');
      await config.load();

      const result = await subject.getConfigurationUrl();
      expect(result[0]).to.be.equal('http://mocked/app-profile.json');
    });

    it('when  appName, url, label and profile and url are defined', async () => {
      sandbox.stub(subject, 'getUrl').returns('http://mocked');
      sandbox.stub(subject, 'getAppName').returns('app');
      sandbox.stub(subject, 'getLabel').returns('label');
      sandbox.stub(subject, 'getProfile').returns('profile');
      await config.load();

      const result = await subject.getConfigurationUrl();
      expect(result[0]).to.be.equal('http://mocked/label/app-profile.json');
    });
  });
});
