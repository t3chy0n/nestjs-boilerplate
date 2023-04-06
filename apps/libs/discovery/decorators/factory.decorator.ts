import { FactoryProvider } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { FACTORY_USED_METHOD_NAME } from '@libs/discovery/const';
import { AllFactories } from '@libs/discovery/registry';
import { getDecoratorCallerPath } from '@libs/discovery/utils';

export function Factory(
  options?: Omit<FactoryProvider, 'useFactory'>,
): MethodDecorator {
  return (target: object, key?: string) => {
    if (!key) {
      throw new Error('Factory decorator Has to be used on method');
    }

    const path = getDecoratorCallerPath();
    AllFactories[path] = target;
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
    Reflect.defineMetadata(FACTORY_USED_METHOD_NAME, key, target);
  };
}
