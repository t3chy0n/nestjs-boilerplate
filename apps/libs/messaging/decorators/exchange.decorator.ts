import { SetMetadata } from '@nestjs/common';
import { EXCHANGE_METADATA_KEY } from '@libs/messaging/consts';
import { MessagingMetadata } from '@libs/messaging/dto/messaging.metadata';

export const ExchangeDecorator = (exchange: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata<string, MessagingMetadata>(EXCHANGE_METADATA_KEY, {
      exchange,
      targetClass: target.constructor,
      targetName: target.constructor.name,
      methodName: propertyKey,
      callback: descriptor.value,
    })(target, propertyKey, descriptor);
  };
};
