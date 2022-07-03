import { IConfigurationDriver } from './configuration-driver.interface';
import { Injectable } from '@nestjs/common';

import { ConfigValueNotFoundException } from '../exceptions/config-not-found.exception';
import { get, has } from 'lodash';
import { Subject } from 'rxjs';
import { ConfigValueNotLoadedException } from '../exceptions/config-not-loaded.exception';

/***
 * Driver to fetch configuration from Spring Cloud config server
 *
 */
@Injectable()
export abstract class BaseDriver implements IConfigurationDriver {
  protected _isLoaded: boolean;
  protected _loaded: Subject<boolean> = new Subject<boolean>();

  protected _config: any = {};

  get config(): any {
    return this._config;
  }

  set config(value: any) {
    this._config = value;
  }

  async load(): Promise<void> {
    this._isLoaded = true;

    this._loaded.next(true);
    this._loaded.complete();
  }

  getProfile() {
    return process.env.NODE_ENV;
  }

  /***
   * Iterates over all config drivers in order to find a value under `key` path
   *
   * @param key
   * @param defaultValue
   */
  get<T>(key: string, defaultValue?: T): T {
    if (!this._isLoaded) {
      throw new ConfigValueNotLoadedException(
        'Configuration is not loaded yet, and cannot accept queries',
      );
    }
    if (!has(this.config, key) && defaultValue === undefined) {
      throw new ConfigValueNotFoundException(
        `Config value for ${key} was not found`,
      );
    }
    return get(this.config, key, defaultValue);
  }
}
