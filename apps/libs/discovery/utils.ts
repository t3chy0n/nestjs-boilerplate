import {
  AllFactories,
  AllInjectables,
  AllModules,
} from '@libs/discovery/registry';
import { getCommonPath } from '@libs/discovery/get-common-path';
import { Provider } from '@nestjs/common';
import {
  MODULE_METADATA,
  SCOPE_OPTIONS_METADATA,
} from '@nestjs/common/constants';
import { pairs } from '@libs/iterators';
import {
  FACTORY_USED_METHOD_NAME,
  ADVICES_BELONGS_TO,
  ADVICES_ENSURE_PARENT_IMPORTS,
} from '@libs/discovery/const';
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';

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

export const moduleAutoMatch = () => {
  for (const [injectablePath, injectable] of pairs(AllInjectables)) {
    const moduleAssosiation = Reflect.getMetadata(
      ADVICES_BELONGS_TO,
      injectable,
    );

    if (moduleAssosiation) {
      return;
    }

    const matchedModule = getBestMatchingModule(injectablePath);
    const providers: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, matchedModule) || [];

    Reflect.defineMetadata(
      MODULE_METADATA.PROVIDERS,
      [...providers, injectable],
      matchedModule,
    );
    console.log(matchedModule);
  }
  for (const [injectablePath, injectable] of pairs(AllFactories)) {
    const matchedModule = getBestMatchingModule(injectablePath);
    const providers: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, matchedModule) || [];

    const method = Reflect.getMetadata(FACTORY_USED_METHOD_NAME, injectable);
    const options = Reflect.getMetadata(SCOPE_OPTIONS_METADATA, injectable);
    Reflect.defineMetadata(
      MODULE_METADATA.PROVIDERS,
      [
        ...providers,
        {
          provide: options.provide,
          useFactory: async (factory) => {
            if (!factory[method]) {
              throw new Error('Factory method is not defined');
            }
            return await factory[method]();
          },
          inject: [injectable.constructor],
        },
      ],
      matchedModule,
    );
    const parentImports: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, matchedModule) || [];
    const ensureImports: Provider[] =
      Reflect.getMetadata(ADVICES_ENSURE_PARENT_IMPORTS, injectable) || [];

    Reflect.defineMetadata(
      MODULE_METADATA.IMPORTS,
      [...parentImports, ...ensureImports].filter((m) => m !== matchedModule),
      matchedModule,
    );

    console.log(matchedModule);
  }

  console.log('Auto matched modules');
};
