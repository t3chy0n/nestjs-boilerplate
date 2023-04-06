import {Provider} from '@nestjs/common';

import {MODULE_METADATA} from '@nestjs/common/constants';
import {InjectionToken} from '@nestjs/common/interfaces/modules/injection-token.interface';
import {OptionalFactoryDependency} from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';
import {
  PROXY_FIELD_DEFAULTS,
  PROXY_FIELD_GETTER_FINISHERS,
  PROXY_FIELD_GETTERS,
  PROXY_FIELD_SETTERS,
  PROXY_MODULE_ASSOCIATION,
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
    const getters = Reflect.getMetadata(PROXY_FIELD_GETTERS, target) || {};
    const getterFinishers =
      Reflect.getMetadata(PROXY_FIELD_GETTER_FINISHERS, target) || {};
    const setters = Reflect.getMetadata(PROXY_FIELD_SETTERS, target) || {};
    const defaults = Reflect.getMetadata(PROXY_FIELD_DEFAULTS, target) || {};
    if (!getters[key]) {
      getters[key] = [];
    }
    if (!getterFinishers[key]) {
      getterFinishers[key] = [];
    }
    if (!setters[key]) {
      setters[key] = [];
    }
    if (!defaults[key]) {
      defaults[key] = [];
    }
    getters[key].push(getterCb);
    getterFinishers[key].push(getterFinisherCb);
    setters[key].push(setterCb);
    defaults[key] = target[key];

    Reflect.defineMetadata(PROXY_FIELD_GETTERS, getters, target);
    Reflect.defineMetadata(
      PROXY_FIELD_GETTER_FINISHERS,
      getterFinishers,
      target,
    );
    Reflect.defineMetadata(PROXY_FIELD_SETTERS, setters, target);
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
    const module = Reflect.getMetadata(PROXY_MODULE_ASSOCIATION, target);

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
              Reflect.getMetadata(PROXY_FIELD_GETTERS, target.prototype) || [];
            const getterFinishers =
              Reflect.getMetadata(
                PROXY_FIELD_GETTER_FINISHERS,
                target.prototype,
              ) || [];
            const setters =
              Reflect.getMetadata(PROXY_FIELD_SETTERS, target.prototype) || [];
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
                if (typeof target[property] === 'function') {
                  //If it's a function we call all defined callbacks and return overriden method,
                  //To invoke finisher callbacks after original operation is done.4
                  const propGetters = getters[property];
                  const results = propGetters?.map((call) =>
                    call(target, property, ...args),
                  ) ?? [defaults[property]];

                  const overriden = (...args) => {
                    const result = target[property].call(args);
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
