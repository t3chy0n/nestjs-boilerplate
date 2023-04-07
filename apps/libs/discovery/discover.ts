import { Provider } from '@nestjs/common';

import { MODULE_METADATA } from '@nestjs/common/constants';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';
import {
  PROXY_FIELD_DEFAULTS,
  ADVICES_AFTER,
  ADVICES_BEFORE,
  ADVICES_SETTER_BEFORE,
  ADVICES_BELONGS_TO,
  ADVICES_AFTER_THROW,
  ADVICES_SETTER_AFTER,
  ADVICES_SETTER_AFTER_THROW,
} from '@libs/discovery/const';

export const discovered = [];

// const importsProxy;
// const exportsProxy;
// const providersProxy;
// const controllersProxy;

export function UseProxy<T = any>(
  getterCb: (target: any, property: symbol | number, ...args: any[]) => any,
  getterFinisherCb: (
    target: any,
    property: symbol | number,
    ...args: any[]
  ) => any,
  setterCb: (
    target: any,
    property: symbol | number,
    value: any,
    ...args: any[]
  ) => any,
) {
  return (target: any, key: string | symbol | undefined, index?: number) => {
    const metadataKeys = Reflect.getMetadataKeys(target);
    const getterFinishers = Reflect.getMetadata(ADVICES_AFTER, target) || {};
    const setters = Reflect.getMetadata(ADVICES_SETTER_BEFORE, target) || {};
    const defaults = Reflect.getMetadata(PROXY_FIELD_DEFAULTS, target) || {};

    if (!setters[key]) {
      setters[key] = [];
    }
    if (!defaults[key]) {
      defaults[key] = [];
    }
    setters[key].push(setterCb);
    defaults[key] = target[key];

    Reflect.defineMetadata(ADVICES_SETTER_BEFORE, setters, target);
    Reflect.defineMetadata(PROXY_FIELD_DEFAULTS, defaults, target);

    console.log(
      `Added Target ${
        target?.constructor?.name ?? target?.name ?? ':no_target'
      }${key?.toString() ?? ':no_key'} at ${
        index ?? ':none'
      } to discoverables `,
    );
  };
}

export function ProvideIn<T = any>(
  inject?: Array<InjectionToken | OptionalFactoryDependency>,
) {
  return (target: any, key: string | symbol | undefined, index?: number) => {
    const metadataKeys = Reflect.getMetadataKeys(target);
    const module = Reflect.getMetadata(ADVICES_BELONGS_TO, target);

    const m = require.main;

    const providers: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module) || [];

    const exports: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, module) || [];

    target.constructor = function (...args: any[]) {
      console.log('Overriden constructor call');
      // Wrap the instance with a Proxy to intercept property access and modification
    };

    Reflect.defineMetadata(
      MODULE_METADATA.PROVIDERS,
      [
        ...providers,
        {
          provide: target,
          useFactory: (...args) => {
            const getters =
              Reflect.getMetadata(ADVICES_BEFORE, target.prototype) || [];
            const getterFinishers =
              Reflect.getMetadata(ADVICES_AFTER, target.prototype) || [];
            const afterThrowings =
              Reflect.getMetadata(ADVICES_AFTER_THROW, target.prototype) || [];
            const setters =
              Reflect.getMetadata(ADVICES_SETTER_BEFORE, target.prototype) ||
              [];
            const defaults =
              Reflect.getMetadata(PROXY_FIELD_DEFAULTS, target.prototype) || [];

            console.log('Should create from factory');

            const SKIP_PROXY_TRAPS_FOR = [
              'constructor',
              'then',
              'onModuleInit',
              'onApplicationBootstrap',
            ];

            return new Proxy(target, {
              get: (target, property) => {
                if (SKIP_PROXY_TRAPS_FOR.includes(property.toString())) {
                  return target[property];
                }
                try {
                  const method = target?.prototype[property];
                  if (typeof method === 'function') {
                    //If it's a function we call all defined callbacks and return overriden method,
                    //To invoke finisher callbacks after original operation is done.4
                    const propGetters = getters[property];
                    const results = propGetters?.map((call) =>
                      call(target, property, ...args),
                    ) ?? [defaults[property]];

                    const overriden = (...args) => {
                      const result = method.call(target, ...args);
                      //Call finishers if any from decorator
                      const results = getterFinishers[property]?.map((call) =>
                        call(target, property, ...args),
                      ) ?? [defaults[property]];
                      return result;
                    };

                    return overriden.bind(target);
                  } else {
                    //If its not a function we need to return some value
                    const results = getters[property]?.map((call) =>
                      call(target, property, ...args),
                    ) ?? [defaults[property]];

                    if (!results.length) {
                      return defaults[property];
                    }
                    if (results.length === 1) {
                      return results[0];
                    }
                    return results;
                  }
                } catch (e) {
                  if (afterThrowings.length) {
                    afterThrowings[property]?.forEach((call) =>
                      call(target, property, e),
                    );
                  }
                }
              },
              set: (target, property, value) => {
                const results = setters[property]?.map((call) => {
                  call(target, property, ...args);
                }) ?? [defaults[property]];

                return target[property];
              },
            });
          },
          inject,
        },
      ],
      module,
    );
    Reflect.defineMetadata(
      MODULE_METADATA.EXPORTS,
      [...exports, target],
      module,
    );

    const providers22: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module) || [];

    const exports2: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, module) || [];

    console.log(
      `Added Target ${
        target?.name ?? target?.constructor?.name ?? ':no_target'
      }${key?.toString() ?? ':no_key'} at ${
        index ?? ':none'
      } to auto discoverables in ${module?.name ?? ':no_module_name'}} `,
    );
  };
}
