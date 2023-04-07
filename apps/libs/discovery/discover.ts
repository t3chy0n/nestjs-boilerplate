import { Provider } from '@nestjs/common';

import { MODULE_METADATA } from '@nestjs/common/constants';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';
import {
  ADVICES_AFTER,
  ADVICES_BELONGS_TO,
  ADVICES_ENSURE_PARENT_IMPORTS,
  ADVICES_SETTER_BEFORE,
  PROXY_FIELD_DEFAULTS,
} from '@libs/discovery/const';
import { Bean } from '@libs/discovery/bean';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';
import { LazyLoaderModule } from '@libs/lazy-loader/lazy-loader.module';

export const discovered = [];

// const importsProxy;
// const exportsProxy;
// const providersProxy;
// const controllersProxy;

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

    const parentImports: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, module) || [];

    Reflect.defineMetadata(
      MODULE_METADATA.IMPORTS,
      [...parentImports, LazyLoaderModule].filter((m) => m !== module),
      module,
    );

    Reflect.defineMetadata(
      MODULE_METADATA.PROVIDERS,
      [
        ...providers,
        {
          provide: target,
          useFactory: async (...args) => {
            const [lazyLoader, ...rest] = args;
            const bean = new Bean(target, lazyLoader, rest);
            return bean.createProxy();
          },
          inject: [ILazyLoaderService, ...inject],
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
