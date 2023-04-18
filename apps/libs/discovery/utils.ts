import {
  AllFactories,
  AllInjectables,
  AllModules,
} from '@libs/discovery/registry';
import { getCommonPath } from '@libs/discovery/get-common-path';
import { Logger, Provider } from '@nestjs/common';
import {
  MODULE_METADATA,
  SCOPE_OPTIONS_METADATA,
} from '@nestjs/common/constants';
import { pairs } from '@libs/iterators';
import {
  ADVICES_BELONGS_TO,
  ADVICES_ENSURE_PARENT_IMPORTS,
  FACTORY_USED_METHOD_NAME,
  PROXY_INJECT_DEPS,
} from '@libs/discovery/const';
import { Bean } from '@libs/discovery/bean';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';

type ScoredModuleAssignment = {
  module: any;
  score: number;
};

function getBestMatchingModule(injectablePath: string) {
  const scores: ScoredModuleAssignment[] = [];

  for (const [modulePath, module] of pairs(AllModules)) {
    const sharedPath = getCommonPath(modulePath, injectablePath);
    scores.push({ module, score: sharedPath.length });
  }

  scores.sort((a, b) => b.score - a.score);

  return scores[0].module;
}

export function getDecoratorCallerPath() {
  //TODO: This is big if part, its not certain that callstack will look like this on every env but its good enough in this case
  //TODO: Ideally in order to test this, should be moved to seperate lib and tested under multiple nodejs configurations
  // for scoring an
  const stack = new Error().stack.match(/__decorate.+[(](.+?):.*?:.*?[)]/i);
  return stack[1];
}

export class DependencyIndex {
  private dependencies;
  private enumeratedDeps: any[] = [];
  private depsArray: any[] = [];

  constructor(private readonly target: any) {
    this.dependencies = Reflect.getMetadata(PROXY_INJECT_DEPS, target) || [];
    const keys = Object.keys(this.dependencies);

    for (const k of keys) {
      this.enumeratedDeps.push(k);
      this.depsArray.push(this.dependencies[k]);
    }
  }

  getArray() {
    return this.depsArray;
  }

  remapDepsToObject(arr) {
    const remapped: Record<string, any> = {};
    for (let i = 0; i < this.enumeratedDeps.length; i++) {
      const reconstructKey = this.enumeratedDeps[i];
      remapped[reconstructKey] = arr[i];
    }
    return remapped;
  }
}

export const moduleAutoMatch = () => {
  const logger = new Logger('Automatching');

  if (!Object.values(AllModules).length) {
    logger.warn('No modules detected for auto matching.');
    return;
  }
  for (const [idx, injectable] of pairs(AllInjectables)) {
    const injectablePath = idx.split('||')[0];
    const moduleAssosiation = Reflect.getMetadata(
      ADVICES_BELONGS_TO,
      injectable,
    );

    const matchedModule =
      moduleAssosiation ?? getBestMatchingModule(injectablePath);
    logger.log(`Matching ${injectable.name} to ${matchedModule.name}`);

    const parentImports: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, matchedModule) || [];

    const toEnsureImports: Provider[] =
      Reflect.getMetadata(ADVICES_ENSURE_PARENT_IMPORTS, injectable) || [];

    const uniqueImports = new Set(
      [...parentImports, ...toEnsureImports].filter((m) => m !== matchedModule),
    );
    Reflect.defineMetadata(
      MODULE_METADATA.IMPORTS,
      uniqueImports,
      matchedModule,
    );

    const providers: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, matchedModule) || [];

    const options = Reflect.getMetadata(SCOPE_OPTIONS_METADATA, injectable);

    const instanceToken = Symbol(`AUTO_DISCOVERY_${injectable.name}`);

    const dependencyIndex = new DependencyIndex(injectable);

    if (!options.nonInjectable) {
      providers.push({
        provide: instanceToken,
        useClass: injectable,
      });
      providers.push({
        provide: options?.provide ?? injectable,
        useFactory: async (...args) => {
          const [instance, externalContextCreator, ...rest] = args;
          const depObject = dependencyIndex.remapDepsToObject(rest);
          const bean = new Bean(injectable, depObject, externalContextCreator);
          await bean.setInstance(instance);
          return bean.createProxy();
        },
        inject: [
          instanceToken,
          ExternalContextCreator,
          ...dependencyIndex.getArray(),
        ],
      });
    } else {
      logger.warn(`${injectable.name} is non injectable.`);
      const factoryName = `${injectable.name}BeanInjectables`;
      providers.push({
        provide: factoryName,
        useFactory: (...args) => {
          console.log(` ${factoryName} was created for a non injectible class`);

          return () => {
            return args;
          };
        },
        inject: dependencyIndex.getArray(),
      });
    }

    Reflect.defineMetadata(
      MODULE_METADATA.PROVIDERS,
      [...providers],
      matchedModule,
    );
  }

  for (const [idx, injectable] of pairs(AllFactories)) {
    const injectablePath = idx.split('||')[0];
    const matchedModule = getBestMatchingModule(injectablePath);

    logger.log(`Matching factory ${injectable.name} to ${matchedModule.name}`);

    const providers: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, matchedModule) || [];

    const parentImports: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, matchedModule) || [];

    const toEnsureImports: Provider[] =
      Reflect.getMetadata(ADVICES_ENSURE_PARENT_IMPORTS, injectable) || [];

    const uniqueImports = new Set(
      [...parentImports, ...toEnsureImports].filter((m) => m !== matchedModule),
    );
    Reflect.defineMetadata(
      MODULE_METADATA.IMPORTS,
      uniqueImports,
      matchedModule,
    );
    const classOptions = Reflect.getMetadata(
      SCOPE_OPTIONS_METADATA,
      injectable.constructor,
    );

    for (const key of Reflect.ownKeys(injectable)) {
      const method = Reflect.getMetadata(
        FACTORY_USED_METHOD_NAME,
        injectable[key],
      );
      const options = Reflect.getMetadata(
        SCOPE_OPTIONS_METADATA,
        injectable[key],
      );

      if (!method) {
        continue;
      }
      const dependencyIndex = new DependencyIndex(injectable.constructor);
      Reflect.defineMetadata(
        MODULE_METADATA.PROVIDERS,
        [
          ...providers,
          {
            provide: options.provide,
            useFactory: async (...args) => {
              const [factory, externalContextCreator, ...rest] = args;
              if (!factory[method]) {
                throw new Error('Factory method is not defined');
              }

              const instance = await factory[method].call(factory);
              if (Array.isArray(instance)) {
                return instance;
              }
              const depObject = dependencyIndex.remapDepsToObject(rest);
              const bean = new Bean(
                instance.constructor,
                depObject,
                externalContextCreator,
              );
              await bean.setInstance(instance);
              return bean.createProxy();
            },
            inject: [
              classOptions?.provide ?? injectable.constructor,
              ExternalContextCreator,
              ...dependencyIndex.getArray(),
            ],
          },
        ],
        matchedModule,
      );
    }
  }

  logger.log('Auto matched modules');
};

/**
 * Function that returns a new decorator that applies all decorators provided by param
 *
 * Useful to build new decorators (or a decorator factory) encapsulating multiple decorators related with the same feature
 *
 * @param decorators one or more decorators (e.g., `ApplyGuard(...)`)
 *
 * @publicApi
 */
export function applyDecorators(
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
  return <TFunction extends Function, Y>(
    target: TFunction | object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<Y>,
  ) => {
    for (const decorator of decorators) {
      (decorator as MethodDecorator | PropertyDecorator)(
        target,
        propertyKey,
        descriptor,
      );
    }
  };
}
