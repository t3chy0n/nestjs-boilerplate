import { InjectableOptions } from '@nestjs/common';
import { InjectFactory } from '@libs/discovery/const';
import { Injectable } from '@libs/discovery';

export function NonInjectable(
  options?: InjectableOptions & InjectFactory,
): ClassDecorator {
  return Injectable({
    ...options,
    nonInjectable: true,
  });
}
