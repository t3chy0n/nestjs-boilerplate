import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import 'reflect-metadata';
import {
  applyDecorators,
  assignMetadata,
  PipeTransform,
  SetMetadata,
  Type,
} from '@nestjs/common';

import {
  FLINK_ARGS_METADATA,
  FLINK_CONFIG_TOKEN,
  FLINK_HANDLER,
  FlinkFunctionConfig,
} from './flink.contsnts';

export function FlinkHandler(config: FlinkFunctionConfig) {
  return applyDecorators(SetMetadata(FLINK_HANDLER, config));
}

export enum FlinkParamTypes {
  CONTEXT,
  MESSAGE,

  STORAGE,
  MESSAGE_AS,
}

export function createFlinkParamDecorator(paramtype: FlinkParamTypes) {
  return (...pipes: (Type<PipeTransform> | PipeTransform)[]) =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(FLINK_ARGS_METADATA, target.constructor, key) || {};
      Reflect.defineMetadata(
        FLINK_ARGS_METADATA,
        assignMetadata(args, paramtype, index, undefined, ...pipes),
        target.constructor,
        key,
      );
    };
}

export const Context = createFlinkParamDecorator(FlinkParamTypes.CONTEXT);
export const Storage = createFlinkParamDecorator(FlinkParamTypes.STORAGE);
export const Message = createFlinkParamDecorator(FlinkParamTypes.MESSAGE);
export const MessageAs = createFlinkParamDecorator(FlinkParamTypes.MESSAGE_AS);

export const InjectFlinkConfig = makeInjectableDecorator(FLINK_CONFIG_TOKEN);
