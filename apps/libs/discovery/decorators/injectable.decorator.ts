import { applyDecorators, InjectableOptions } from '@nestjs/common';
import { getDecoratorCallerPath } from '@libs/discovery/utils';
import { AllInjectables } from '@libs/discovery/registry';
import {
  INJECTABLE_WATERMARK,
  PROPERTY_DEPS_METADATA,
  SCOPE_OPTIONS_METADATA,
  SELF_DECLARED_DEPS_METADATA,
} from '@nestjs/common/constants';
import { InjectFactory, PROXY_INJECT_DEPS } from '@libs/discovery/const';

export function Injectable(
  options?: InjectableOptions & InjectFactory,
): ClassDecorator {
  return (target: any) => {
    const constructor = target.name ? target : target.constructor;

    const path = getDecoratorCallerPath();
    const index = `${path}||${constructor.name}`;

    AllInjectables[index] = target;
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, constructor);

    const oldOptions = Reflect.getMetadata(SCOPE_OPTIONS_METADATA, target);
    Reflect.defineMetadata(
      SCOPE_OPTIONS_METADATA,
      { ...oldOptions, ...options },
      target,
    );
    const deps = Reflect.getMetadata(PROXY_INJECT_DEPS, constructor) || {};
    Reflect.defineMetadata(
      PROXY_INJECT_DEPS,
      { ...deps, ...options?.inject },
      constructor,
    );
  };
}
