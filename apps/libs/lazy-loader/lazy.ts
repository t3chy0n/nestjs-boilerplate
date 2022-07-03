import { OnModuleInit } from '@nestjs/common';
import { AnyConstructor } from './types';
import { NotInstantiatedException } from './not-instantiated.exception';
import { ILogger } from '../logger/logger.interface';

export class Lazy<T> implements OnModuleInit {
  proxy: any;
  instance: T | null = null;
  assistedInjectionParams: any[] = [];

  constructor(
    public readonly clazz: AnyConstructor<T>,
    private readonly logger: ILogger,
  ) {
    this.proxy = new Proxy(
      {},
      {
        get: (target, propKey, receiver) => {
          if (this.instance && this.instance[propKey]) {
            return this.instance[propKey].bind(this.instance);
          }

          //If there is no instance, but key exists in a prototype, lets show error
          if (
            !this.instance &&
            typeof this.clazz.prototype[propKey] === 'function'
          ) {
            return () => {
              this.logger.error(
                `Tries to access method of non instantiated lazy object. Calls ${
                  clazz.name
                }.${propKey.toString()} and it wasnt instantiated yet`,
              );
            };
          }

          return this.clazz.prototype[propKey];
        },
      },
    );
  }

  instantiate(instance: T) {
    this.instance = instance;
  }

  onModuleInit() {
    throw new Error('No initialization done for lazy component');
  }
}
