import { Test, TestingModule } from '@nestjs/testing';
import { IConfigServerConfiguration } from './config-server.interfaces';
import { IBootstrapConfiguration } from '../../interfaces/configuration.interface';
import { BootstrapConfigurationAdapter } from '../../bootstrap-configuration.adapter';
import { ConfigServerConfiguration } from './config-server.configuration';
import { EnvDriver } from '../env.driver';

describe('config-server Configuration', () => {
  let config: IBootstrapConfiguration;
  let subject: IConfigServerConfiguration;

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
      jest.spyOn(subject, 'getUrl').mockReturnValue('http://mocked');
      jest.spyOn(subject, 'getAppName').mockReturnValue('app');
      jest.spyOn(subject, 'getLabel').mockReturnValue(null);
      jest.spyOn(subject, 'getProfile').mockReturnValue(null);

      expect(await subject.getConfigurationUrl()).toBe(
        'http://mocked/app.yaml',
      );
    });

    it('when  appName, url, and profile and url are defined', async () => {
      jest.spyOn(subject, 'getUrl').mockReturnValue('http://mocked');
      jest.spyOn(subject, 'getAppName').mockReturnValue('app');
      jest.spyOn(subject, 'getLabel').mockReturnValue(null);
      jest.spyOn(subject, 'getProfile').mockReturnValue('profile');
      await config.load();

      expect(await subject.getConfigurationUrl()).toBe(
        'http://mocked/app-profile.yaml',
      );
    });

    it('when  appName, url, label and profile and url are defined', async () => {
      jest.spyOn(subject, 'getUrl').mockReturnValue('http://mocked');
      jest.spyOn(subject, 'getAppName').mockReturnValue('app');
      jest.spyOn(subject, 'getLabel').mockReturnValue('label');
      jest.spyOn(subject, 'getProfile').mockReturnValue('profile');
      await config.load();

      expect(await subject.getConfigurationUrl()).toBe(
        'http://mocked/label/app-profile.yaml',
      );
    });
  });
});
