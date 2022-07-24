import { assignMetadata, PipeTransform, Type } from '@nestjs/common';
import { MESSAGING_ARGS_METADATA_KEY } from '@libs/messaging/consts';

export enum MessagingParamtype {
  MESSAGE = 0,
  PAYLOAD = 1,
  CONNECTION = 2,
}

export function createMessagingParamDecorator(
  paramtype: MessagingParamtype,
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
  MessagingParamtype.MESSAGE,
);
export const Connection = createMessagingParamDecorator(
  MessagingParamtype.CONNECTION,
);
export const Payload = createMessagingParamDecorator(
  MessagingParamtype.PAYLOAD,
);
