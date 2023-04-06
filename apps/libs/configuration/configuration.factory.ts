import { IConfiguration } from './interfaces/configuration.interface';
import { IConfigurationFactory } from './interfaces/configuration-factory.interface';
import { Inject } from '@nestjs/common';
import { IConfigurationDriver } from './drivers/configuration-driver.interface';
import { ConfigurationAdapter } from './configuration.adapter';
import { Factory } from '@libs/discovery/decorators/factory.decorator';
import { Injectable } from '@libs/discovery/decorators/injectable.decorator';

/***
 * Factory class instantiating new configuration adapter objects
 */
@Injectable()
export class ConfigurationFactory implements IConfigurationFactory {
  constructor(
    @Inject('RUNTIME_CONFIG_DRIVERS')
    private readonly configDrivers: IConfigurationDriver[],
  ) {}

  /***
   * Create new instance of Configuration adapter, with all configuration drivers
   */
  @Factory({ provide: IConfiguration })
  async create(): Promise<IConfiguration> {
    const subject = new ConfigurationAdapter(this.configDrivers);
    await subject.load();
    return subject;
  }
}
