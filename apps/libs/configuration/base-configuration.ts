import { IConfiguration } from './interfaces/configuration.interface';
import { IConfigurationDriver } from './drivers/configuration-driver.interface';
import { ConfigValueNotFoundException } from './exceptions/config-not-found.exception';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Config = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export class BaseConfiguration implements IConfiguration {
  private _drivers: IConfigurationDriver[] = [];

  get drivers(): IConfigurationDriver[] {
    return this._drivers;
  }

  set drivers(value: IConfigurationDriver[]) {
    this._drivers = value;
  }

  getValue<T>(key: string, defaultValue?: T): T {
    for (const driver of this.drivers) {
      try {
        return driver.get<T>(key);
      } catch (err) {
        if (err instanceof ConfigValueNotFoundException) {
        }
      }
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new ConfigValueNotFoundException(
      `Value ${key} not found in configuration`,
      new Error(key),
    );
  }

  get<T>(key: string, defaultValue?: T): T {
    const profile = this.getProfile();

    try {
      return this.getValue<T>(`%${profile}.${key}`);
    } catch (e) {
      //Value not found, lets catch exception outside of profile
    }

    return this.getValue<T>(key, defaultValue);
  }

  getProfile() {
    return process.env.NODE_ENV;
  }

  async load() {
    await Promise.all(this.drivers.map((driver) => driver.load()));
  }
}
