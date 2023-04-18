import { applyDecorators, FactoryProvider } from '@nestjs/common';
import {
  INJECTABLE_WATERMARK,
  SCOPE_OPTIONS_METADATA,
} from '@nestjs/common/constants';
import { FACTORY_USED_METHOD_NAME } from '@libs/discovery/const';
import { AllFactories } from '@libs/discovery/registry';
import { getDecoratorCallerPath } from '@libs/discovery/utils';

export function Factory(
  options?: Omit<FactoryProvider, 'useFactory'>,
): MethodDecorator {
  return applyDecorators((target: any, key: string, descriptor: any) => {
    const path = getDecoratorCallerPath();
    const index = `${path}||${target.name}`;
    AllFactories[index] = target;
    const oldOptions = Reflect.getMetadata(
      SCOPE_OPTIONS_METADATA,
      descriptor.value ?? target,
    );
    Reflect.defineMetadata(
      SCOPE_OPTIONS_METADATA,
      { ...oldOptions, ...options },
      descriptor.value ?? target,
    );
    Reflect.defineMetadata(FACTORY_USED_METHOD_NAME, key, descriptor.value ?? target);
  });
}
