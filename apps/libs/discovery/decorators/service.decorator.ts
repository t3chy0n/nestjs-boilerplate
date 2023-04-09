import { applyDecorators, InjectableOptions } from '@nestjs/common';
import { getDecoratorCallerPath } from '@libs/discovery/utils';
import { AllServices } from '@libs/discovery/registry';
import {
  INJECTABLE_WATERMARK,
  SCOPE_OPTIONS_METADATA,
} from '@nestjs/common/constants';
import { InjectFactory } from '@libs/discovery/const';

export function Service(
  options?: InjectableOptions & InjectFactory,
): ClassDecorator {
  return applyDecorators( (target: any) => {
    const path = getDecoratorCallerPath();
    const index = `${path}||${target.name}`;
    AllServices[index] = target;
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  });
}
