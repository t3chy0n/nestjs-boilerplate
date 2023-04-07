import { InjectableOptions } from '@nestjs/common';
import { getDecoratorCallerPath } from '@libs/discovery/utils';
import { AllServices } from '@libs/discovery/registry';
import {
  INJECTABLE_WATERMARK,
  SCOPE_OPTIONS_METADATA,
} from '@nestjs/common/constants';

export function Controller(options?: InjectableOptions): ClassDecorator {
  return (target: object) => {
    const path = getDecoratorCallerPath();
    AllServices[path] = target;
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  };
}
