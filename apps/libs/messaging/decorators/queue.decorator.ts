import { SetMetadata } from '@nestjs/common';
import { QUEUE_METADATA_KEY } from '@libs/messaging/consts';
import { MessagingMetadata } from '@libs/messaging/dto/messaging.metadata';

export const QueueDecorator = (queue: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata<string, MessagingMetadata>(QUEUE_METADATA_KEY, {
      queue,
      targetClass: target.constructor,
      targetName: target.constructor.name,
      methodName: propertyKey,
      callback: descriptor.value,
    })(target, propertyKey, descriptor);
  };
};
