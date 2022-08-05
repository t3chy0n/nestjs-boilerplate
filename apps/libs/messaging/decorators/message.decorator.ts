import { assignMetadata, PipeTransform, Type } from '@nestjs/common';
import { MESSAGING_ARGS_METADATA_KEY } from '@libs/messaging/consts';

export enum MessagingParamType {
  INCOMING_CONFIGURATION = 0,
  MESSAGE = 2,
}

export function createMessagingParamDecorator(
  paramtype: MessagingParamType,
): (...pipes: (Type<PipeTransform> | PipeTransform)[]) => ParameterDecorator {
  return (...pipes: (Type<PipeTransform> | PipeTransform)[]) =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(
          MESSAGING_ARGS_METADATA_KEY,
          target.constructor,
          key,
        ) || {};
      Reflect.defineMetadata(
        MESSAGING_ARGS_METADATA_KEY,
        assignMetadata(args, paramtype, index, undefined, ...pipes),
        target.constructor,
        key,
      );
    };
}

export const Message = createMessagingParamDecorator(
  MessagingParamType.MESSAGE,
);
export const IncomingConfiguration = createMessagingParamDecorator(
  MessagingParamType.INCOMING_CONFIGURATION,
);
