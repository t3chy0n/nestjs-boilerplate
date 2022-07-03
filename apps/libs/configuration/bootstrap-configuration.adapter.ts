import { Inject, Injectable } from '@nestjs/common';
import { IConfigurationDriver } from './drivers/configuration-driver.interface';
import { BaseConfiguration } from './base-configuration';

/***
 * Abstraction layer to provide configuration interface, it is used to bootstrap config drivers that requires some prior configuratio
 * F.e Config cloud server connection data
 *
 */
@Injectable()
export class BootstrapConfigurationAdapter extends BaseConfiguration {
  constructor(
    @Inject('BOOTSTRAP_CONFIG_DRIVERS')
    private readonly configDrivers: IConfigurationDriver[],
  ) {
    super();
    this.drivers = configDrivers;
  }
}
