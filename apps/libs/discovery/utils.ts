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
  FACTORY_USED_METHOD_NAME,
  ADVICES_BELONGS_TO,
  ADVICES_ENSURE_PARENT_IMPORTS,
  PROXY_INJECT_DEPS,
} from '@libs/discovery/const';
import { Bean } from '@libs/discovery/bean';

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
  const stack = new Error().stack.match(/ __decorate.+[(](.+?):.*?:.*?[)]/i);
  return stack[1];
}

class DependencyIndex {
  private dependencies;
  private enumeratedDeps: any[] = [];
  private depsArray: any[] = [];

  constructor(private readonly target: any) {
    this.dependencies = Reflect.getMetadata(PROXY_INJECT_DEPS, target);
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

function createDependencyIndex(target) {
  const depArray = [];
}

export const moduleAutoMatch = () => {
  const logger = new Logger('Automatching');

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
    Reflect.defineMetadata(
      MODULE_METADATA.PROVIDERS,
      [
        ...providers,
        {
          provide: instanceToken,
          useClass: injectable,
        },
        {
          provide: injectable,
          useFactory: async (...args) => {
            const [instance, ...rest] = args;
            const depObject = dependencyIndex.remapDepsToObject(rest);
            const bean = new Bean(injectable, depObject);
            await bean.setInstance(instance);
            return bean.createProxy();
          },
          inject: [instanceToken, ...dependencyIndex.getArray()],
        },
      ],
      matchedModule,
    );

    const providers22: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, matchedModule) || [];

    const exports2: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, matchedModule) || [];

    const imports2: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, matchedModule) || [];

    console.log(matchedModule);
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

    const method = Reflect.getMetadata(FACTORY_USED_METHOD_NAME, injectable);
    const options = Reflect.getMetadata(SCOPE_OPTIONS_METADATA, injectable);


    const dependencyIndex = new DependencyIndex(injectable.constructor);
    Reflect.defineMetadata(
      MODULE_METADATA.PROVIDERS,
      [
        ...providers,
        {
          provide: options.provide,
          useFactory: async (...args) => {
            const [factory, ...rest] = args;
            if (!factory[method]) {
              throw new Error('Factory method is not defined');
            }
            const instance = await factory[method]();
            const depObject = dependencyIndex.remapDepsToObject(rest);
            const bean = new Bean(instance.constructor, depObject);
            await bean.setInstance(instance);
            return bean.createProxy();
          },
          inject: [injectable.constructor, ...dependencyIndex.getArray()],
        },
      ],
      matchedModule,
    );

    const providers22: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, matchedModule) || [];

    const exports2: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, matchedModule) || [];

    const imports2: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, matchedModule) || [];

    console.log(matchedModule);
  }

  console.log('Auto matched modules');
};
