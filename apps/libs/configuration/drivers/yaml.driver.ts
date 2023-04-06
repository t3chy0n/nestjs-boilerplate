import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { BaseDriver } from './base.driver';
import { IExceptionMapper } from '../../exceptions/interfaces/exception-mapper.interface';
import { getFiles } from '@libs/utils/get-files';
import * as _ from 'lodash';

/***
 * Driver to fetch configuration from environment variables
 *
 */
@Injectable()
export class YamlDriver extends BaseDriver {
  private logger = new ConsoleLogger(YamlDriver.name);

  constructor(private readonly exceptions: IExceptionMapper) {
    super();
  }

  /***
   * Loads configuration from yaml file
   */
  getConfig() {
    try {
      const files = [...getFiles('./config')];
      const yamlConfigs = files.filter((f) => f.endsWith('.yaml'));

      const parsed = yamlConfigs.map((yamlConfigPath) => {
        const file = fs.readFileSync(yamlConfigPath, 'utf8');
        return yaml.parse(file);
      });
      return _.merge({}, ...parsed);
    } catch (err) {
      this.exceptions.map(err);
    }
  }

  async load(): Promise<void> {
    this.config = this.getConfig();
    this.logger.log(`Loading ${Object.values(this.config).length} yaml variables`);

    await super.load();
  }
}
