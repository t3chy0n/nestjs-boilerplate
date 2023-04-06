import { InjectableOptions } from '@nestjs/common';
import { getDecoratorCallerPath } from '@libs/discovery/utils';
import { AllInjectables } from '@libs/discovery/registry';
import {
  INJECTABLE_WATERMARK,
  SCOPE_OPTIONS_METADATA,
} from '@nestjs/common/constants';

export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (target: object) => {
    const path = getDecoratorCallerPath();
    AllInjectables[path] = target;
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  };
}
