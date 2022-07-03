import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { BaseDriver } from './base.driver';
import { IExceptionMapper } from '../../exceptions/interfaces/exception-mapper.interface';

const YAML_CONFIG_FILE = './config/application.yaml';

/***
 * Driver to fetch configuration from environment variables
 *
 */
@Injectable()
export class YamlDriver extends BaseDriver {
  constructor(private readonly exceptions: IExceptionMapper) {
    super();
  }

  /***
   * Loads configuration from yaml file
   */
  getConfig() {
    try {
      const file = fs.readFileSync(YAML_CONFIG_FILE, 'utf8');
      return yaml.parse(file);
    } catch (err) {
      this.exceptions.map(err);
    }
  }

  async load(): Promise<void> {
    this.config = this.getConfig();
    await super.load();
  }
}
