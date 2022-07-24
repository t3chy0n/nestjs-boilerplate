import { SetMetadata } from '@nestjs/common';
import { MessagingMetadata } from '@libs/messaging/dto/messaging.metadata';
import { DRIVER_METADATA_KEY, MessagingDriver } from '@libs/messaging/consts';

export const Driver = (driver: MessagingDriver) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata<string, MessagingMetadata>(DRIVER_METADATA_KEY, {
      driver,
      targetClass: target.constructor,
      targetName: target.constructor.name,
      methodName: propertyKey,
      callback: descriptor.value,
    })(target, propertyKey, descriptor);
  };
};
