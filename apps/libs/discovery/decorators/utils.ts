import { assignMetadata, PipeTransform, Type } from '@nestjs/common';
import { BEAN_METHOD_ARGS_METADATA_KEY } from '@libs/discovery/const';
import { MessagingParamType } from '@libs/messaging/decorators/message.decorator';

export type ClassDecorator<T = any> = (
  constructor: new (...args: any[]) => T,
) => void;
export type MethodDecorator = (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<any>,
) => void;
export type FieldDecorator = (
  target: any,
  propertyKey: string | symbol,
) => void;

export function isClassDecorator<T>(
  args: any[],
): args is [new (...args: any[]) => T] {
  return (
    args.length === 1 && typeof args[0] === 'function' && !!args[0].prototype
  );
}

export function isMethodDecorator(args: any[]): args is [any, any, any] {
  return args.length === 3 && typeof args[1] === 'string' && !!args[2]?.value;
}

export function isFieldDecorator(args: any[]): args is [any, any] {
  return args.length >= 2 && typeof args[1] === 'string' && !args[2]?.value;
}

export function createParamDecorator(
  paramtype: MessagingParamType,
): (...pipes: (Type<PipeTransform> | PipeTransform)[]) => ParameterDecorator {
  return (...pipes: (Type<PipeTransform> | PipeTransform)[]) =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(
          BEAN_METHOD_ARGS_METADATA_KEY,
          target.constructor,
          key,
        ) || {};
      Reflect.defineMetadata(
        BEAN_METHOD_ARGS_METADATA_KEY,
        assignMetadata(args, paramtype, index, undefined, ...pipes),
        target.constructor,
        key,
      );
    };
}
