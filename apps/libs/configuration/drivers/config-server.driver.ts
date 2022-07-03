import { Injectable, Logger } from '@nestjs/common';
import { BaseDriver } from './base.driver';
import { IConfigServerClient } from './config-server/config-server.interfaces';

/***
 * Driver to fetch configuration from Spring Cloud config server
 *
 */
@Injectable()
export class ConfigServerDriver extends BaseDriver {
  private readonly logger: Logger = new Logger(ConfigServerDriver.name);

  constructor(private readonly client: IConfigServerClient) {
    super();
  }

  async load(): Promise<void> {
    try {
      this.config = await this.client.fetchConfiguration();
    } catch (e) {
      this.logger.error('Could not connect to config server');
      this.logger.debug('Silently load empty config server driver');
      this.config = {};
    } finally {
      await super.load();
    }
  }
}
