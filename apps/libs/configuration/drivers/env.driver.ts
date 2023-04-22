import { ConsoleLogger, Injectable } from '@nestjs/common';
import { set } from 'lodash';
import 'dotenv/config';
import { BaseDriver } from './base.driver';

const APPLICATION_ENV_VARIABLE_PREFIX = 'app_';

/***
 * Driver to fetch configuration from environment variables
 *
 */
@Injectable()
export class EnvDriver extends BaseDriver {
  private logger = new ConsoleLogger(EnvDriver.name);

  constructor() {
    super();
  }

  getEnv(): any {
    return process.env;
  }

  /***
   * Loads env driver and prepares it to use
   * Maps all environment variables to json object. It transforms _ to . in order to prepare path string understandable for lodash
   */
  async load(): Promise<void> {
    const env = this.getEnv();

    const variables = Object.keys(env)
      .map((variable) => ({
        key: variable.toLowerCase(),
        value: env[variable],
      }))
      .filter(({ key }) => key.startsWith(APPLICATION_ENV_VARIABLE_PREFIX));

    for (const variable of variables) {
      const key = variable.key.replace(new RegExp('_', 'g'), '.');
      const path = key.slice(APPLICATION_ENV_VARIABLE_PREFIX.length);

      try {
        //Try to cast variable value to proper type
        const value = JSON.parse(variable.value);
        set(this._config, path, value);
      } catch (e) {
        //Parsing dint go well, leave value as a string
        set(this._config, path, variable.value);
      }
    }

    this.logger.log(`Loading ${variables.length} env variables`);
    await super.load();
  }
}
