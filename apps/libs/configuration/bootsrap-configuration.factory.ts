import { IConfiguration } from './interfaces/configuration.interface';
import { IConfigurationFactory } from './interfaces/configuration-factory.interface';
import { Inject } from '@nestjs/common';
import { IConfigurationDriver } from './drivers/configuration-driver.interface';
import { ConfigurationAdapter } from './configuration.adapter';

/***
 * Factory class instantiating new configuration adapter objects, which are used to
 * instatioate f.e remote config drivers, and need to have configuration in place
 */
export class BootstrapConfigurationFactory implements IConfigurationFactory {
  constructor(
    @Inject('BOOTSTRAP_CONFIG_DRIVERS')
    private readonly configDrivers: IConfigurationDriver[],
  ) {}

  /***
   * Create new instance of Configuration adapter, with only local configuration drivers
   */
  async create(): Promise<IConfiguration> {
    const subject = new ConfigurationAdapter(this.configDrivers);
    await subject.load();
    return subject;
  }
}
