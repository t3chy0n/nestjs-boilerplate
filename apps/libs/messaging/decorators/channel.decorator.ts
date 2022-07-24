import { SetMetadata } from '@nestjs/common';
import { MessagingMetadata } from '@libs/messaging/dto/messaging.metadata';
import { CHANNEL_METADATA_KEY } from '@libs/messaging/consts';

export const Channel = (event: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata<string, MessagingMetadata>(CHANNEL_METADATA_KEY, {
      event,
      targetClass: target.constructor,
      targetName: target.constructor.name,
      methodName: propertyKey,
      callback: descriptor.value,
    })(target, propertyKey, descriptor);
  };
};
