import { applyDecorators, InjectableOptions } from '@nestjs/common';
import { getDecoratorCallerPath } from '@libs/discovery/utils';
import { AllInjectables } from '@libs/discovery/registry';
import {
  INJECTABLE_WATERMARK,
  SCOPE_OPTIONS_METADATA,
} from '@nestjs/common/constants';
import { InjectFactory, PROXY_INJECT_DEPS } from '@libs/discovery/const';

export function Injectable(
  options?: InjectableOptions & InjectFactory,
): ClassDecorator {
  return applyDecorators((target: any) => {
    const path = getDecoratorCallerPath();
    const index = `${path}||${target.name}`;

    AllInjectables[index] = target;
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
    const deps = Reflect.getMetadata(PROXY_INJECT_DEPS, target) || {};
    Reflect.defineMetadata(
      PROXY_INJECT_DEPS,
      { ...deps, ...options?.inject },
      target,
    );
  });
}
