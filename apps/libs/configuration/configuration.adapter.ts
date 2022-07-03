import { Injectable } from '@nestjs/common';
import { BaseConfiguration } from './base-configuration';
import { IConfigurationDriver } from './drivers/configuration-driver.interface';

/***
 * Abstraction layer to provide configuration interface, leveraging multiple levels of configuration
 *
 */
@Injectable()
export class ConfigurationAdapter extends BaseConfiguration {
  constructor(private readonly configDrivers: IConfigurationDriver[]) {
    super();
    this.drivers = configDrivers;
  }
}
